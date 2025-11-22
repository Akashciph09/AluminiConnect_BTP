import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Link,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  DesignServices as DesignIcon,
  Business as BusinessIcon,
  MoreHoriz as OtherIcon,
  GitHub as GitHubIcon,
  Launch as LaunchIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../../config';

const FreelanceShowTell = () => {
  const [tabValue, setTabValue] = useState(0);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    shortSummary: '',
    role: 'Developer',
    technologies: [],
    problemSolved: '',
    implementationDetails: '',
    githubLink: '',
    demoLink: '',
    figmaLink: '',
    attachments: [],
    isAnonymous: false
  });
  const [techInput, setTechInput] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/student-entries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data.entries || []);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to fetch entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechKeyPress = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!formData.technologies.includes(techInput.trim())) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, techInput.trim()]
        }));
      }
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (formData.shortSummary.length > 200) {
      setError('Short summary must be 200 characters or less');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${config.API_URL}/student-entries`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Entry submitted successfully!');
      setFormData({
        title: '',
        shortSummary: '',
        role: 'Developer',
        technologies: [],
        problemSolved: '',
        implementationDetails: '',
        githubLink: '',
        demoLink: '',
        figmaLink: '',
        attachments: [],
        isAnonymous: false
      });
      setTechInput('');
      fetchEntries();
      setTabValue(0); // Switch to feed tab
    } catch (err) {
      console.error('Error submitting entry:', err);
      setError(err.response?.data?.message || 'Failed to submit entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEntry = (entry) => {
    setSelectedEntry(entry);
    setOpenDialog(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Developer':
        return <CodeIcon />;
      case 'Designer':
        return <DesignIcon />;
      case 'PM':
        return <BusinessIcon />;
      default:
        return <OtherIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Freelance Experiences
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
        Share your freelancing experiences, projects, and achievements with fellow students.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Feed" icon={<VisibilityIcon />} iconPosition="start" />
          <Tab label="Submit Entry" icon={<AddIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tabValue === 0 && (
        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : entries.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No entries yet. Be the first to share your freelancing experience!
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {entries.map((entry) => (
                <Grid item xs={12} md={6} lg={4} key={entry._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        {getRoleIcon(entry.role)}
                        <Chip label={entry.role} size="small" color="primary" />
                      </Box>
                      <Typography variant="h6" gutterBottom>
                        {entry.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {entry.shortSummary}
                      </Typography>
                      <Box mb={2}>
                        <Typography variant="caption" color="text.secondary">
                          By: {entry.student?.name || 'Anonymous'}
                        </Typography>
                      </Box>
                      {entry.technologies && entry.technologies.length > 0 && (
                        <Box mb={2}>
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                            {entry.technologies.slice(0, 3).map((tech, idx) => (
                              <Chip
                                key={idx}
                                label={tech}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {entry.technologies.length > 3 && (
                              <Chip
                                label={`+${entry.technologies.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewEntry(entry)}
                      >
                        Read More
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Submit Your Freelance Experience
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., E-commerce Platform for Local Business"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Short Summary *"
                  name="shortSummary"
                  value={formData.shortSummary}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                  inputProps={{ maxLength: 200 }}
                  helperText={`${formData.shortSummary.length}/200 characters`}
                  placeholder="Brief description of your project (max 200 characters)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Role *</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    label="Role *"
                  >
                    <MenuItem value="Developer">Developer</MenuItem>
                    <MenuItem value="Designer">Designer</MenuItem>
                    <MenuItem value="PM">PM</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Technologies (Press Enter to add) *"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyPress={handleTechKeyPress}
                  placeholder="e.g., React, Node.js, MongoDB"
                  helperText="Press Enter after each technology"
                />
                {formData.technologies.length > 0 && (
                  <Box mt={2}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {formData.technologies.map((tech, idx) => (
                        <Chip
                          key={idx}
                          label={tech}
                          onDelete={() => removeTechnology(tech)}
                          color="primary"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Problem Solved *"
                  name="problemSolved"
                  value={formData.problemSolved}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={4}
                  placeholder="Describe the problem you solved"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Implementation Details *"
                  name="implementationDetails"
                  value={formData.implementationDetails}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={6}
                  placeholder="Describe how you implemented the solution, technologies used, challenges faced, etc."
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Optional Links
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="GitHub Link"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repo"
                  InputProps={{
                    startAdornment: <GitHubIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Demo Link"
                  name="demoLink"
                  value={formData.demoLink}
                  onChange={handleInputChange}
                  placeholder="https://your-demo.com"
                  InputProps={{
                    startAdornment: <LaunchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Figma Link"
                  name="figmaLink"
                  value={formData.figmaLink}
                  onChange={handleInputChange}
                  placeholder="https://figma.com/file/..."
                  InputProps={{
                    startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      style={{ marginRight: 8 }}
                    />
                    Post anonymously
                  </label>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                >
                  {loading ? 'Submitting...' : 'Submit Entry'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}

      {/* Entry Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {selectedEntry?.title}
            </Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getRoleIcon(selectedEntry.role)}
                <Chip label={selectedEntry.role} color="primary" />
                <Typography variant="body2" color="text.secondary">
                  By: {selectedEntry.student?.name || 'Anonymous'}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Summary
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedEntry.shortSummary}
              </Typography>

              {selectedEntry.technologies && selectedEntry.technologies.length > 0 && (
                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Technologies
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {selectedEntry.technologies.map((tech, idx) => (
                      <Chip key={idx} label={tech} variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}

              <Typography variant="h6" gutterBottom>
                Problem Solved
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedEntry.problemSolved}
              </Typography>

              <Typography variant="h6" gutterBottom>
                Implementation Details
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                {selectedEntry.implementationDetails}
              </Typography>

              {(selectedEntry.githubLink || selectedEntry.demoLink || selectedEntry.figmaLink) && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    Links
                  </Typography>
                  <Stack spacing={1}>
                    {selectedEntry.githubLink && (
                      <Link href={selectedEntry.githubLink} target="_blank" rel="noopener">
                        <Box display="flex" alignItems="center" gap={1}>
                          <GitHubIcon />
                          <span>GitHub Repository</span>
                          <LaunchIcon fontSize="small" />
                        </Box>
                      </Link>
                    )}
                    {selectedEntry.demoLink && (
                      <Link href={selectedEntry.demoLink} target="_blank" rel="noopener">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LaunchIcon />
                          <span>Live Demo</span>
                          <LaunchIcon fontSize="small" />
                        </Box>
                      </Link>
                    )}
                    {selectedEntry.figmaLink && (
                      <Link href={selectedEntry.figmaLink} target="_blank" rel="noopener">
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinkIcon />
                          <span>Figma Design</span>
                          <LaunchIcon fontSize="small" />
                        </Box>
                      </Link>
                    )}
                  </Stack>
                </Box>
              )}

              <Box mt={2}>
                <Typography variant="caption" color="text.secondary">
                  Posted: {new Date(selectedEntry.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FreelanceShowTell;

