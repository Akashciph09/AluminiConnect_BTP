router.get('/mentor-requests', auth, async (req, res) => {
    try {
        console.log('Fetching mentorship requests for mentor:', {
            mentorId: req.user.id,
            mentorEmail: req.user.email,
            mentorRole: req.user.role
        });
        
        // Find all requests for this specific mentor
        const requests = await MentorshipRequest.find({ mentorId: req.user.id })
            .populate({
                path: 'studentId',
                select: 'name email profilePicture'
            })
            .populate({
                path: 'mentorId',
                select: 'name email profilePicture'
            })
            .sort({ createdAt: -1 });

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
        
        res.json(requests);
    } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        res.status(500).json({ message: 'Error fetching mentorship requests', error: error.message });
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