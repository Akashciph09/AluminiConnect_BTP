import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, Chip, Button, Divider, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const FreelanceProjects = () => {
  // This would come from your API
  const availableProjects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      client: 'Retail Store',
      budget: '$2000',
      duration: '2 months',
      skills: ['React', 'Node.js', 'MongoDB']
    },
    {
      id: 2,
      title: 'Mobile App UI Design',
      client: 'Startup',
      budget: '$1500',
      duration: '1 month',
      skills: ['UI/UX', 'Figma', 'Adobe XD']
    }
  ];

  const ongoingProjects = [
    {
      id: 3,
      title: 'Portfolio Website',
      client: 'Photographer',
      progress: 60,
      deadline: '2 weeks',
      earnings: '$1000'
    }
  ];

  const completedProjects = [
    {
      id: 4,
      title: 'Landing Page Design',
      client: 'Marketing Agency',
      completedDate: '1 week ago',
      earnings: '$800'
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Freelance Projects
      </Typography>

      {/* Available Projects */}
      <Typography variant="subtitle1" gutterBottom>
        Available Projects
      </Typography>
      <List>
        {availableProjects.map((project) => (
          <StyledListItem key={project.id}>
            <ListItemText
              primary={project.title}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {project.client} • {project.budget} • {project.duration}
                  </Typography>
                  <Box display="flex" gap={1} mt={1}>
                    {project.skills.map((skill, index) => (
                      <Chip key={index} label={skill} size="small" />
                    ))}
                  </Box>
                </>
              }
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

      {/* Ongoing Projects */}
      <Typography variant="subtitle1" gutterBottom>
        Ongoing Projects
      </Typography>
      <List>
        {ongoingProjects.map((project) => (
          <StyledListItem key={project.id}>
            <ListItemText
              primary={project.title}
              secondary={
                <>
                  <Typography component="span" variant="body2">
                    {project.client} • Deadline: {project.deadline}
                  </Typography>
                  <Box mt={1}>
                    <LinearProgress variant="determinate" value={project.progress} />
                    <Typography variant="caption" color="text.secondary">
                      {project.progress}% Complete
                    </Typography>
                  </Box>
                </>
              }
            />
            <ListItemSecondaryAction>
              <Typography variant="subtitle2" color="primary">
                {project.earnings}
              </Typography>
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* Completed Projects */}
      <Typography variant="subtitle1" gutterBottom>
        Completed Projects
      </Typography>
      <List>
        {completedProjects.map((project) => (
          <StyledListItem key={project.id}>
            <ListItemText
              primary={project.title}
              secondary={`${project.client} • Completed ${project.completedDate}`}
            />
            <ListItemSecondaryAction>
              <Typography variant="subtitle2" color="success.main">
                {project.earnings}
              </Typography>
            </ListItemSecondaryAction>
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};

export default FreelanceProjects; 