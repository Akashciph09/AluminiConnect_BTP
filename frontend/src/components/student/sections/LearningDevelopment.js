import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Button, Divider, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const LearningDevelopment = () => {
  // This would come from your API
  const recommendedCourses = [
    {
      id: 1,
      title: 'Advanced React Development',
      platform: 'Udemy',
      instructor: 'John Smith',
      duration: '8 weeks',
      level: 'Intermediate',
      price: '$49.99'
    },
    {
      id: 2,
      title: 'Cloud Computing Fundamentals',
      platform: 'Coursera',
      instructor: 'AWS',
      duration: '6 weeks',
      level: 'Beginner',
      price: 'Free'
    }
  ];

  const upcomingWorkshops = [
    {
      id: 3,
      title: 'Web Development Best Practices',
      date: '2024-04-15',
      time: '2:00 PM EST',
      duration: '2 hours',
      instructor: 'Sarah Johnson',
      spots: 20
    },
    {
      id: 4,
      title: 'Career Development Workshop',
      date: '2024-04-20',
      time: '3:00 PM EST',
      duration: '1.5 hours',
      instructor: 'Michael Chen',
      spots: 15
    }
  ];

  const certifications = [
    {
      id: 5,
      title: 'AWS Certified Developer',
      provider: 'Amazon Web Services',
      level: 'Associate',
      duration: '3 months',
      status: 'In Progress'
    },
    {
      id: 6,
      title: 'Google Cloud Professional',
      provider: 'Google',
      level: 'Professional',
      duration: '4 months',
      status: 'Not Started'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'primary';
      case 'Completed':
        return 'success';
      case 'Not Started':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Learning & Development
      </Typography>

      {/* Recommended Courses */}
      <Typography variant="subtitle1" gutterBottom>
        Recommended Courses
      </Typography>
      <List>
        {recommendedCourses.map((course) => (
          <StyledListItem key={course.id}>
            <ListItemIcon>
              <SchoolIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={course.title}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {course.platform} • {course.instructor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {course.duration} • {course.level}
                  </Typography>
                </>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" color="primary">
                {course.price}
              </Typography>
              <Button variant="contained" size="small">
                Enroll
              </Button>
            </Box>
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Upcoming Workshops */}
      <Typography variant="subtitle1" gutterBottom>
        Upcoming Workshops
      </Typography>
      <List>
        {upcomingWorkshops.map((workshop) => (
          <StyledListItem key={workshop.id}>
            <ListItemIcon>
              <EventIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={workshop.title}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {new Date(workshop.date).toLocaleDateString()} • {workshop.time}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workshop.duration} • Instructor: {workshop.instructor}
                  </Typography>
                </>
              }
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`${workshop.spots} spots left`}
                color="warning"
                size="small"
              />
              <Button variant="contained" size="small">
                Register
              </Button>
            </Box>
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Certifications */}
      <Typography variant="subtitle1" gutterBottom>
        Certifications
      </Typography>
      <List>
        {certifications.map((cert) => (
          <StyledListItem key={cert.id}>
            <ListItemIcon>
              <EmojiEventsIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={cert.title}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {cert.provider} • {cert.level}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Duration: {cert.duration}
                  </Typography>
                </>
              }
            />
            <Chip
              label={cert.status}
              color={getStatusColor(cert.status)}
              size="small"
            />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};

export default LearningDevelopment; 