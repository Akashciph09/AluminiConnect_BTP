import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

function StudentMentorship() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [mentorshipRequests, setMentorshipRequests] = useState({});
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([fetchMentors(), fetchExistingRequests()]);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
    // Set up periodic refresh every 30 seconds to check for status updates
    const refreshInterval = setInterval(fetchExistingRequests, 30000);
    return () => clearInterval(refreshInterval);
  }, []);

  const fetchExistingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const response = await axios.get('http://localhost:3002/api/mentorship/student-requests', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Create a map of mentorId to request status and request object
        const requestsMap = {};
        response.data.forEach(request => {
          const mentorId = request.mentorId._id || request.mentorId;
          requestsMap[mentorId] = {
            status: request.status,
            requestId: request._id,
            updatedAt: request.updatedAt,
            message: request.message
          };
        });
        
        // Update the state with the latest request data
        setMentorshipRequests(requestsMap);
      }
    } catch (error) {
      console.error('Error fetching existing requests:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to fetch mentorship requests');
      }
    }
  };

  const fetchMentors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3002/api/users/alumni', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setMentors(response.data);
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to fetch mentors');
    }
  };

  const handleRequestMentorship = async (mentorId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      if (!mentorId) {
        setError('Mentor ID is required');
        return;
      }

      console.log('Sending mentorship request to mentor:', mentorId);

      // Check if there's already a request for this mentor
      const existingRequest = mentorshipRequests[mentorId];
      if (existingRequest?.status === 'pending' || existingRequest?.status === 'accepted') {
        setError('You already have an active request with this mentor');
        return;
      }

      // Immediately update UI to show pending status
      setMentorshipRequests(prev => ({
        ...prev,
        [mentorId]: {
          status: 'pending',
          updatedAt: new Date(),
          message: ''
        }
      }));

      const response = await axios.post(
        'http://localhost:3002/api/mentorship/request',
        { 
          mentorId,
          message: `I would like to request mentorship from you. I am interested in learning more about ${selectedMentor?.profile?.currentPosition || 'your field of expertise'}.`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Mentorship request response:', response.data);
      
      // Update the UI with the server response
      setMentorshipRequests(prev => ({
        ...prev,
        [mentorId]: {
          status: response.data.status,
          requestId: response.data._id,
          updatedAt: new Date(),
          message: response.data.message
        }
      }));

      setSuccess('Mentorship request sent successfully');
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      console.error('Error response:', error.response);
      
      // Only reset the UI state if the error is not a duplicate request
      if (error.response?.status !== 400 || !error.response?.data?.message?.includes('already have')) {
        setMentorshipRequests(prev => {
          const newState = { ...prev };
          delete newState[mentorId];
          return newState;
        });
      }

      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(error.response?.data?.message || 'Failed to send mentorship request');
      }
    }
  };

  const getRequestButtonText = (mentorId) => {
    const request = mentorshipRequests[mentorId];
    if (!request) return 'Request Mentorship';
    
    switch (request.status) {
      case 'pending':
        return 'Request Sent (Pending)';
      case 'accepted':
        return 'Mentorship Accepted';
      case 'rejected':
        return 'Request Mentorship';
      default:
        return 'Request Mentorship';
    }
  };

  const getRequestButtonColor = (mentorId) => {
    const request = mentorshipRequests[mentorId];
    if (!request) return 'primary';
    
    switch (request.status) {
      case 'pending':
        return 'info';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'primary';
      default:
        return 'primary';
    }
  };

  const getRequestButtonVariant = (mentorId) => {
    const request = mentorshipRequests[mentorId];
    if (!request) return 'contained';
    
    switch (request.status) {
      case 'pending':
        return 'outlined';
      case 'accepted':
        return 'contained';
      case 'rejected':
        return 'contained';
      default:
        return 'contained';
    }
  };

  const isRequestButtonDisabled = (mentorId) => {
    const request = mentorshipRequests[mentorId];
    // Disable button if there's a pending or accepted request
    return request?.status === 'pending' || request?.status === 'accepted';
  };

  // Add a function to check if a request can be sent
  const canSendRequest = (mentorId) => {
    const request = mentorshipRequests[mentorId];
    // Can send request if there's no existing request or if the previous request was rejected
    return !request || request.status === 'rejected';
  };

  const handleViewProfile = (mentor) => {
    setSelectedMentor(mentor);
    setProfileDialogOpen(true);
  };

  const handleCloseProfile = () => {
    setProfileDialogOpen(false);
    setSelectedMentor(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Available Mentors
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Connect with experienced alumni mentors to guide you in your career journey.
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {mentors.map((mentor) => (
          <Grid item xs={12} md={6} lg={4} key={mentor._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={mentor.profile?.profilePicture}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >
                    {mentor.name?.[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{mentor.name}</Typography>
                    <Typography color="textSecondary">
                      {mentor.profile?.currentPosition}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" paragraph>
                  {mentor.profile?.bio}
                </Typography>
                <Box mb={2}>
                  {mentor.profile?.skills?.slice(0, 3).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="textSecondary">
                  {mentor.profile?.company}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleRequestMentorship(mentor._id)}
                  disabled={isRequestButtonDisabled(mentor._id)}
                  variant={getRequestButtonVariant(mentor._id)}
                  color={getRequestButtonColor(mentor._id)}
                  sx={{
                    minWidth: '150px',
                    textTransform: 'none',
                    fontWeight: 'medium'
                  }}
                >
                  {getRequestButtonText(mentor._id)}
                </Button>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => handleViewProfile(mentor)}
                >
                  View Profile
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Profile Dialog */}
      <Dialog
        open={profileDialogOpen}
        onClose={handleCloseProfile}
        maxWidth="sm"
        fullWidth
      >
        {selectedMentor && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                <Avatar
                  src={selectedMentor.profile?.profilePicture}
                  sx={{ width: 56, height: 56, mr: 2 }}
                >
                  {selectedMentor.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedMentor.name}</Typography>
                  <Typography color="textSecondary">
                    {selectedMentor.profile?.currentPosition}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <BusinessIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Company"
                    secondary={selectedMentor.profile?.company || 'Not specified'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <WorkIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role"
                    secondary={selectedMentor.profile?.currentPosition || 'Not specified'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Graduation Year"
                    secondary={selectedMentor.profile?.graduationYear || 'Not specified'}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={selectedMentor.email}
                  />
                </ListItem>
              </List>
              {selectedMentor.profile?.bio && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    About
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {selectedMentor.profile.bio}
                  </Typography>
                </Box>
              )}
              {selectedMentor.profile?.skills && selectedMentor.profile.skills.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Skills
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedMentor.profile.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseProfile}>Close</Button>
              <Button
                onClick={() => {
                  handleCloseProfile();
                  handleRequestMentorship(selectedMentor._id);
                }}
                color="primary"
                disabled={isRequestButtonDisabled(selectedMentor._id)}
              >
                {getRequestButtonText(selectedMentor._id)}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentMentorship; 