import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Stack
} from '@mui/material';
import {
  Business as BusinessIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const Mentorship = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mentorshipRequests, setMentorshipRequests] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    fetchAlumni();
    fetchMentorshipRequests();
  }, []);

  const fetchAlumni = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/users/alumni', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(response.data)) {
        setAlumni(response.data);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError('Failed to fetch alumni');
      console.error('Error fetching alumni:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMentorshipRequests = async () => {
    try {
      const response = await axios.get('http://localhost:3002/api/mentorship/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMentorshipRequests(response.data);
    } catch (err) {
      console.error('Error fetching mentorship requests:', err);
    }
  };

  const handleSendRequest = async (mentorId) => {
    try {
      await axios.post(
        'http://localhost:3002/api/mentorship/request',
        { mentorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Mentorship request sent successfully');
      fetchMentorshipRequests();
    } catch (err) {
      setError('Failed to send mentorship request');
      console.error('Error sending mentorship request:', err);
    }
  };

  const getRequestButton = (mentorId) => {
    const request = mentorshipRequests.find(req => req.mentorId === mentorId);
    if (!request) {
      return (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSendRequest(mentorId)}
        >
          Send Request
        </Button>
      );
    }
    switch (request.status) {
      case 'pending':
        return <Button variant="outlined" disabled>Pending</Button>;
      case 'accepted':
        return <Button variant="contained" color="success" disabled>Request Accepted</Button>;
      case 'rejected':
        return <Button variant="outlined" color="error" disabled>Request Rejected</Button>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Available Mentors
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Connect with experienced alumni who can guide you in your career journey.
      </Typography>

      <Grid container spacing={3}>
        {alumni.map((alumnus) => (
          <Grid item xs={12} sm={6} md={4} key={alumnus._id}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Avatar
                    src={alumnus.profile?.profilePicture}
                    alt={alumnus.name}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6">{alumnus.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alumnus.profile?.currentPosition} at {alumnus.profile?.company}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body2" paragraph>
                  Education: {alumnus.profile?.education}
                </Typography>
                <Typography variant="body2" paragraph>
                  Location: {alumnus.profile?.location}
                </Typography>
                <Typography variant="body2" paragraph>
                  Skills: {alumnus.profile?.skills?.slice(0, 3).join(', ')}
                </Typography>
                <Box mt={2}>
                  {getRequestButton(alumnus._id)}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
      >
        <Alert onClose={() => setSuccess('')} severity="success">
          {success}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Mentorship; 