import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const JobPostForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        projectTitle: '',
        projectDescription: '',
        category: '',
        requiredSkills: '',
        experienceLevel: 'Beginner',
        deliverables: '',
        startDate: '',
        deadline: '',
        estimatedHoursPerWeek: '',
        budget: '',
        paymentType: 'Fixed',
        applicationDeadline: '',
        contactName: user?.name || '',
        contactEmail: user?.email || '',
        contactPhone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('You must be logged in to post a freelance opportunity');
            }

            const requiredFields = [
                'projectTitle', 'projectDescription', 'category', 'requiredSkills',
                'experienceLevel', 'deliverables', 'startDate', 'deadline',
                'budget', 'paymentType', 'applicationDeadline', 'contactName',
                'contactEmail', 'contactPhone'
            ];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
            }

            const formattedData = {
                ...formData,
                requiredSkills: formData.requiredSkills.split(',').map(skill => skill.trim())
            };

            const response = await axios.post(`${config.API_URL}${config.JOBS_ENDPOINT}`, formattedData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data) {
                alert('Freelance opportunity posted successfully!');
                setFormData({
                    projectTitle: '',
                    projectDescription: '',
                    category: '',
                    requiredSkills: '',
                    experienceLevel: 'Beginner',
                    deliverables: '',
                    startDate: '',
                    deadline: '',
                    estimatedHoursPerWeek: '',
                    budget: '',
                    paymentType: 'Fixed',
                    applicationDeadline: '',
                    contactName: user?.name || '',
                    contactEmail: user?.email || '',
                    contactPhone: '',
                });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setError(error.response?.data?.message || error.message || 'An error occurred while posting the opportunity');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        navigate('/alumni/opportunities');
    };

    return (
        <Dialog
            open={true}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                }
            }}
        >
            <DialogTitle sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                py: 2
            }}>
                <Typography variant="h5" component="div" sx={{ 
                    fontWeight: 'bold',
                    color: 'rgba(0, 0, 0, 0.9)',
                    textAlign: 'center'
                }}>
                    Post a New Freelance Opportunity
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                p: 3
            }}>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Project Title"
                                name="projectTitle"
                                value={formData.projectTitle}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Project Description"
                                name="projectDescription"
                                value={formData.projectDescription}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Required Skills (comma-separated)"
                                name="requiredSkills"
                                value={formData.requiredSkills}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Deliverables"
                                name="deliverables"
                                value={formData.deliverables}
                                onChange={handleChange}
                                multiline
                                rows={3}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>Category</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    label="Category"
                                    sx={{
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '& .MuiSelect-icon': {
                                            color: 'rgba(0, 0, 0, 0.8)'
                                        }
                                    }}
                                >
                                    <MenuItem value="">Select Category</MenuItem>
                                    <MenuItem value="Web Development">Web Development</MenuItem>
                                    <MenuItem value="Mobile Development">Mobile Development</MenuItem>
                                    <MenuItem value="Data Science">Data Science</MenuItem>
                                    <MenuItem value="Machine Learning">Machine Learning</MenuItem>
                                    <MenuItem value="UI/UX Design">UI/UX Design</MenuItem>
                                    <MenuItem value="Cloud Computing">Cloud Computing</MenuItem>
                                    <MenuItem value="Cybersecurity">Cybersecurity</MenuItem>
                                    <MenuItem value="DevOps">DevOps</MenuItem>
                                    <MenuItem value="Blockchain">Blockchain</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>Experience Level</InputLabel>
                                <Select
                                    name="experienceLevel"
                                    value={formData.experienceLevel}
                                    onChange={handleChange}
                                    label="Experience Level"
                                    sx={{
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '& .MuiSelect-icon': {
                                            color: 'rgba(0, 0, 0, 0.8)'
                                        }
                                    }}
                                >
                                    <MenuItem value="Beginner">Beginner</MenuItem>
                                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                                    <MenuItem value="Advanced">Advanced</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Start Date"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Deadline"
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Application Deadline"
                                name="applicationDeadline"
                                type="date"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                                required
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>Payment Type</InputLabel>
                                <Select
                                    name="paymentType"
                                    value={formData.paymentType}
                                    onChange={handleChange}
                                    label="Payment Type"
                                    sx={{
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '& .MuiSelect-icon': {
                                            color: 'rgba(0, 0, 0, 0.8)'
                                        }
                                    }}
                                >
                                    <MenuItem value="Fixed">Fixed</MenuItem>
                                    <MenuItem value="Hourly">Hourly</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact Name"
                                name="contactName"
                                value={formData.contactName}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact Email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact Phone"
                                name="contactPhone"
                                value={formData.contactPhone}
                                onChange={handleChange}
                                required
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        bgcolor: 'rgba(255, 255, 255, 0.3)',
                                        color: 'rgba(0, 0, 0, 1)',
                                        '& fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        '&.Mui-focused': {
                                            color: 'primary.main',
                                        }
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'rgba(0, 0, 0, 1)',
                                        '&::placeholder': {
                                            color: 'rgba(0, 0, 0, 0.5)',
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                    <DialogActions sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                        p: 2
                    }}>
                        <Button onClick={handleClose} sx={{ 
                            color: 'rgba(0, 0, 0, 0.8)',
                            '&:hover': {
                                bgcolor: 'rgba(0, 0, 0, 0.05)'
                            }
                        }}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={loading}
                            sx={{
                                bgcolor: 'primary.main',
                                '&:hover': {
                                    bgcolor: 'primary.dark'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Post Opportunity'}
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default JobPostForm; 