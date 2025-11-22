import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Computer as ComputerIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';

const Workshops = () => {
  const { user, isAuthenticated, isAlumni, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workshops, setWorkshops] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRegistrations, setOpenRegistrations] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    mode: 'online',
    location: '',
    targetAudience: '',
    duration: '1 hour'
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) navigate('/login');
    if (!isAlumni) navigate('/');
    fetchWorkshops();
  }, [isAuthenticated, isAlumni, navigate, authLoading]);

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

  const handleOpenDialog = (workshop = null) => {
    if (workshop) {
      setFormData({
        title: workshop.title,
        description: workshop.description,
        date: new Date(workshop.date).toISOString().split('T')[0],
        mode: workshop.mode,
        location: workshop.location || '',
        targetAudience: workshop.targetAudience,
        duration: workshop.duration || '1 hour'
      });
      setSelectedWorkshop(workshop);
    } else {
      setFormData({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        mode: 'online',
        location: '',
        targetAudience: '',
        duration: '1 hour'
      });
      setSelectedWorkshop(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWorkshop(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the date properly
      const formattedDate = new Date(formData.date).toISOString();
      
      const workshopData = {
        title: formData.title,
        description: formData.description,
        date: formattedDate,
        mode: formData.mode,
        location: formData.mode === 'online' ? undefined : formData.location,
        targetAudience: formData.targetAudience,
        duration: formData.duration
      };

      console.log('Submitting workshop data:', workshopData);

      if (selectedWorkshop) {
        const response = await axios.put(
          `/workshops/${selectedWorkshop._id}`,
          workshopData
        );
        console.log('Update response:', response.data);
        setSnackbar({
          open: true,
          message: 'Workshop updated successfully',
          severity: 'success'
        });
      } else {
        const response = await axios.post('/workshops', workshopData);
        console.log('Create response:', response.data);
        setSnackbar({
          open: true,
          message: 'Workshop created successfully',
          severity: 'success'
        });
      }
      handleCloseDialog();
      fetchWorkshops();
    } catch (error) {
      console.error('Error saving workshop:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Error saving workshop',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (workshopId) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      try {
        await axios.delete(`/workshops/${workshopId}`);
        setSnackbar({
          open: true,
          message: 'Workshop deleted successfully',
          severity: 'success'
        });
        fetchWorkshops();
      } catch (error) {
        console.error('Error deleting workshop:', error);
        setSnackbar({
          open: true,
          message: 'Error deleting workshop',
          severity: 'error'
        });
      }
    }
  };

  const handleViewRegistrations = (workshop) => {
    setSelectedWorkshop(workshop);
    setOpenRegistrations(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'ongoing':
        return 'success';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Workshops
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ 
            background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
            }
          }}
        >
          Create Workshop
        </Button>
      </Box>

      {workshops.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <SchoolIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Workshops Yet
          </Typography>
          <Typography color="text.secondary" paragraph>
            Start creating workshops to help students learn and grow. Click the "Create Workshop" button to get started.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {workshops.map((workshop) => (
            <Grid item xs={12} md={6} lg={4} key={workshop._id}>
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
                      color={getStatusColor(workshop.status)}
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
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    {workshop.tags?.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleViewRegistrations(workshop)}
                  >
                    View Registrations
                  </Button>
                  {user && workshop.organizer && user._id === workshop.organizer._id && (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(workshop)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        startIcon={<DeleteIcon />}
                        color="error"
                        onClick={() => handleDelete(workshop._id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Workshop Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {selectedWorkshop ? 'Edit Workshop' : 'Create New Workshop'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                fullWidth
                required
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                fullWidth
                required
              />

              <TextField
                label="Date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />

              <FormControl fullWidth required>
                <InputLabel>Mode</InputLabel>
                <Select
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  label="Mode"
                >
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="offline">Offline</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>

              {formData.mode !== 'online' && (
                <TextField
                  label="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  fullWidth
                  required
                />
              )}

              <FormControl fullWidth required>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  label="Target Audience"
                >
                  <MenuItem value="students">Students</MenuItem>
                  <MenuItem value="alumni">Alumni</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  label="Duration"
                >
                  <MenuItem value="30 minutes">30 minutes</MenuItem>
                  <MenuItem value="1 hour">1 hour</MenuItem>
                  <MenuItem value="1.5 hours">1.5 hours</MenuItem>
                  <MenuItem value="2 hours">2 hours</MenuItem>
                  <MenuItem value="3 hours">3 hours</MenuItem>
                  <MenuItem value="4 hours">4 hours</MenuItem>
                  <MenuItem value="Half Day (4 hours)">Half Day (4 hours)</MenuItem>
                  <MenuItem value="Full Day (8 hours)">Full Day (8 hours)</MenuItem>
                  <MenuItem value="2 Days">2 Days</MenuItem>
                  <MenuItem value="3 Days">3 Days</MenuItem>
                  <MenuItem value="1 Week">1 Week</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedWorkshop ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Registrations Dialog */}
      <Dialog
        open={openRegistrations}
        onClose={() => setOpenRegistrations(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Workshop Registrations</DialogTitle>
        <DialogContent>
          <List>
            {selectedWorkshop?.registrations?.map((registration) => (
              <ListItem key={registration._id}>
                <ListItemAvatar>
                  <Avatar src={registration.user.profilePicture}>
                    {registration.user.name?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={registration.user.name}
                  secondary={`Registered on ${new Date(registration.registeredAt).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
            {(!selectedWorkshop?.registrations || selectedWorkshop.registrations.length === 0) && (
              <ListItem>
                <ListItemText primary="No registrations yet" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRegistrations(false)}>Close</Button>
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
};

export default Workshops; 