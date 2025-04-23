import React from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const Messages = () => {
  // Mock data for messages
  const conversations = [
    {
      id: 1,
      name: 'John Smith',
      avatar: null,
      lastMessage: 'Thank you for your guidance regarding the internship opportunity.',
      timestamp: '10:30 AM',
      unread: true,
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      avatar: null,
      lastMessage: 'Would you be available for a quick call next week?',
      timestamp: 'Yesterday',
      unread: false,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      avatar: null,
      lastMessage: 'I appreciate your insights on the industry trends.',
      timestamp: '2 days ago',
      unread: false,
    },
    // Add more mock conversations as needed
  ];

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            Messages
          </Typography>
          <TextField
            placeholder="Search messages..."
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <List sx={{ bgcolor: 'background.paper' }}>
          {conversations.map((conversation, index) => (
            <React.Fragment key={conversation.id}>
              <ListItem
                alignItems="flex-start"
                button
                sx={{
                  bgcolor: conversation.unread ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar src={conversation.avatar}>
                    {conversation.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{ fontWeight: conversation.unread ? 'bold' : 'regular' }}
                      >
                        {conversation.name}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.8rem' }}
                      >
                        {conversation.timestamp}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: 'inline',
                        fontWeight: conversation.unread ? 'medium' : 'regular',
                      }}
                    >
                      {conversation.lastMessage}
                    </Typography>
                  }
                />
              </ListItem>
              {index < conversations.length - 1 && (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Messages; 