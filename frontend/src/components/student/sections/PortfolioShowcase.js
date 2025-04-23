import React from 'react';
import { Box, Typography, Grid, Card, CardContent, CardMedia, CardActions, Button, Link, Chip, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const PortfolioShowcase = () => {
  // This would come from your API
  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      description: 'A full-stack e-commerce platform built with React and Node.js',
      image: '/path-to-project-image.jpg',
      technologies: ['React', 'Node.js', 'MongoDB'],
      github: 'https://github.com/username/project',
      demo: 'https://project-demo.com'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'A collaborative task management application with real-time updates',
      image: '/path-to-project-image.jpg',
      technologies: ['React', 'Firebase', 'Material-UI'],
      github: 'https://github.com/username/project',
      demo: 'https://project-demo.com'
    }
  ];

  const portfolioLinks = [
    {
      id: 1,
      platform: 'GitHub',
      url: 'https://github.com/username',
      icon: <GitHubIcon />,
      username: 'username'
    },
    {
      id: 2,
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/username',
      icon: <LinkedInIcon />,
      username: 'username'
    },
    {
      id: 3,
      platform: 'Portfolio Website',
      url: 'https://portfolio-website.com',
      icon: <LanguageIcon />,
      username: 'portfolio-website.com'
    }
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Portfolio & Work Showcase
      </Typography>

      {/* Portfolio Links */}
      <Box mb={4}>
        <Typography variant="subtitle1" gutterBottom>
          Portfolio Links
        </Typography>
        <Grid container spacing={2}>
          {portfolioLinks.map((link) => (
            <Grid item xs={12} sm={4} key={link.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1}>
                    {link.icon}
                    <Typography variant="subtitle1">{link.platform}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {link.username}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    component={Link}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                  >
                    Visit Profile
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      {/* Projects */}
      <Typography variant="subtitle1" gutterBottom>
        Projects
      </Typography>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <StyledCard>
              <CardMedia
                component="img"
                height="200"
                image={project.image}
                alt={project.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {project.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {project.technologies.map((tech, index) => (
                    <Chip key={index} label={tech} size="small" />
                  ))}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  GitHub
                </Button>
                <Button
                  component={Link}
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                >
                  Live Demo
                </Button>
              </CardActions>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PortfolioShowcase; 