import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Button } from '@mui/material';
import axios from '../../utils/axiosConfig';

const WorkshopJoin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const joinWorkshop = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call backend API to get meeting link
        const response = await axios.get(`/workshops/join/${token}?format=json`);
        
        if (response.data && response.data.meetingLink) {
          // Redirect to the meeting link
          window.location.href = response.data.meetingLink;
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (err) {
        console.error('Error joining workshop:', err);
        const errorMessage = err.response?.data?.error || 'Failed to join workshop. The link may be invalid or expired.';
        setError(errorMessage);
        setLoading(false);
      }
    };

    if (token) {
      joinWorkshop();
    } else {
      setError('Invalid join link');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Redirecting to workshop...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Box>
    );
  }

  return null;
};

export default WorkshopJoin;

