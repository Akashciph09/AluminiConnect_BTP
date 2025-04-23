const express = require('express');
const router = express.Router();
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Profile = require('../models/Profile');

// Send mentorship request
router.post('/request', auth, async (req, res) => {
    try {
        const { mentorId } = req.body;
        console.log('Received mentorship request:', { mentorId, studentId: req.user.id });
        
        // Validate request body
        if (!mentorId) {
            return res.status(400).json({ message: 'Mentor ID is required' });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(mentorId)) {
            return res.status(400).json({ message: 'Invalid mentor ID format' });
        }

        // Check if user is a student
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can send mentorship requests' });
        }

        // Check if mentor exists and is an alumni
        const mentor = await User.findById(mentorId).select('role email');
        console.log('Found mentor:', mentor);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        if (mentor.role !== 'alumni') {
            return res.status(400).json({ message: 'Selected user is not an alumni' });
        }

        // Check for existing request
        const existingRequest = await MentorshipRequest.findOne({
            mentorId: mentorId,
            studentId: req.user.id,
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            return res.status(400).json({ 
                message: 'You already have an active request with this mentor',
                existingRequest
            });
        }

        // Create new mentorship request
        const mentorshipRequest = new MentorshipRequest({
            mentorId: new mongoose.Types.ObjectId(mentorId),
            studentId: new mongoose.Types.ObjectId(req.user.id),
            status: 'pending'
        });

        await mentorshipRequest.save();
        console.log('Saved mentorship request:', mentorshipRequest);

        // Populate the response with mentor details
        const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
            .populate({
                path: 'mentorId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            })
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating mentorship request:', error);
        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'You already have a request with this mentor' });
        }
        res.status(500).json({ 
            message: 'Error creating mentorship request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get mentorship requests for a student
router.get('/student-requests', auth, async (req, res) => {
    try {
        console.log('User making request:', {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        });

        if (req.user.role !== 'student') {
            console.log('Access denied: User is not a student');
            return res.status(403).json({ message: 'Only students can view their mentorship requests' });
        }

        console.log('Fetching requests for student:', req.user.id);

        // First, get all mentorship requests for this student
        const requests = await MentorshipRequest.find({ studentId: req.user.id })
            .populate({
                path: 'mentorId',
                select: 'name email profile',
                model: 'User'
            })
            .populate({
                path: 'studentId',
                select: 'name email profile',
                model: 'User'
            })
            .lean();

        console.log('Found requests:', requests.length);
        console.log('Raw requests data:', JSON.stringify(requests, null, 2));

        // Verify the populated data
        requests.forEach((request, index) => {
            console.log(`Request ${index + 1}:`, {
                id: request._id,
                student: {
                    id: request.studentId?._id,
                    name: request.studentId?.name,
                    email: request.studentId?.email,
                    profile: request.studentId?.profile
                },
                mentor: {
                    id: request.mentorId?._id,
                    name: request.mentorId?.name,
                    email: request.mentorId?.email,
                    profile: request.mentorId?.profile
                },
                status: request.status
            });
        });
        
        // Transform the data to match the expected format
        const transformedRequests = requests.map(request => {
            // Ensure we have valid student and mentor data
            if (!request.studentId || !request.mentorId) {
                console.warn('Invalid request data:', request);
                return null;
            }

            return {
                _id: request._id,
                mentor: {
                    _id: request.mentorId._id,
                    name: request.mentorId.name || 'Unknown Mentor',
                    email: request.mentorId.email || 'No email available',
                    profile: request.mentorId.profile || {}
                },
                student: {
                    _id: request.studentId._id,
                    name: request.studentId.name || 'Unknown Student',
                    email: request.studentId.email || 'No email available',
                    profile: request.studentId.profile || {}
                },
                status: request.status,
                createdAt: request.createdAt,
                updatedAt: request.updatedAt
            };
        }).filter(Boolean); // Remove any null entries

        console.log('Transformed requests:', JSON.stringify(transformedRequests, null, 2));
        res.json(transformedRequests);
    } catch (error) {
        console.error('Error fetching student requests:', error);
        res.status(500).json({ 
            message: 'Error fetching mentorship requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get mentorship requests for an alumni
router.get('/mentor-requests', auth, async (req, res) => {
    try {
        console.log('Fetching mentorship requests for mentor:', {
            mentorId: req.user.id,
            mentorEmail: req.user.email,
            mentorRole: req.user.role
        });
        
        // Find all requests for this mentor
        const requests = await MentorshipRequest.find({ mentorId: req.user.id })
            .populate({
                path: 'studentId',
                select: 'name email profilePicture'
            })
            .populate({
                path: 'mentorId',
                select: 'name email profilePicture'
            });

        console.log('Found requests:', requests.length);
        console.log('Requests details:', requests.map(req => ({
            _id: req._id,
            student: req.studentId ? {
                id: req.studentId._id,
                name: req.studentId.name,
                email: req.studentId.email
            } : null,
            mentor: req.mentorId ? {
                id: req.mentorId._id,
                name: req.mentorId.name,
                email: req.mentorId.email
            } : null,
            status: req.status
        })));
        
        // Transform the data to match frontend expectations
        const transformedRequests = requests.map(request => ({
            _id: request._id,
            student: request.studentId ? {
                _id: request.studentId._id,
                name: request.studentId.name || 'Unknown Student',
                email: request.studentId.email || 'No email provided',
                profilePicture: request.studentId.profilePicture
            } : null,
            mentor: request.mentorId ? {
                _id: request.mentorId._id,
                name: request.mentorId.name || 'Unknown Mentor',
                email: request.mentorId.email || 'No email provided',
                profilePicture: request.mentorId.profilePicture
            } : null,
            status: request.status,
            message: request.message,
            requestedAt: request.requestedAt
        }));

        console.log('Transformed requests:', transformedRequests);
        res.json(transformedRequests);
    } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        res.status(500).json({ message: 'Error fetching mentorship requests' });
    }
});

// Update mentorship request status
router.patch('/:requestId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const { requestId } = req.params;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const request = await MentorshipRequest.findById(requestId)
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        if (!request) {
            return res.status(404).json({ message: 'Mentorship request not found' });
        }

        if (request.mentorId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this request' });
        }

        request.status = status;
        await request.save();

        // Populate the response with updated data
        const updatedRequest = await MentorshipRequest.findById(requestId)
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        res.json(updatedRequest);
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ message: 'Error updating mentorship request' });
    }
});

// Test route to create a sample mentorship request
router.post('/test-request', auth, async (req, res) => {
    try {
        console.log('Creating test request for user:', {
            userId: req.user.id,
            email: req.user.email,
            role: req.user.role
        });

        // Get all students
        const students = await User.find({ role: 'student' });
        console.log('Found students:', students.length);
        
        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found in database' });
        }

        // Use the first student
        const student = students[0];
        console.log('Using student:', {
            id: student._id,
            name: student.name,
            email: student.email
        });

        // Check if request already exists
        const existingRequest = await MentorshipRequest.findOne({
            studentId: student._id,
            mentorId: req.user.id
        });

        if (existingRequest) {
            console.log('Request already exists:', {
                id: existingRequest._id,
                status: existingRequest.status
            });
            return res.status(400).json({ 
                message: 'Request already exists',
                request: existingRequest
            });
        }

        // Create a mentorship request
        const mentorshipRequest = new MentorshipRequest({
            studentId: student._id,
            mentorId: req.user.id,
            status: 'pending',
            message: 'This is a test mentorship request'
        });

        await mentorshipRequest.save();
        console.log('Created new request:', {
            id: mentorshipRequest._id,
            studentId: mentorshipRequest.studentId,
            mentorId: mentorshipRequest.mentorId,
            status: mentorshipRequest.status
        });

        // Populate the response
        const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture currentPosition'
                }
            });

        console.log('Populated request:', {
            id: populatedRequest._id,
            student: {
                id: populatedRequest.studentId._id,
                name: populatedRequest.studentId.name,
                email: populatedRequest.studentId.email
            },
            status: populatedRequest.status
        });

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating test request:', error);
        res.status(500).json({ 
            message: 'Error creating test request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test route to verify database connection and data
router.get('/test-db', async (req, res) => {
    try {
        console.log('Testing database connection and data...');
        
        // Check if we can connect to the database
        const dbStatus = mongoose.connection.readyState;
        console.log('Database connection status:', dbStatus);
        
        // Count total mentorship requests
        const totalRequests = await MentorshipRequest.countDocuments({});
        console.log('Total mentorship requests in database:', totalRequests);
        
        // Get all students
        const students = await User.find({ role: 'student' });
        console.log('Total students:', students.length);
        if (students.length > 0) {
            console.log('Sample student:', {
                id: students[0]._id,
                name: students[0].name,
                email: students[0].email
            });
        }
        
        // Get all alumni
        const alumni = await User.find({ role: 'alumni' });
        console.log('Total alumni:', alumni.length);
        if (alumni.length > 0) {
            console.log('Sample alumni:', {
                id: alumni[0]._id,
                name: alumni[0].name,
                email: alumni[0].email
            });
        }
        
        // Get a sample request if any exists
        const sampleRequest = await MentorshipRequest.findOne({});
        console.log('Sample request:', sampleRequest ? {
            _id: sampleRequest._id,
            mentorId: sampleRequest.mentorId,
            studentId: sampleRequest.studentId,
            status: sampleRequest.status
        } : 'No requests found');
        
        res.json({
            dbStatus,
            totalRequests,
            totalStudents: students.length,
            totalAlumni: alumni.length,
            sampleRequest: sampleRequest || null
        });
    } catch (error) {
        console.error('Error in test route:', error);
        res.status(500).json({ 
            message: 'Error testing database',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to check specific mentorship request
router.get('/check-request/:studentEmail/:mentorEmail', auth, async (req, res) => {
    try {
        const { studentEmail, mentorEmail } = req.params;
        console.log('Checking mentorship request between:', {
            studentEmail,
            mentorEmail
        });

        // Find the student and mentor users
        const student = await User.findOne({ email: studentEmail, role: 'student' });
        const mentor = await User.findOne({ email: mentorEmail, role: 'alumni' });

        console.log('Found users:', {
            student: student ? {
                id: student._id,
                name: student.name,
                email: student.email
            } : 'Student not found',
            mentor: mentor ? {
                id: mentor._id,
                name: mentor.name,
                email: mentor.email
            } : 'Mentor not found'
        });

        if (!student || !mentor) {
            return res.status(404).json({
                message: 'Student or mentor not found',
                studentFound: !!student,
                mentorFound: !!mentor
            });
        }

        // Find the mentorship request
        const request = await MentorshipRequest.findOne({
            studentId: student._id,
            mentorId: mentor._id
        }).populate('studentId', 'name email')
          .populate('mentorId', 'name email');

        console.log('Found mentorship request:', request ? {
            id: request._id,
            student: {
                id: request.studentId._id,
                name: request.studentId.name,
                email: request.studentId.email
            },
            mentor: {
                id: request.mentorId._id,
                name: request.mentorId.name,
                email: request.mentorId.email
            },
            status: request.status,
            message: request.message,
            requestedAt: request.requestedAt
        } : 'No request found');

        if (!request) {
            return res.status(404).json({
                message: 'No mentorship request found between these users'
            });
        }

        res.json({
            message: 'Mentorship request found',
            request
        });
    } catch (error) {
        console.error('Error checking mentorship request:', error);
        res.status(500).json({
            message: 'Error checking mentorship request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to get all mentorship requests (for debugging)
router.get('/all-requests', auth, async (req, res) => {
    try {
        console.log('Fetching all mentorship requests...');
        
        // Get all requests
        const allRequests = await MentorshipRequest.find({})
            .populate({
                path: 'studentId',
                select: 'name email profile'
            })
            .populate({
                path: 'mentorId',
                select: 'name email'
            })
            .sort({ createdAt: -1 });

        console.log('Total requests found:', allRequests.length);
        
        // Log each request
        allRequests.forEach((request, index) => {
            console.log(`Request ${index + 1}:`, {
                id: request._id,
                student: {
                    id: request.studentId?._id,
                    name: request.studentId?.name,
                    email: request.studentId?.email
                },
                mentor: {
                    id: request.mentorId?._id,
                    name: request.mentorId?.name,
                    email: request.mentorId?.email
                },
                status: request.status
            });
        });

        res.json(allRequests);
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({
            message: 'Error fetching all mentorship requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to register for a workshop
router.post('/:id/register', auth, async (req, res) => {
    try {
        // Check if user is a student
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Only students can register for workshops' });
        }
        // ...
    } catch (error) {
        console.error('Error registering for workshop:', error);
        res.status(500).json({ 
            message: 'Error registering for workshop',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to list all students (for testing)
router.get('/list-students', auth, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name email profile')
            .populate('profile', 'branch graduationYear');
        
        console.log('Found students:', students.length);
        students.forEach(student => {
            console.log('Student:', {
                id: student._id,
                name: student.name,
                email: student.email,
                profile: student.profile
            });
        });

        res.json(students);
    } catch (error) {
        console.error('Error listing students:', error);
        res.status(500).json({ 
            message: 'Error listing students',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to create a test mentorship request with a specific student
router.post('/create-test-request/:studentId', auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        console.log('Creating test request with student:', studentId);

        // Verify the student exists
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Create the mentorship request
        const mentorshipRequest = new MentorshipRequest({
            studentId: student._id,
            mentorId: req.user.id,
            status: 'pending',
            message: 'This is a test mentorship request'
        });

        await mentorshipRequest.save();

        // Populate and return the request
        const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        console.log('Created test request:', {
            id: populatedRequest._id,
            student: {
                id: populatedRequest.studentId._id,
                name: populatedRequest.studentId.name,
                email: populatedRequest.studentId.email
            },
            status: populatedRequest.status
        });

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating test request:', error);
        res.status(500).json({ 
            message: 'Error creating test request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create a test mentorship request
router.post('/create-test-request', auth, async (req, res) => {
    try {
        console.log('Creating test mentorship request...');
        console.log('Current user:', {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        });
        
        // Find a student
        const student = await User.findOne({ role: 'student' });
        if (!student) {
            console.log('No students found in database');
            return res.status(404).json({ message: 'No students found in database' });
        }

        console.log('Found student:', {
            id: student._id,
            name: student.name,
            email: student.email
        });

        // Check if request already exists
        const existingRequest = await MentorshipRequest.findOne({
            studentId: student._id,
            mentorId: req.user.id
        });

        if (existingRequest) {
            console.log('Request already exists:', {
                id: existingRequest._id,
                status: existingRequest.status
            });
            return res.status(400).json({ 
                message: 'Request already exists',
                request: existingRequest
            });
        }

        // Create a mentorship request
        const mentorshipRequest = new MentorshipRequest({
            studentId: student._id,
            mentorId: req.user.id,
            status: 'pending',
            message: 'This is a test mentorship request'
        });

        await mentorshipRequest.save();
        console.log('Created new request:', {
            id: mentorshipRequest._id,
            studentId: mentorshipRequest.studentId,
            mentorId: mentorshipRequest.mentorId,
            status: mentorshipRequest.status
        });

        // Populate and return the request
        const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
            .populate({
                path: 'studentId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            })
            .populate({
                path: 'mentorId',
                select: 'name email profile',
                populate: {
                    path: 'profile',
                    select: 'branch graduationYear profilePicture'
                }
            });

        console.log('Populated request:', {
            id: populatedRequest._id,
            student: {
                id: populatedRequest.studentId._id,
                name: populatedRequest.studentId.name,
                email: populatedRequest.studentId.email
            },
            mentor: {
                id: populatedRequest.mentorId._id,
                name: populatedRequest.mentorId.name,
                email: populatedRequest.mentorId.email
            },
            status: populatedRequest.status
        });

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating test request:', error);
        res.status(500).json({ 
            message: 'Error creating test request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test route to check database connection and data
router.get('/test-db-connection', auth, async (req, res) => {
    try {
        console.log('Testing database connection...');
        
        // Check database connection
        const dbStatus = mongoose.connection.readyState;
        console.log('Database connection status:', dbStatus);
        
        // Check if we can access the MentorshipRequest collection
        const collectionExists = await mongoose.connection.db.listCollections({ name: 'mentorshiprequests' }).hasNext();
        console.log('MentorshipRequest collection exists:', collectionExists);
        
        // Count total documents in the collection
        const totalDocs = await MentorshipRequest.countDocuments({});
        console.log('Total documents in MentorshipRequest collection:', totalDocs);
        
        // Get all documents
        const allDocs = await MentorshipRequest.find({}).lean();
        console.log('All documents:', allDocs);
        
        res.json({
            dbStatus,
            collectionExists,
            totalDocs,
            allDocs
        });
    } catch (error) {
        console.error('Error testing database connection:', error);
        res.status(500).json({ 
            message: 'Error testing database connection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Initialize database connection and collection
router.get('/init-db', auth, async (req, res) => {
    try {
        console.log('Initializing database connection...');
        
        // Check database connection
        const dbStatus = mongoose.connection.readyState;
        console.log('Database connection status:', dbStatus);
        
        if (dbStatus !== 1) {
            throw new Error('Database not connected');
        }
        
        // Check if collection exists
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        console.log('Existing collections:', collectionNames);
        
        // Create collection if it doesn't exist
        if (!collectionNames.includes('mentorshiprequests')) {
            console.log('Creating MentorshipRequest collection...');
            await mongoose.connection.db.createCollection('mentorshiprequests');
            console.log('MentorshipRequest collection created');
        }
        
        // Create indexes
        await MentorshipRequest.createIndexes();
        console.log('Indexes created');
        
        // Count documents
        const count = await MentorshipRequest.countDocuments({});
        console.log('Total documents in collection:', count);
        
        res.json({
            status: 'success',
            dbStatus,
            collectionExists: collectionNames.includes('mentorshiprequests'),
            totalDocuments: count
        });
    } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error initializing database',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Route to create test data
router.post('/create-test-data', auth, async (req, res) => {
    try {
        console.log('Creating test data...');
        
        // Create test student if it doesn't exist
        let student = await User.findOne({ email: 'test.student@example.com' });
        if (!student) {
            console.log('Creating test student...');
            student = new User({
                name: 'Test Student',
                email: 'test.student@example.com',
                password: 'password123',
                role: 'student'
            });
            await student.save();
            
            // Create profile for student
            const profile = new Profile({
                userId: student._id,
                branch: 'Computer Science',
                graduationYear: 2024,
                skills: ['JavaScript', 'React', 'Node.js'],
                bio: 'Test student for mentorship system'
            });
            await profile.save();
            
            student.profile = profile._id;
            await student.save();
            console.log('Test student created:', {
                id: student._id,
                name: student.name,
                email: student.email
            });
        }

        // Create test mentorship request
        const existingRequest = await MentorshipRequest.findOne({
            studentId: student._id,
            mentorId: req.user.id
        });

        if (!existingRequest) {
            console.log('Creating test mentorship request...');
            const mentorshipRequest = new MentorshipRequest({
                studentId: student._id,
                mentorId: req.user.id,
                status: 'pending',
                message: 'This is a test mentorship request'
            });
            await mentorshipRequest.save();
            console.log('Test request created:', {
                id: mentorshipRequest._id,
                studentId: mentorshipRequest.studentId,
                mentorId: mentorshipRequest.mentorId,
                status: mentorshipRequest.status
            });
        }

        res.json({
            message: 'Test data created successfully',
            student: {
                id: student._id,
                name: student.name,
                email: student.email
            }
        });
    } catch (error) {
        console.error('Error creating test data:', error);
        res.status(500).json({ 
            message: 'Error creating test data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test route to check database state
router.get('/test-db-state', auth, async (req, res) => {
    try {
        console.log('Checking database state...');
        
        // Check total requests
        const totalRequests = await MentorshipRequest.countDocuments({});
        console.log('Total requests in database:', totalRequests);
        
        // Get all requests
        const allRequests = await MentorshipRequest.find({})
            .populate('mentorId', 'name email')
            .populate('studentId', 'name email')
            .lean();
            
        console.log('All requests:', allRequests);
        
        res.json({
            totalRequests,
            allRequests
        });
    } catch (error) {
        console.error('Error checking database state:', error);
        res.status(500).json({ 
            message: 'Error checking database state',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Create a test mentorship request with proper student data
router.post('/create-test-request-with-student', auth, async (req, res) => {
    try {
        console.log('Creating test mentorship request with student data...');
        
        // Find or create a test student
        let student = await User.findOne({ email: 'test.student@example.com' });
        if (!student) {
            console.log('Creating test student...');
            student = new User({
                name: 'Test Student',
                email: 'test.student@example.com',
                password: 'password123',
                role: 'student',
                profile: {
                    branch: 'Computer Science',
                    graduationYear: 2024,
                    skills: ['JavaScript', 'React', 'Node.js'],
                    bio: 'Test student for mentorship system'
                }
            });
            await student.save();
            console.log('Test student created:', {
                id: student._id,
                name: student.name,
                email: student.email
            });
        }

        // Create a mentorship request
        const mentorshipRequest = new MentorshipRequest({
            studentId: student._id,
            mentorId: req.user.id,
            status: 'pending',
            message: 'This is a test mentorship request'
        });

        await mentorshipRequest.save();
        console.log('Created test request:', {
            id: mentorshipRequest._id,
            studentId: mentorshipRequest.studentId,
            mentorId: mentorshipRequest.mentorId,
            status: mentorshipRequest.status
        });

        // Populate and return the request
        const populatedRequest = await MentorshipRequest.findById(mentorshipRequest._id)
            .populate({
                path: 'studentId',
                select: 'name email profile',
                model: 'User'
            })
            .populate({
                path: 'mentorId',
                select: 'name email profile',
                model: 'User'
            })
            .lean();

        console.log('Populated request:', {
            id: populatedRequest._id,
            student: {
                id: populatedRequest.studentId._id,
                name: populatedRequest.studentId.name,
                email: populatedRequest.studentId.email,
                profile: populatedRequest.studentId.profile
            },
            mentor: {
                id: populatedRequest.mentorId._id,
                name: populatedRequest.mentorId.name,
                email: populatedRequest.mentorId.email,
                profile: populatedRequest.mentorId.profile
            },
            status: populatedRequest.status
        });

        res.status(201).json(populatedRequest);
    } catch (error) {
        console.error('Error creating test request:', error);
        res.status(500).json({ 
            message: 'Error creating test request',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Debug route to check all mentorship requests
router.get('/debug/all-requests', auth, async (req, res) => {
    try {
        console.log('Fetching all mentorship requests...');
        
        // Get all requests
        const allRequests = await MentorshipRequest.find({})
            .populate({
                path: 'studentId',
                select: 'name email profile'
            })
            .populate({
                path: 'mentorId',
                select: 'name email'
            })
            .sort({ createdAt: -1 });

        console.log('Total requests found:', allRequests.length);
        
        // Log each request
        allRequests.forEach((request, index) => {
            console.log(`Request ${index + 1}:`, {
                id: request._id,
                student: {
                    id: request.studentId?._id,
                    name: request.studentId?.name,
                    email: request.studentId?.email
                },
                mentor: {
                    id: request.mentorId?._id,
                    name: request.mentorId?.name,
                    email: request.mentorId?.email
                },
                status: request.status
            });
        });

        res.json(allRequests);
    } catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({
            message: 'Error fetching all mentorship requests',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 