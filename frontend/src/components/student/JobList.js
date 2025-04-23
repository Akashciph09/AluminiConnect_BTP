import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import config from '../../config';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, isStudent } = useAuth();

  // Debug information component
  const DebugInfo = () => (
    <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
      <Typography variant="h6">Debug Information</Typography>
      <Typography>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</Typography>
      <Typography>Is Student: {isStudent ? 'Yes' : 'No'}</Typography>
      <Typography>User Role: {user?.role || 'Not logged in'}</Typography>
      <Typography>User ID: {user?.id || 'N/A'}</Typography>
      <Typography>Total Jobs: {jobs.length}</Typography>
      <Typography>Applications: {applications.length}</Typography>
      <Typography>API URL: {config.API_URL}</Typography>
      <Typography>Last Updated: {new Date().toLocaleString()}</Typography>
      {error && <Typography color="error">Error: {error}</Typography>}
      {jobs.length === 0 && <Typography color="warning">No jobs found</Typography>}
    </Box>
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        console.log('Fetching jobs from:', `${config.API_URL}${config.JOBS_ENDPOINT}`);
        const response = await axios.get(`${config.API_URL}${config.JOBS_ENDPOINT}`);
        console.log('Jobs fetched successfully:', {
          count: response.data.length,
          jobs: response.data
        });
        setJobs(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(err.response?.data?.message || 'Failed to fetch jobs');
        setJobs([]);
      }
    };

    const fetchApplications = async () => {
      if (isAuthenticated && isStudent) {
        try {
          const token = localStorage.getItem('token');
          console.log('Fetching applications for student:', user?.id);
          const response = await axios.get(
            `${config.API_URL}${config.JOB_APPLICATIONS_ENDPOINT}/student`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log('Applications fetched successfully:', {
            count: response.data.length,
            applications: response.data
          });
          setApplications(response.data);
        } catch (err) {
          console.error('Error fetching applications:', {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setApplications([]);
        }
      }
    };

    Promise.all([fetchJobs(), fetchApplications()])
      .catch(err => {
        console.error('Error in Promise.all:', {
          message: err.message,
          stack: err.stack
        });
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, isStudent, user?.id]);

  const handleApply = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${config.API_URL}${config.JOB_APPLICATIONS_ENDPOINT}/apply`,
        { jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh applications after applying
      const response = await axios.get(
        `${config.API_URL}${config.JOB_APPLICATIONS_ENDPOINT}/student`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(response.data);
      
      setError(null);
    } catch (err) {
      console.error('Error applying for job:', err);
      setError(err.response?.data?.message || 'Failed to apply for job');
    }
  };

  const hasApplied = (jobId) => {
    return applications.some(app => app.jobId === jobId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Debug information in development */}
      {process.env.NODE_ENV === 'development' && <DebugInfo />}

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} key={job._id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="div">
                  {job.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {job.company}
                </Typography>
                <Typography variant="body2" paragraph>
                  {job.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Location: {job.location}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Salary: {job.salary}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {!isAuthenticated ? (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled
                    >
                      Login to Apply
                    </Button>
                  ) : !isStudent ? (
                    <Button
                      variant="contained"
                      color="primary"
                      disabled
                    >
                      Only Students Can Apply
                    </Button>
                  ) : hasApplied(job._id) ? (
                    <Button
                      variant="contained"
                      color="success"
                      disabled
                    >
                      Application Pending
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleApply(job._id)}
                    >
                      Apply Now
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default JobList; 