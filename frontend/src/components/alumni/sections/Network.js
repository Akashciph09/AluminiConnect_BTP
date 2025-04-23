import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';

const Network = () => {
  // Mock data for network connections
  const connections = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Software Engineer',
      company: 'Google',
      graduationYear: '2018',
      department: 'Computer Science',
      avatar: null,
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Product Manager',
      company: 'Microsoft',
      graduationYear: '2019',
      department: 'Electronics',
      avatar: null,
    },
    // Add more mock connections as needed
  ];

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            My Network
          </Typography>
          <TextField
            placeholder="Search connections..."
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

        <Grid container spacing={3}>
          {connections.map((connection) => (
            <Grid item xs={12} sm={6} md={4} key={connection.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      src={connection.avatar}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    >
                      {connection.name[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {connection.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {connection.role} at {connection.company}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Department: {connection.department}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Graduation Year: {connection.graduationYear}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    fullWidth
                  >
                    Connect
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default Network; 