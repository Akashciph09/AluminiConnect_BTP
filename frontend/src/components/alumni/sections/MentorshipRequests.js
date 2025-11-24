import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';
import { Box, Paper, Avatar, Typography, Button } from '@mui/material';

const MentorshipRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? 'Present' : 'Missing');

      // First check if we have any students (use mentorship route which lists students)
      // NOTE: previously this was calling `/users/alumni` which returns alumni — use
      // `/mentorship/list-students` to get actual student users for test creation.
      const studentsResponse = await axios.get(`${config.API_URL}/mentorship/list-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Found students (from mentorship/list-students):', studentsResponse.data);

      if (studentsResponse.data && studentsResponse.data.length > 0) {
        // Create a test request with the first student
        await createTestRequest(studentsResponse.data[0]._id);
      } else {
        console.log('No students found in the database');
      }

      // Fetch mentorship requests
      await fetchMentorshipRequests();
    } catch (error) {
      console.error('Error initializing data:', error);
      setError('Failed to initialize data');
    } finally {
      setLoading(false);
    }
  };

  const createTestRequest = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Creating test request for student:', studentId);
      
      const response = await axios.post(`${config.API_URL}/mentorship/create-test-request/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Test request created:', response.data);
    } catch (error) {
      console.error('Error creating test request:', error);
    }
  };

  const fetchMentorshipRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First, get all requests for debugging
      const debugResponse = await axios.get(`${config.API_URL}/mentorship/debug/all-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('All requests in database:', debugResponse.data);
      
      // Then get mentor-specific requests
      const response = await axios.get(`${config.API_URL}/mentorship/mentor-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Fetched requests:', response.data);
      
      if (response.data && response.data.length > 0) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching mentorship requests:', error);
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        setError(error.response.data.message || 'Failed to fetch mentorship requests');
      } else if (error.request) {
        console.error('No response received:', error.request);
        setError('No response received from server');
      } else {
        console.error('Request setup error:', error.message);
        setError('Error setting up the request');
      }
      setRequests([]);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      // Backend expects PATCH for updating request status (route defined as PATCH)
      await axios.patch(`${config.API_URL}/mentorship/${requestId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMentorshipRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setError('Failed to update request status');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>Loading...</Box>;
  }

  if (error) {
    return <Box sx={{ color: 'error.main', textAlign: 'center', p: 2 }}>{error}</Box>;
  }

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Mentorship Requests</Typography>

      {requests.length === 0 ? (
        <Typography color="text.secondary">No mentorship requests found</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {requests.map((request) => (
            <Paper key={request._id} elevation={2} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {request.student?.profilePicture ? (
                    <Avatar src={request.student.profilePicture} alt={request.student?.name} />
                  ) : (
                    <Avatar>{request.student?.name?.charAt(0) || '?'}</Avatar>
                  )}
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{request.student?.name || 'Unknown Student'}</Typography>
                    <Typography variant="body2" color="text.secondary">{request.student?.email || 'No email provided'}</Typography>
                  </Box>
                </Box>

                <Box>
                  <Button variant="contained" color="success" size="small" sx={{ mr: 1 }} onClick={() => handleStatusUpdate(request._id, 'accepted')}>Accept</Button>
                  <Button variant="contained" color="error" size="small" onClick={() => handleStatusUpdate(request._id, 'rejected')}>Reject</Button>
                </Box>
              </Box>

              {request.message && (
                <Typography sx={{ mt: 1 }}>{request.message}</Typography>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Requested on: {new Date(request.requestedAt).toLocaleDateString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MentorshipRequests; 