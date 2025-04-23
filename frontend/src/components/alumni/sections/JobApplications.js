import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Link,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import axios from '../../../utils/axiosConfig';

const JobApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      
      // First get all applications with status from backend
      const applicationsResponse = await axios.get('/job-applications/alumni/applications');
      console.log('Received applications from backend:', applicationsResponse.data);

      // Then get the jobs data
      const jobsResponse = await axios.get('/jobs/alumni');
      
      // Create a map of applications for quick lookup
      const applicationsMap = applicationsResponse.data.reduce((acc, app) => {
        const key = `${app.opportunityId._id}-${app.studentId._id}`;
        acc[key] = app;
        return acc;
      }, {});
      
      console.log('Applications map:', applicationsMap);
      
      // Transform the data to match the expected structure
      const transformedApplications = jobsResponse.data.flatMap(opportunity => 
        opportunity.applicants.map(applicant => {
          const key = `${opportunity._id}-${applicant._id}`;
          const application = applicationsMap[key];
          
          // If we have status info from the backend, use it; otherwise default to pending
          const status = application?.status || 'pending';
          console.log(`Application ${key} status: ${status}`);
          
          return {
            _id: key,
            jobId: {
              _id: opportunity._id,
              projectTitle: opportunity.projectTitle,
              category: opportunity.category
            },
            studentId: {
              _id: applicant._id,
              name: applicant.name,
              email: applicant.email,
              profile: applicant.profile
            },
            status: status
          };
        })
      );
      
      console.log('Transformed applications with statuses:', transformedApplications);
      setApplications(transformedApplications);
      setError(null);
    } catch (error) {
      console.error('Error fetching applications:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = async (applicationId, status) => {
    try {
      // Extract the opportunity ID and student ID from the composite ID
      const [opportunityId, studentId] = applicationId.split('-');
      
      console.log('Before update - Application ID:', applicationId);
      console.log('Before update - Status to set:', status);
      
      // Update the application status directly using the opportunity ID and student ID
      const updateResponse = await axios.put(
        `/job-applications/update-status`,
        { 
          opportunityId,
          studentId,
          status 
        }
      );
      
      console.log('Status update complete. Response from server:', updateResponse.data);
      
      // Update the application status in the local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app._id === applicationId ? { ...app, status } : app
        )
      );
      
      setNotification({
        open: true,
        message: 'Application status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      setNotification({
        open: true,
        message: 'Failed to update application status',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<AccessTimeIcon />} label="Pending" color="default" />;
      case 'accepted':
        return <Chip icon={<CheckIcon />} label="Accepted" color="success" />;
      case 'rejected':
        return <Chip icon={<CloseIcon />} label="Rejected" color="error" />;
      default:
        return null;
    }
  };

  // Group applications by job and then by status
  const groupedApplications = applications.reduce((acc, application) => {
    console.log('Processing application:', application);
    const jobId = application.jobId._id;
    if (!acc[jobId]) {
      acc[jobId] = {
        job: application.jobId,
        applications: {
          pending: [],
          accepted: [],
          rejected: []
        }
      };
    }
    acc[jobId].applications[application.status].push(application);
    return acc;
  }, {});

  console.log('Grouped applications:', groupedApplications);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Freelance Applications
      </Typography>

      {Object.keys(groupedApplications).length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No applications received yet.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {Object.values(groupedApplications).map((group) => (
            <Accordion key={group.job._id} defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'background.paper',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ color: 'text.primary' }}>
                      {group.job.projectTitle}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {group.job.category}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${group.applications.pending.length + group.applications.accepted.length + group.applications.rejected.length} Applicants`}
                    color="primary"
                    sx={{ mr: 2 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#ba68c8">
                    Pending Applications ({group.applications.pending.length})
                  </Typography>
                  {group.applications.pending.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No pending applications.
                    </Typography>
                  ) : (
                    <List>
                      {group.applications.pending.map((application) => (
                        <ListItem
                          key={application._id}
                          divider
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            bgcolor: 'background.default',
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'text.primary',
                                  fontWeight: 'medium',
                                  fontSize: '1.1rem',
                                  mb: 1
                                }}
                              >
                                {application.studentId.name}
                              </Typography>
                            }
                            secondary={
                              <Stack direction="column" spacing={1}>
                                <Stack direction="row" spacing={2}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    {application.studentId.email}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <SchoolIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    {application.studentId.profile?.branch} - {application.studentId.profile?.graduationYear}
                                  </Typography>
                                </Stack>
                                {application.studentId.profile?.cvLink && (
                                  <Tooltip title="View CV">
                                    <Link
                                      href={application.studentId.profile.cvLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      }}
                                    >
                                      <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                                      View CV
                                    </Link>
                                  </Tooltip>
                                )}
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              {getStatusChip(application.status)}
                              <Button
                                startIcon={<CheckIcon />}
                                color="success"
                                size="small"
                                variant="contained"
                                onClick={() => handleStatusUpdate(application._id, 'accepted')}
                                sx={{ 
                                  bgcolor: 'success.main',
                                  '&:hover': {
                                    bgcolor: 'success.dark',
                                  }
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                startIcon={<CloseIcon />}
                                color="error"
                                size="small"
                                variant="contained"
                                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                                sx={{ 
                                  bgcolor: 'error.main',
                                  '&:hover': {
                                    bgcolor: 'error.dark',
                                  }
                                }}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="#4caf50">
                    Accepted Applications ({group.applications.accepted.length})
                  </Typography>
                  {group.applications.accepted.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No accepted applications.
                    </Typography>
                  ) : (
                    <List>
                      {group.applications.accepted.map((application) => (
                        <ListItem
                          key={application._id}
                          divider
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            bgcolor: 'rgba(76, 175, 80, 0.15)',
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'text.primary',
                                  fontWeight: 'medium',
                                  fontSize: '1.1rem',
                                  mb: 1
                                }}
                              >
                                {application.studentId.name}
                              </Typography>
                            }
                            secondary={
                              <Stack direction="column" spacing={1}>
                                <Stack direction="row" spacing={2}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    {application.studentId.email}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <SchoolIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    {application.studentId.profile?.branch} - {application.studentId.profile?.graduationYear}
                                  </Typography>
                                </Stack>
                                {application.studentId.profile?.cvLink && (
                                  <Tooltip title="View CV">
                                    <Link
                                      href={application.studentId.profile.cvLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      }}
                                    >
                                      <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                                      View CV
                                    </Link>
                                  </Tooltip>
                                )}
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              {getStatusChip(application.status)}
                              <Button
                                variant="contained"
                                size="small"
                                disabled
                                sx={{ 
                                  bgcolor: 'success.main',
                                  color: 'white'
                                }}
                              >
                                Accepted
                              </Button>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" color="#f44336">
                    Rejected Applications ({group.applications.rejected.length})
                  </Typography>
                  {group.applications.rejected.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                      No rejected applications.
                    </Typography>
                  ) : (
                    <List>
                      {group.applications.rejected.map((application) => (
                        <ListItem
                          key={application._id}
                          divider
                          sx={{
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            bgcolor: 'rgba(244, 67, 54, 0.15)',
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                  color: 'text.primary',
                                  fontWeight: 'medium',
                                  fontSize: '1.1rem',
                                  mb: 1
                                }}
                              >
                                {application.studentId.name}
                              </Typography>
                            }
                            secondary={
                              <Stack direction="column" spacing={1}>
                                <Stack direction="row" spacing={2}>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    {application.studentId.email}
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      color: 'text.secondary',
                                      display: 'flex',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <SchoolIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                                    {application.studentId.profile?.branch} - {application.studentId.profile?.graduationYear}
                                  </Typography>
                                </Stack>
                                {application.studentId.profile?.cvLink && (
                                  <Tooltip title="View CV">
                                    <Link
                                      href={application.studentId.profile.cvLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                          textDecoration: 'underline',
                                        },
                                      }}
                                    >
                                      <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
                                      View CV
                                    </Link>
                                  </Tooltip>
                                )}
                              </Stack>
                            }
                          />
                          <ListItemSecondaryAction>
                            <Stack direction="row" spacing={1}>
                              {getStatusChip(application.status)}
                              <Button
                                variant="contained"
                                size="small"
                                disabled
                                sx={{ 
                                  bgcolor: 'error.main',
                                  color: 'white'
                                }}
                              >
                                Rejected
                              </Button>
                            </Stack>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JobApplications; 