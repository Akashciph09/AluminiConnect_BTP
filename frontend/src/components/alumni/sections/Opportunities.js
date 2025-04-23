import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axiosConfig';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Fab,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Work as WorkIcon,
  LocationOn,
  Business,
  AttachMoney,
  Person,
  AccessTime,
  Description,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../../contexts/AuthContext';

const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.2s, box-shadow 0.2s',
  backgroundColor: '#111827',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  },
}));

const JobPosting = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('/jobs/alumni');
        console.log('Fetched jobs:', response.data); // Debug log
        setJobs(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.response?.data?.message || 'Failed to fetch jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user._id]);

  const handlePostJob = () => {
    navigate('/alumni/post-job');
  };

  const handleEditJob = (jobId) => {
    navigate(`/alumni/edit-job/${jobId}`);
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await axios.delete(`/jobs/${jobId}`);
        setJobs(jobs.filter(job => job._id !== jobId));
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job posting');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ 
      p: 0, 
      width: '100%', 
      backgroundColor: '#0f172a',
      minHeight: '100vh'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 6,
        p: 4,
        bgcolor: 'transparent',
        borderRadius: 0,
        boxShadow: 'none'
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ 
            fontWeight: 'bold', 
            color: '#ffffff',
            mb: 2,
            background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '2.5rem'
          }}>
            My Freelance Postings
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1.2rem',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}>
            Manage and track your freelance postings and applications
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handlePostJob}
          sx={{
            background: 'linear-gradient(45deg, #8A2BE2 30%, #7F00FF 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #7F00FF 30%, #8A2BE2 90%)',
            },
            px: 4,
            py: 2,
            borderRadius: 2,
            fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)'
          }}
        >
          Post New Work
        </Button>
      </Box>

      {jobs.length === 0 ? (
        <Box 
          textAlign="center" 
          py={12}
          sx={{
            bgcolor: 'transparent',
            borderRadius: 0,
            p: 4,
            boxShadow: 'none'
          }}
        >
          <WorkIcon sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.7)', mb: 3 }} />
          <Typography variant="h5" sx={{ color: '#ffffff', mb: 3, fontSize: '1.8rem' }}>
            No freelance postings yet
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4, fontSize: '1.1rem' }}>
            Start by posting your first freelance opportunity to help students find great opportunities.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handlePostJob}
            sx={{ 
              mt: 2,
              px: 4,
              py: 2,
              fontSize: '1.1rem',
              boxShadow: '0 4px 12px rgba(138, 43, 226, 0.3)'
            }}
          >
            Post Your First Work
          </Button>
        </Box>
      ) : (
        <Grid 
          container 
          spacing={3}
          sx={{
            width: '100%',
            maxWidth: '100%',
            margin: 0,
            padding: 3
          }}
        >
          {jobs.map((job) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={job._id}
              sx={{
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <StyledCard sx={{ height: '100%' }}>
                <CardContent sx={{ 
                  p: 4, 
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  '&:last-child': {
                    pb: 4
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom sx={{ 
                        fontWeight: 'bold', 
                        color: '#ffffff',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '1.4rem',
                        mb: 2
                      }}>
                        {job.projectTitle}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1.5 }}>
                        <Chip
                          icon={<Business />}
                          label={job.category}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            color: '#ffffff', 
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            fontSize: '0.9rem',
                            height: '32px'
                          }}
                        />
                        <Chip
                          icon={<AttachMoney />}
                          label={`${job.budget} (${job.paymentType})`}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            color: '#ffffff', 
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            fontSize: '0.9rem',
                            height: '32px'
                          }}
                        />
                        <Chip
                          icon={<AccessTime />}
                          label={`${job.experienceLevel} Level`}
                          variant="outlined"
                          size="small"
                          sx={{ 
                            color: '#ffffff', 
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            fontSize: '0.9rem',
                            height: '32px'
                          }}
                        />
                      </Stack>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}>
                    {job.description}
                  </Typography>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mt: 3,
                    pt: 3,
                    borderTop: '1px solid rgba(255, 255, 255, 0.12)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <AccessTime fontSize="small" sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.9rem'
                      }}>
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <Tooltip title="View Applications">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/alumni/applications?jobId=${job._id}`)}
                          sx={{ 
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Job">
                        <IconButton
                          size="small"
                          onClick={() => handleEditJob(job._id)}
                          sx={{ 
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteJob(job._id)}
                          sx={{ 
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={handlePostJob}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
          },
        }}
      >
        <WorkIcon />
      </Fab>
    </Box>
  );
};

export default JobPosting; 