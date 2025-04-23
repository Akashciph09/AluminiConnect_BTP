import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const InternshipsJobs = () => {
  // This would come from your API
  const latestListings = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'Tech Corp',
      location: 'Remote',
      postedDate: '2 days ago',
      status: 'active'
    },
    {
      id: 2,
      title: 'Backend Developer Intern',
      company: 'Data Solutions',
      location: 'Hybrid',
      postedDate: '1 week ago',
      status: 'active'
    }
  ];

  const appliedJobs = [
    {
      id: 3,
      title: 'Full Stack Developer Intern',
      company: 'Web Solutions',
      appliedDate: '1 week ago',
      status: 'pending'
    }
  ];

  const savedJobs = [
    {
      id: 4,
      title: 'UI/UX Designer Intern',
      company: 'Design Studio',
      savedDate: '2 weeks ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Internships & Jobs
      </Typography>

      {/* Latest Listings */}
      <Typography variant="subtitle1" gutterBottom>
        Latest Listings
      </Typography>
      <List>
        {latestListings.map((job) => (
          <StyledListItem key={job.id}>
            <ListItemText
              primary={job.title}
              secondary={`${job.company} • ${job.location} • Posted ${job.postedDate}`}
            />
            <ListItemSecondaryAction>
              <Button variant="contained" color="primary" size="small">
                Apply
              </Button>
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Applied Jobs */}
      <Typography variant="subtitle1" gutterBottom>
        Applied Jobs
      </Typography>
      <List>
        {appliedJobs.map((job) => (
          <StyledListItem key={job.id}>
            <ListItemText
              primary={job.title}
              secondary={`${job.company} • Applied ${job.appliedDate}`}
            />
            <ListItemSecondaryAction>
              <Chip
                label={job.status}
                color={getStatusColor(job.status)}
                size="small"
              />
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Saved Jobs */}
      <Typography variant="subtitle1" gutterBottom>
        Saved Jobs
      </Typography>
      <List>
        {savedJobs.map((job) => (
          <StyledListItem key={job.id}>
            <ListItemText
              primary={job.title}
              secondary={`${job.company} • Saved ${job.savedDate}`}
            />
            <ListItemSecondaryAction>
              <Button variant="outlined" color="primary" size="small">
                Apply
              </Button>
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};

export default InternshipsJobs; 