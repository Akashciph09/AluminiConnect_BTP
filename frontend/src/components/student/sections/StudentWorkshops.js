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
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Computer as ComputerIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

function StudentWorkshops() {
  const { user, isAuthenticated, isStudent, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isStudent) {
      navigate('/');
      return;
    }
    fetchWorkshops();
    fetchRegistrations();
  }, [isAuthenticated, isStudent, navigate, authLoading]);

  const fetchWorkshops = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/workshops');
      console.log('Fetched workshops:', response.data);
      setWorkshops(response.data);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      setError('Failed to fetch workshops. Please try again later.');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      if (!user?._id) return;
      const response = await axios.get(`/workshops/student/${user._id}/registrations`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleRegister = async (workshopId) => {
    try {
      if (!isAuthenticated) {
        setSnackbar({
          open: true,
          message: 'Please login to register for workshops',
          severity: 'error'
        });
        navigate('/login');
        return;
      }

      if (!isStudent) {
        setSnackbar({
          open: true,
          message: 'Only students can register for workshops',
          severity: 'error'
        });
        return;
      }

      const response = await axios.post(`/workshops/${workshopId}/register`);
      
      if (response.data.message) {
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        
        // Refresh workshops and registrations
        await Promise.all([fetchWorkshops(), fetchRegistrations()]);
      }
    } catch (error) {
      console.error('Error registering for workshop:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register for workshop. Please try again.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });

      // Only navigate to login if it's an authentication error
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const isRegistered = (workshopId) => {
    return registrations.some(reg => reg.workshopId._id === workshopId);
  };

  const filteredWorkshops = workshops.filter(workshop =>
    workshop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workshop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workshop.organizer?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={fetchWorkshops} variant="contained">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Available Workshops
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search workshops by title, description, or organizer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredWorkshops.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            No Workshops Available
          </Typography>
          <Typography color="text.secondary">
            {searchTerm ? 'No workshops match your search criteria.' : 'There are no workshops available at the moment.'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredWorkshops.map((workshop) => (
            <Grid item xs={12} md={6} key={workshop._id}>
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" component="div" fontWeight="bold">
                      {workshop.title}
                    </Typography>
                    <Chip
                      label={workshop.status || 'upcoming'}
                      color={workshop.status === 'upcoming' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {workshop.description}
                  </Typography>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {new Date(workshop.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {workshop.mode === 'online' ? (
                        <ComputerIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ) : (
                        <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      )}
                      <Typography variant="body2">
                        {workshop.mode === 'online' ? 'Online' : workshop.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Duration: {workshop.duration}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {workshop.registrations?.length || 0} registered
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Avatar 
                        src={workshop.organizer?.profilePicture} 
                        sx={{ width: 24, height: 24, mr: 1 }}
                      >
                        {workshop.organizer?.name?.[0]}
                      </Avatar>
                      <Typography variant="body2">
                        Organized by: {workshop.organizer?.name || 'Alumni'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRegister(workshop._id)}
                    disabled={isRegistered(workshop._id)}
                  >
                    {isRegistered(workshop._id) ? 'Already Registered' : 'Register'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StudentWorkshops; 