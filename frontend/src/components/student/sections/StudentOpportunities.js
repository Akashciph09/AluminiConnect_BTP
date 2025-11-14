import React, { useState, useEffect } from 'react';
import { CircularProgress, Alert, Chip, Box, Typography, Card, CardContent, CardActions, Button, Grid, Stack, Avatar } from '@mui/material';
import { LocationOn, Business, AccessTime, Work, School, AttachMoney, Star, Description, CalendarMonth, EventAvailable, Timer, Person, Email, LinkedIn } from '@mui/icons-material';
import axios from '../../../utils/axiosConfig';

function StudentOpportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [applicationStatuses, setApplicationStatuses] = useState({});

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchApplicationStatuses = async (opportunityIds) => {
    try {
      // Fetch status for each opportunity
      const statusPromises = opportunityIds.map(async (id) => {
        try {
          const response = await axios.get(`/job-applications/${id}/check-application`);
          return { id, status: response.data.status };
        } catch (error) {
          console.error(`Error fetching status for opportunity ${id}:`, error);
          return { id, status: null };
        }
      });

      const statusResults = await Promise.all(statusPromises);
      const statusMap = {};
      statusResults.forEach(({ id, status }) => {
        statusMap[id] = status;
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
      
      // Fetch application statuses for all opportunities
      const opportunityIds = response.data.map(job => job._id);
      await fetchApplicationStatuses(opportunityIds);
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
        alert('You have already applied for this opportunity.');
        return;
      }

      // Send application
      const response = await axios.post(`/job-applications/${jobId}/apply`);

      if (response.data) {
        // Immediately update the application status to pending
        setApplicationStatuses(prev => ({
          ...prev,
          [jobId]: 'pending'
        }));
        
        // Optionally show a success message (can be removed if not needed)
        // alert('Application submitted successfully!');
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      let errorMessage = 'Failed to apply for the opportunity. ';
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

  const getButtonProps = (jobId) => {
    const status = applicationStatuses[jobId];
    
    if (!status) {
      return {
        text: 'Apply',
        color: 'primary',
        disabled: false,
        variant: 'contained'
      };
    }

    switch (status) {
      case 'accepted':
        return {
          text: 'Accepted',
          color: 'success',
          disabled: true,
          variant: 'contained'
        };
      case 'pending':
        return {
          text: 'Pending',
          color: 'secondary',
          disabled: true,
          variant: 'contained'
        };
      case 'rejected':
        return {
          text: 'Rejected',
          color: 'error',
          disabled: true,
          variant: 'contained'
        };
      default:
        return {
          text: 'Apply',
          color: 'primary',
          disabled: false,
          variant: 'contained'
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

                {/* Posted By Alumni Section */}
                {job.postedBy && (
                  <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: 'primary.light', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.main',
                    opacity: 0.9
                  }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ 
                      fontWeight: 'bold',
                      color: 'primary.dark',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5
                    }}>
                      <Person fontSize="small" />
                      Posted by Alumni
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={job.postedBy.profile?.profileImage ? 
                          (job.postedBy.profile.profileImage.startsWith('http') 
                            ? job.postedBy.profile.profileImage 
                            : `http://localhost:3002/${job.postedBy.profile.profileImage}`) 
                          : undefined}
                        alt={job.postedBy.name}
                        sx={{
                          width: 56,
                          height: 56,
                          border: '2px solid',
                          borderColor: 'primary.main',
                          bgcolor: 'primary.main',
                          fontSize: '1.5rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {!job.postedBy.profile?.profileImage && job.postedBy.name?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>
                          {job.postedBy.name}
                        </Typography>
                        {job.postedBy.profile?.currentStatus && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {job.postedBy.profile.currentStatus}
                          </Typography>
                        )}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {job.postedBy.email && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Email fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {job.postedBy.email}
                              </Typography>
                            </Box>
                          )}
                          {job.postedBy.profile?.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOn fontSize="small" sx={{ color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {job.postedBy.profile.location}
                              </Typography>
                            </Box>
                          )}
                          {job.postedBy.profile?.socialLinks?.linkedin && (
                            <Box 
                              component="a"
                              href={job.postedBy.profile.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 0.5,
                                textDecoration: 'none',
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                            >
                              <LinkedIn fontSize="small" />
                              <Typography variant="caption">
                                LinkedIn
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        {job.postedBy.profile?.college && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            <School fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            {job.postedBy.profile.college}
                            {job.postedBy.profile.graduationYear && ` • ${job.postedBy.profile.graduationYear}`}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}

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
                  {(() => {
                    const status = applicationStatuses[job._id];
                    let bgColor = '#1976d2'; // default primary blue
                    let hoverColor = '#1565c0';
                    let disabledColor = '#1976d2';
                    
                    if (status === 'pending') {
                      bgColor = '#9e9e9e'; // grey
                      hoverColor = '#757575';
                      disabledColor = '#bdbdbd';
                    } else if (status === 'accepted') {
                      bgColor = '#4caf50'; // green
                      hoverColor = '#388e3c';
                      disabledColor = '#4caf50';
                    } else if (status === 'rejected') {
                      bgColor = '#f44336'; // red
                      hoverColor = '#d32f2f';
                      disabledColor = '#f44336';
                    }
                    
                    return (
                      <Button
                        fullWidth
                        onClick={() => handleApply(job._id)}
                        startIcon={!status ? <Star /> : null}
                        disabled={getButtonProps(job._id).disabled}
                        style={{
                          backgroundColor: bgColor,
                          color: '#ffffff',
                          textTransform: 'none',
                          fontWeight: 500,
                          boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
                        }}
                        onMouseEnter={(e) => {
                          if (!getButtonProps(job._id).disabled) {
                            e.currentTarget.style.backgroundColor = hoverColor;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!getButtonProps(job._id).disabled) {
                            e.currentTarget.style.backgroundColor = bgColor;
                          } else {
                            e.currentTarget.style.backgroundColor = disabledColor;
                          }
                        }}
                        sx={{
                          '&.Mui-disabled': {
                            backgroundColor: `${disabledColor} !important`,
                            color: '#ffffff !important',
                          }
                        }}
                      >
                        {getButtonProps(job._id).text}
                      </Button>
                    );
                  })()}
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