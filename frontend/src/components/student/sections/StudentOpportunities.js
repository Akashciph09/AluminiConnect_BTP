import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert, Chip, Box, Typography, Card, CardContent, CardActions, Button, Grid, Stack } from '@mui/material';
import { LocationOn, Business, AccessTime, Work, School, AttachMoney, Star, Description, CalendarMonth, EventAvailable, Timer, CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import axios from '../../../utils/axiosConfig';

function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applicationStatuses, setApplicationStatuses] = useState({});

  useEffect(() => {
    fetchOpportunities();
    fetchApplicationStatuses();
  }, []);

  const fetchApplicationStatuses = async () => {
    try {
      const response = await axios.get('/job-applications/my-applications');
      
      // Create a map of jobId to application status
      const statusMap = {};
      response.data.forEach(app => {
        statusMap[app.jobId] = app.status;
      });
      setApplicationStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching application statuses:', error);
    }
  };

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/jobs');
      setOpportunities(response.data);
      await fetchApplicationStatuses(); // Fetch application statuses after getting jobs
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    try {
      // Check if already applied
      if (applicationStatuses[jobId]) {
        alert('You have already applied for this job.');
        return;
      }

      // Send application
      const response = await axios.post(`/job-applications/${jobId}/apply`);

      if (response.data) {
        // Update the application status for this job
        setApplicationStatuses(prev => ({
          ...prev,
          [jobId]: 'pending'
        }));
        
        alert('Successfully applied for the position!');
        fetchOpportunities();
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      let errorMessage = 'Failed to apply for the job. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      alert(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <Chip
            icon={<CheckCircle />}
            label="Accepted"
            color="success"
            sx={{ 
              bgcolor: 'success.light',
              color: 'success.dark',
              '& .MuiChip-icon': { color: 'success.dark' }
            }}
          />
        );
      case 'rejected':
        return (
          <Chip
            icon={<Cancel />}
            label="Rejected"
            color="error"
            sx={{ 
              bgcolor: 'error.light',
              color: 'error.dark',
              '& .MuiChip-icon': { color: 'error.dark' }
            }}
          />
        );
      case 'pending':
        return (
          <Chip
            icon={<HourglassEmpty />}
            label="Under Review"
            color="warning"
            sx={{ 
              bgcolor: 'warning.light',
              color: 'warning.dark',
              '& .MuiChip-icon': { color: 'warning.dark' }
            }}
          />
        );
      default:
        return null;
    }
  };

  const getButtonProps = (jobId) => {
    const status = applicationStatuses[jobId];
    
    if (!status) {
      return {
        text: 'Apply Now',
        color: 'primary',
        disabled: false,
        showStatus: false
      };
    }

    switch (status) {
      case 'accepted':
        return {
          text: 'Application Accepted',
          color: 'success',
          disabled: true,
          showStatus: true
        };
      case 'pending':
        return {
          text: 'Under Review',
          color: 'warning',
          disabled: true,
          showStatus: true
        };
      case 'rejected':
        return {
          text: 'Application Rejected',
          color: 'error',
          disabled: true,
          showStatus: true
        };
      default:
        return {
          text: 'Apply Now',
          color: 'primary',
          disabled: false,
          showStatus: false
        };
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Freelance Opportunities
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            md: 'repeat(2, 1fr)', 
            lg: 'repeat(3, 1fr)' 
          }, 
          gap: 3 
        }}>
          {opportunities.map((job) => (
            <Card 
              key={job._id}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" component="h2" sx={{ 
                      fontWeight: 'bold',
                      color: 'primary.main',
                      mb: 1
                    }}>
                      {job.projectTitle}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        icon={<Business />}
                        label={job.category}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          color: 'primary.main',
                          borderColor: 'primary.main',
                          backgroundColor: 'transparent'
                        }}
                      />
                      <Chip
                        icon={<AttachMoney />}
                        label={`${job.budget} (${job.paymentType})`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          color: 'primary.main',
                          borderColor: 'primary.main',
                          backgroundColor: 'transparent'
                        }}
                      />
                      <Chip
                        icon={<AccessTime />}
                        label={`${job.experienceLevel} Level`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          color: 'primary.main',
                          borderColor: 'primary.main',
                          backgroundColor: 'transparent'
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    fontWeight: 'medium',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Description fontSize="small" />
                    Project Description
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ 
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.projectDescription}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    fontWeight: 'medium',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Description fontSize="small" />
                    Required Skills
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {job.requiredSkills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            bgcolor: 'primary.main',
                            color: 'white'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    fontWeight: 'medium',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Description fontSize="small" />
                    Deliverables
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ 
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.deliverables}
                  </Typography>
                </Box>

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: 2,
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarMonth sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Start: {new Date(job.startDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccessTime sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                  {job.estimatedHoursPerWeek && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Timer sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.estimatedHoursPerWeek} hrs/week
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventAvailable sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Apply by: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography variant="caption">
                    Posted: {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Box sx={{ width: '100%' }}>
                  {getButtonProps(job._id).showStatus && (
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                      {getStatusChip(applicationStatuses[job._id])}
                    </Box>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleApply(job._id)}
                    startIcon={<Star />}
                    disabled={getButtonProps(job._id).disabled}
                    sx={{
                      bgcolor: `${getButtonProps(job._id).color}.main`,
                      '&:hover': {
                        bgcolor: `${getButtonProps(job._id).color}.dark`,
                      }
                    }}
                  >
                    {getButtonProps(job._id).text}
                  </Button>
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default StudentOpportunities; 