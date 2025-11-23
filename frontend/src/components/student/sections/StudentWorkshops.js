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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
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
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [registerDialog, setRegisterDialog] = useState({ open: false, workshop: null });
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

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
      const userId = user?._id || user?.id;
      if (!userId) {
        console.log('No user ID, skipping registration fetch');
        setRegistrations([]);
        return;
      }
      setRegistrationsLoading(true);
      console.log('Fetching registrations for user:', userId);
      const response = await axios.get(`/workshops/student/${userId}/registrations`);
      console.log('Fetched registrations:', response.data);
      console.log('Number of registrations:', response.data?.length || 0);
      
      // Log each registration for debugging
      if (response.data && response.data.length > 0) {
        response.data.forEach((reg, index) => {
          console.log(`Registration ${index + 1}:`, {
            workshopId: reg.workshopId?._id || reg.workshopId,
            status: reg.status,
            userId: reg.userId?._id || reg.userId
          });
        });
      }
      
      setRegistrations(response.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        // Set empty array on error to prevent issues
        setRegistrations([]);
      }
    } finally {
      setRegistrationsLoading(false);
    }
  };

  const handleOpenRegisterDialog = async (workshop) => {
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

    // Check if already registered - do this check with detailed logging
    const registered = isRegistered(workshop._id);
    console.log('handleOpenRegisterDialog - Registration check:', {
      workshopId: workshop._id,
      registered,
      registrationsCount: registrations.length,
      registrations: registrations.map(r => ({
        workshopId: r.workshopId?._id || r.workshopId,
        status: r.status
      })),
      user: user?._id || user?.id
    });

    if (registered) {
      setSnackbar({
        open: true,
        message: 'You are already registered for this workshop',
        severity: 'info'
      });
      // Force refresh registrations to ensure UI is up to date
      fetchRegistrations();
      return;
    }

    // Double-check with backend before opening dialog (prevent race condition)
    // Only check if we have a valid user ID
    const userId = user?._id || user?.id;
    if (userId) {
      try {
        const checkResponse = await axios.get(`/workshops/student/${userId}/registrations`);
        const isActuallyRegistered = checkResponse.data?.some(reg => {
          const regWorkshopId = reg.workshopId?._id || reg.workshopId;
          return regWorkshopId?.toString() === workshop._id?.toString() && reg.status !== 'cancelled';
        });
        
        if (isActuallyRegistered) {
          console.log('Backend confirms user is registered, updating local state');
          setRegistrations(checkResponse.data);
          setSnackbar({
            open: true,
            message: 'You are already registered for this workshop',
            severity: 'info'
          });
          return;
        }
      } catch (checkError) {
        console.error('Error checking registration status:', checkError);
        // Continue with registration attempt if check fails
      }
    }

    // Only allow registration for online workshops
    if (workshop.mode !== 'online') {
      setSnackbar({
        open: true,
        message: 'Registration is only available for online workshops',
        severity: 'info'
      });
      return;
    }

    setRegisterEmail(user?.email || '');
    setEmailError('');
    setRegisterDialog({ open: true, workshop });
  };

  const handleCloseRegisterDialog = () => {
    setRegisterDialog({ open: false, workshop: null });
    setRegisterEmail('');
    setEmailError('');
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleRegister = async () => {
    if (!registerDialog.workshop) return;

    // Validate email
    if (!validateEmail(registerEmail)) {
      return;
    }

    try {
      setRegisterLoading(true);
      const response = await axios.post(`/workshops/${registerDialog.workshop._id}/register`, {
        registeredEmail: registerEmail.trim()
      });

      // Handle different response types based on registration mode
      if (response.data.redirect) {
        // External form - redirect to meeting link
        window.open(response.data.redirect, '_blank');
        setSnackbar({
          open: true,
          message: 'Redirecting to registration form...',
          severity: 'info'
        });
      } else if (response.data.link) {
        // Public link - show link in message
        setSnackbar({
          open: true,
          message: response.data.message || 'Registered — join link sent to your email.',
          severity: 'success'
        });
      } else if (response.data.status === 'ok') {
        // Email-only mode
        setSnackbar({
          open: true,
          message: 'Registered — join link sent to your email.',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: response.data.message || 'Registration successful',
          severity: 'success'
        });
      }

      handleCloseRegisterDialog();
      
      // Refresh workshops and registrations
      await Promise.all([fetchWorkshops(), fetchRegistrations()]);
    } catch (error) {
      console.error('Error registering for workshop:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register for workshop. Please try again.';
      
      // If already registered, refresh registrations to update UI
      // Check both status code (409 Conflict) and error message
      const isAlreadyRegistered = error.response?.status === 409 || 
        errorMessage.includes('Already registered') || 
        errorMessage.includes('already registered');
      
      if (isAlreadyRegistered) {
        // Close dialog immediately
        handleCloseRegisterDialog();
        
        // Immediately add to local registrations state to update UI
        if (registerDialog.workshop) {
          // Create a mock registration entry to immediately disable the button
          const mockRegistration = {
            workshopId: {
              _id: registerDialog.workshop._id
            },
            status: 'registered',
            userId: user?._id || user?.id || user?.id
          };
          setRegistrations(prev => {
            // Check if already exists
            const exists = prev.some(reg => {
              const regId = reg.workshopId?._id || reg.workshopId;
              return regId?.toString() === registerDialog.workshop._id?.toString();
            });
            if (!exists) {
              return [...prev, mockRegistration];
            }
            return prev;
          });
        }
        
        // Refresh both workshops and registrations to ensure UI is up to date
        await Promise.all([fetchWorkshops(), fetchRegistrations()]);
        
        setSnackbar({
          open: true,
          message: 'You are already registered for this workshop',
          severity: 'info'
        });
      } else {
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }

      // Only navigate to login if it's an authentication error
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const isRegistered = (workshopId) => {
    if (!workshopId) {
      return false;
    }
    
    const workshopIdStr = workshopId?.toString();
    if (!workshopIdStr) {
      return false;
    }
    
    // Check registrations from WorkshopRSVP
    if (registrations && registrations.length > 0) {
      for (const reg of registrations) {
        // Handle both populated object and string ID
        const regWorkshopId = reg.workshopId?._id || reg.workshopId;
        const regWorkshopIdStr = regWorkshopId?.toString();
        
        // Also check if status is not cancelled
        const isActive = reg.status !== 'cancelled';
        const matches = isActive && (regWorkshopIdStr === workshopIdStr);
        
        if (matches) {
          console.log('User is registered (from RSVP list):', {
            workshopId: workshopIdStr,
            regWorkshopId: regWorkshopIdStr,
            status: reg.status
          });
          return true;
        }
      }
    }
    
    // Also check if workshop has registrations array with current user
    const workshop = workshops.find(w => {
      const wId = w._id?.toString();
      return wId === workshopIdStr;
    });
    
    if (workshop && workshop.registrations && Array.isArray(workshop.registrations)) {
      const currentUserId = (user?._id || user?.id)?.toString();
      const hasRegistration = workshop.registrations.some(reg => {
        const regUserId = reg.user?._id || reg.user?.id || reg.user;
        return regUserId?.toString() === currentUserId;
      });
      
      if (hasRegistration) {
        console.log('User is registered (from workshop registrations):', workshopIdStr);
        return true;
      }
    }
    
    return false;
  };

  const filteredWorkshops = workshops.filter(workshop => {
    const title = (workshop.title || '').toString().toLowerCase();
    const desc = (workshop.description || '').toString().toLowerCase();
    const org = (workshop.organizer?.name || '').toString().toLowerCase();
    const term = searchTerm.toLowerCase();
    return title.includes(term) || desc.includes(term) || org.includes(term);
  });

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
                        {workshop.registrationCount || workshop.registrations?.length || 0} registered
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
                  {workshop.mode === 'online' && (() => {
                    const registered = isRegistered(workshop._id);
                    return (
                      <Button
                        variant={registered ? "outlined" : "contained"}
                        color={registered ? "success" : "primary"}
                        onClick={() => handleOpenRegisterDialog(workshop)}
                        disabled={registered}
                        sx={{
                          minWidth: '120px',
                          '&.Mui-disabled': {
                            opacity: 0.7,
                            cursor: 'not-allowed'
                          }
                        }}
                      >
                        {registered ? 'Registered' : 'Register'}
                      </Button>
                    );
                  })()}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Registration Modal */}
      <Dialog
        open={registerDialog.open}
        onClose={handleCloseRegisterDialog}
        maxWidth="sm"
        fullWidth
        disableEnforceFocus
      >
        <DialogTitle>Confirm & receive join link</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              We will send the workshop join link to the email below.
            </Typography>
            <TextField
              label="Email"
              type="email"
              value={registerEmail}
              onChange={(e) => {
                setRegisterEmail(e.target.value);
                if (emailError) {
                  validateEmail(e.target.value);
                }
              }}
              onBlur={() => validateEmail(registerEmail)}
              fullWidth
              required
              error={!!emailError}
              helperText={emailError}
              placeholder="your.email@example.com"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRegisterDialog} disabled={registerLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRegister}
            variant="contained"
            disabled={registerLoading || !registerEmail.trim() || !!emailError}
            startIcon={
              <Box sx={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {registerLoading && <CircularProgress size={20} />}
              </Box>
            }
          >
            {registerLoading ? 'Registering...' : 'Send link & register'}
          </Button>
        </DialogActions>
      </Dialog>

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