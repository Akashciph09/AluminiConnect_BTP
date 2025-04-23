import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  EventAvailable as RegisterIcon,
} from '@mui/icons-material';

const StudentWorkshops = () => {
  const [workshops, setWorkshops] = useState([
    {
      id: 1,
      title: 'Career Development Workshop',
      description: 'Learn about career opportunities and job search strategies',
      date: '2024-04-15T14:00:00',
      location: 'Virtual (Zoom)',
      maxParticipants: 50,
      currentParticipants: 25,
      status: 'upcoming',
      registered: false,
    },
    {
      id: 2,
      title: 'Technical Skills Workshop',
      description: 'Hands-on session on modern web development',
      date: '2024-04-20T15:00:00',
      location: 'Computer Lab 101',
      maxParticipants: 30,
      currentParticipants: 30,
      status: 'full',
      registered: false,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [registrationReason, setRegistrationReason] = useState('');

  const handleOpenDialog = (workshop) => {
    setSelectedWorkshop(workshop);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedWorkshop(null);
    setRegistrationReason('');
  };

  const handleRegister = () => {
    if (selectedWorkshop) {
      setWorkshops(workshops.map(w => 
        w.id === selectedWorkshop.id 
          ? { 
              ...w, 
              currentParticipants: w.currentParticipants + 1,
              status: w.currentParticipants + 1 >= w.maxParticipants ? 'full' : 'upcoming',
              registered: true,
            }
          : w
      ));
      handleCloseDialog();
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Available Workshops & Events
      </Typography>

      <Grid container spacing={3}>
        {workshops.map((workshop) => (
          <Grid item xs={12} md={6} key={workshop.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                  {workshop.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {workshop.description}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {new Date(workshop.date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">{workshop.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PeopleIcon sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {workshop.currentParticipants}/{workshop.maxParticipants} participants
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Chip
                  label={workshop.status}
                  color={workshop.status === 'upcoming' ? 'primary' : 'default'}
                />
                {workshop.registered ? (
                  <Chip label="Registered" color="success" />
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<RegisterIcon />}
                    onClick={() => handleOpenDialog(workshop)}
                    disabled={workshop.status === 'full'}
                  >
                    Register
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Register for {selectedWorkshop?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Why do you want to attend this workshop?"
              value={registrationReason}
              onChange={(e) => setRegistrationReason(e.target.value)}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleRegister} 
            variant="contained"
            disabled={!registrationReason.trim()}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentWorkshops; 