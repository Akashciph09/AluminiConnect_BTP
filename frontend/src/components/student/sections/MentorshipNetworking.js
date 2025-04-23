import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Divider, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const MentorshipNetworking = () => {
  // This would come from your API
  const mentorshipRequests = [
    {
      id: 1,
      mentor: 'Sarah Johnson',
      company: 'Google',
      position: 'Senior Software Engineer',
      status: 'pending',
      message: 'Interested in mentoring in web development'
    }
  ];

  const connectedAlumni = [
    {
      id: 2,
      name: 'Michael Chen',
      company: 'Microsoft',
      position: 'Product Manager',
      connectionDate: '2 months ago'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      company: 'Amazon',
      position: 'Frontend Developer',
      connectionDate: '1 month ago'
    }
  ];

  const recentMessages = [
    {
      id: 4,
      sender: 'Sarah Johnson',
      message: 'Would you like to schedule a mentoring session?',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 5,
      sender: 'Michael Chen',
      message: 'Great work on your latest project!',
      time: '1 day ago',
      unread: false
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Mentorship & Networking
      </Typography>

      {/* Mentorship Requests */}
      <Typography variant="subtitle1" gutterBottom>
        Mentorship Requests
      </Typography>
      <List>
        {mentorshipRequests.map((request) => (
          <StyledListItem key={request.id}>
            <ListItemAvatar>
              <Avatar>{request.mentor[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={request.mentor}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {request.position} at {request.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.message}
                  </Typography>
                </>
              }
            />
            <Chip
              label={request.status}
              color={getStatusColor(request.status)}
              size="small"
            />
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Connected Alumni */}
      <Typography variant="subtitle1" gutterBottom>
        Connected Alumni
      </Typography>
      <List>
        {connectedAlumni.map((alumni) => (
          <StyledListItem key={alumni.id}>
            <ListItemAvatar>
              <Avatar>{alumni.name[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={alumni.name}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {alumni.position} at {alumni.company}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Connected {alumni.connectionDate}
                  </Typography>
                </>
              }
            />
            <Button variant="outlined" size="small">
              Message
            </Button>
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Recent Messages */}
      <Typography variant="subtitle1" gutterBottom>
        Recent Messages
      </Typography>
      <List>
        {recentMessages.map((message) => (
          <StyledListItem key={message.id}>
            <ListItemAvatar>
              <Avatar>{message.sender[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={message.sender}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {message.message}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {message.time}
                  </Typography>
                </>
              }
            />
            {message.unread && (
              <Chip
                label="New"
                color="primary"
                size="small"
                sx={{ ml: 1 }}
              />
            )}
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};

export default MentorshipNetworking; 