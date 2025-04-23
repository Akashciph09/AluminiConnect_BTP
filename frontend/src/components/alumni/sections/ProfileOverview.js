import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';

const ProfileOverview = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    graduationYear: '',
    department: '',
    currentPosition: '',
    company: '',
    location: '',
    linkedin: '',
    github: '',
    profilePicture: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('http://localhost:3002/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          setFormData({
            name: response.data.name || '',
            email: response.data.email || '',
            phone: response.data.profile?.phone || '',
            graduationYear: response.data.profile?.education?.[0]?.year || '',
            department: response.data.profile?.education?.[0]?.degree || '',
            currentPosition: response.data.profile?.experience?.[0]?.position || '',
            company: response.data.profile?.experience?.[0]?.company || '',
            location: response.data.profile?.location || '',
            linkedin: response.data.profile?.socialLinks?.linkedin || '',
            github: response.data.profile?.socialLinks?.github || '',
            profilePicture: response.data.profile?.profileImage || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.response?.data?.message || 'Failed to fetch profile');
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const profileData = {
        name: formData.name,
        email: formData.email,
        profile: {
          phone: formData.phone,
          location: formData.location,
          socialLinks: {
            linkedin: formData.linkedin,
            github: formData.github
          },
          profileImage: formData.profilePicture,
          experience: [{
            company: formData.company,
            position: formData.currentPosition,
            duration: 'Current',
            description: ''
          }],
          education: [{
            institution: 'IIT Patna',
            degree: formData.department,
            year: formData.graduationYear,
            description: ''
          }],
          skills: [],
          certifications: [],
          emailVisible: true,
          phoneVisible: true
        }
      };

      const response = await axios.put('http://localhost:3002/api/users/profile', profileData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data) {
        // Update the user data in localStorage
        const updatedUser = {
          ...user,
          ...response.data
        };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        
        // Update the user state if updateUser is available
        if (typeof updateUser === 'function') {
          updateUser(updatedUser);
        }
        
        setIsEditing(false);
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      bgcolor: '#0f172a',
      p: 0,
      m: 0
    }}>
      {/* Profile Header */}
      <Box
        sx={{
          height: '120px',
          background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
          position: 'relative',
          mb: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          px: 3,
          pt: 2,
          width: '100%'
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          position: 'absolute',
          right: 24,
          top: 16,
          zIndex: 2
        }}>
          {!isEditing ? (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
              sx={{
                background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
                color: '#ffffff',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7F00FF 30%, #8A2BE2 90%)',
                },
                boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)'
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={isSaving}
                sx={{
                  background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
                  color: '#ffffff',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #7F00FF 30%, #8A2BE2 90%)',
                  },
                  boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)'
                }}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => setIsEditing(false)}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </Box>

        <Avatar
          src={formData.profilePicture || '/default-avatar.png'}
          alt={formData.name}
          sx={{
            width: 120,
            height: 120,
            border: '4px solid #e3f2fd',
            position: 'absolute',
            bottom: -60,
            left: { xs: '50%', md: 50 },
            transform: { xs: 'translateX(-50%)', md: 'none' },
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        />
      </Box>

      <Box sx={{ 
        px: 3,
        pb: 4,
        width: '100%'
      }}>
        <Grid container spacing={3}>
          {/* Left Column - Basic Info */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              {/* Basic Info Card */}
              <Card sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                height: '100%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: '#ffffff',
                    background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Basic Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <PhoneIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <LocationIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Social Links Card */}
              <Card sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: '#ffffff',
                    background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Social Links
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="LinkedIn"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <LinkedInIcon sx={{ mr: 1, color: '#0077b5' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="GitHub"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <GitHubIcon sx={{ mr: 1, color: '#333' }} />
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          {/* Right Column - Professional & Education */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {/* Professional Info Card */}
              <Card sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: '#ffffff',
                    background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Professional Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Current Position"
                      name="currentPosition"
                      value={formData.currentPosition}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <WorkIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <BusinessIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>

              {/* Education Card */}
              <Card sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ 
                    color: '#ffffff',
                    background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    Education
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                      InputProps={{
                        startAdornment: <SchoolIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Graduation Year"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      disabled={!isEditing}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8A2BE2',
                          },
                        },
                        '& .MuiInputLabel-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                        },
                        '& .MuiInputBase-input': {
                          color: '#ffffff',
                        },
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Success/Error Messages */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            width: '100%',
            background: 'rgba(46, 125, 50, 0.9)',
            color: 'white',
          }}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%',
            background: 'rgba(211, 47, 47, 0.9)',
            color: 'white',
          }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfileOverview; 