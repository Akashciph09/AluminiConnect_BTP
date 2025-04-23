import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import SaveProfileButton from './SaveProfileButton';

const ProfileOverview = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    branch: '',
    graduationYear: '',
    cvLink: '',
    username: '',
    phone: '',
    location: '',
    college: '',
    degree: '',
    major: '',
    currentStatus: '',
    certifications: [],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: '',
    },
    profileImage: '',
    emailVisible: true,
    phoneVisible: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newCertification, setNewCertification] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:3002/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile({
          ...data.profile,
          name: data.name,
          email: data.email,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialPlatform = name.split('.')[1];
      setProfile(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: value,
        },
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:3002/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h2">
            Profile Overview
          </Typography>
          {!editing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                sx={{ mr: 1 }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profile.email}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={profile.phone}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={profile.location}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="College"
              name="college"
              value={profile.college}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Branch"
              name="branch"
              value={profile.branch}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Graduation Year"
              name="graduationYear"
              value={profile.graduationYear}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
            <TextField
              fullWidth
              label="CV Link"
              name="cvLink"
              value={profile.cvLink}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Social Links
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="LinkedIn"
              name="socialLinks.linkedin"
              value={profile.socialLinks.linkedin}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="GitHub"
              name="socialLinks.github"
              value={profile.socialLinks.github}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Portfolio"
              name="socialLinks.portfolio"
              value={profile.socialLinks.portfolio}
              onChange={handleInputChange}
              disabled={!editing}
              margin="normal"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Certifications
        </Typography>
        <Box mb={2}>
          {profile.certifications.map((cert, index) => (
            <Chip
              key={index}
              label={cert}
              onDelete={editing ? () => handleRemoveCertification(index) : undefined}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
        {editing && (
          <Box display="flex" alignItems="center" mb={2}>
            <TextField
              fullWidth
              label="Add Certification"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              margin="normal"
            />
            <IconButton
              color="primary"
              onClick={handleAddCertification}
              disabled={!newCertification.trim()}
            >
              <AddIcon />
            </IconButton>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
          <Box>
            <Tooltip title="Email visibility">
              <Chip
                label={profile.emailVisible ? 'Email Visible' : 'Email Hidden'}
                color={profile.emailVisible ? 'success' : 'default'}
                onClick={editing ? () => setProfile(prev => ({ ...prev, emailVisible: !prev.emailVisible })) : undefined}
              />
            </Tooltip>
            <Tooltip title="Phone visibility">
              <Chip
                label={profile.phoneVisible ? 'Phone Visible' : 'Phone Hidden'}
                color={profile.phoneVisible ? 'success' : 'default'}
                onClick={editing ? () => setProfile(prev => ({ ...prev, phoneVisible: !prev.phoneVisible })) : undefined}
                sx={{ ml: 1 }}
              />
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileOverview; 