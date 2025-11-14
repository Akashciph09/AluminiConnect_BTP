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
                maxWidth: '360px',
                height: '100%',
                minHeight: '450px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                },
                bgcolor: '#111827',
                border: '1px solid',
                borderColor: '#1f2937',
                borderRadius: '12px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'hidden' }}>
                {/* Posted By Alumni Header */}
                {job.postedBy && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: '#1f2937',
                    borderRadius: '8px',
                  }}>
                    <Avatar
                      src={job.postedBy.profile?.profileImage ? 
                        (job.postedBy.profile.profileImage.startsWith('http') 
                          ? job.postedBy.profile.profileImage 
                          : `http://localhost:3002/${job.postedBy.profile.profileImage}`) 
                        : undefined}
                      alt={job.postedBy.name}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: '#7c3aed',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {!job.postedBy.profile?.profileImage && job.postedBy.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 500, 
                        color: '#f9fafb',
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        Posted by {job.postedBy.name} <span style={{ color: '#9ca3af' }}>(Alumni)</span>
                      </Typography>
                    </Box>
                    <Person sx={{ fontSize: '1rem', color: '#9ca3af' }} />
                  </Box>
                )}

                {/* Project Title */}
                <Typography variant="h6" component="h2" sx={{ 
                  fontWeight: 600,
                  color: '#f9fafb',
                  fontSize: '1.125rem',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {job.projectTitle}
                </Typography>

                {/* Category, Budget, Level Chips */}
                <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip
                    icon={<Business sx={{ fontSize: '0.875rem', color: '#7c3aed' }} />}
                    label={job.category}
                    size="small"
                    sx={{ 
                      height: '24px',
                      fontSize: '0.75rem',
                      bgcolor: '#1f2937',
                      color: '#e5e7eb',
                      border: '1px solid #374151',
                      '& .MuiChip-icon': { color: '#7c3aed' }
                    }}
                  />
                  <Chip
                    icon={<AttachMoney sx={{ fontSize: '0.875rem', color: '#7c3aed' }} />}
                    label={`${job.budget} (${job.paymentType})`}
                    size="small"
                    sx={{ 
                      height: '24px',
                      fontSize: '0.75rem',
                      bgcolor: '#1f2937',
                      color: '#e5e7eb',
                      border: '1px solid #374151',
                      '& .MuiChip-icon': { color: '#7c3aed' }
                    }}
                  />
                  <Chip
                    icon={<AccessTime sx={{ fontSize: '0.875rem', color: '#7c3aed' }} />}
                    label={`${job.experienceLevel}`}
                    size="small"
                    sx={{ 
                      height: '24px',
                      fontSize: '0.75rem',
                      bgcolor: '#1f2937',
                      color: '#e5e7eb',
                      border: '1px solid #374151',
                      '& .MuiChip-icon': { color: '#7c3aed' }
                    }}
                  />
                </Stack>

                {/* Project Description */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: '#d1d5db',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.projectDescription}
                  </Typography>
                </Box>

                {/* Required Skills */}
                <Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {job.requiredSkills.slice(0, 4).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{ 
                          height: '22px',
                          fontSize: '0.7rem',
                          bgcolor: '#1f2937',
                          color: '#7c3aed',
                          border: '1px solid #7c3aed',
                          '&:hover': {
                            bgcolor: '#7c3aed',
                            color: '#ffffff'
                          }
                        }}
                      />
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <Chip
                        label={`+${job.requiredSkills.length - 4}`}
                        size="small"
                        sx={{ 
                          height: '22px',
                          fontSize: '0.7rem',
                          bgcolor: '#1f2937',
                          color: '#9ca3af',
                          border: '1px solid #374151'
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Deliverables */}
                <Box>
                  <Typography variant="body2" sx={{ 
                    color: '#9ca3af',
                    fontSize: '0.8125rem',
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.deliverables}
                  </Typography>
                </Box>

                {/* Date Info */}
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: 1,
                  fontSize: '0.75rem',
                  color: '#9ca3af'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarMonth sx={{ fontSize: '0.875rem' }} />
                    <Typography variant="caption">
                      {new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EventAvailable sx={{ fontSize: '0.875rem' }} />
                    <Typography variant="caption">
                      Apply by {new Date(job.applicationDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, mt: 'auto', flexShrink: 0 }}>
                <Box sx={{ width: '100%' }}>
                  {(() => {
                    const status = applicationStatuses[job._id];
                    let bgColor = '#7c3aed'; // default purple
                    let hoverColor = '#6d28d9';
                    let disabledColor = '#7c3aed';
                    
                    if (status === 'pending') {
                      bgColor = '#6b7280'; // grey
                      hoverColor = '#4b5563';
                      disabledColor = '#6b7280';
                    } else if (status === 'accepted') {
                      bgColor = '#10b981'; // green
                      hoverColor = '#059669';
                      disabledColor = '#10b981';
                    } else if (status === 'rejected') {
                      bgColor = '#ef4444'; // red
                      hoverColor = '#dc2626';
                      disabledColor = '#ef4444';
                    }
                    
                    return (
                      <Button
                        fullWidth
                        onClick={() => handleApply(job._id)}
                        startIcon={!status ? <Star sx={{ fontSize: '1rem' }} /> : null}
                        disabled={getButtonProps(job._id).disabled}
                        style={{
                          backgroundColor: bgColor,
                          color: '#ffffff',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          height: '40px',
                          borderRadius: '12px',
                          boxShadow: 'none',
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
                            opacity: 0.8
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