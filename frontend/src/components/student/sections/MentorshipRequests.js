import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Typography, Alert, Spin, message } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MentorshipRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const verifyToken = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('No authentication token found. Please log in again.');
                return false;
            }

            console.log('Verifying token...');
            const response = await axios.get('http://localhost:3002/api/auth/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Token verification response:', response.data);
            setUserInfo(response.data);
            return true;
        } catch (error) {
            console.error('Token verification error:', error);
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                message.error(error.response.data.message || 'Token verification failed');
            } else {
                message.error('Failed to verify token');
            }
            return false;
        }
    };

    const createTestRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('No authentication token found. Please log in again.');
                return;
            }

            console.log('Creating test request with token:', token ? 'Present' : 'Missing');
            
            const response = await axios.post(
                'http://localhost:3002/api/mentorship/create-test-request',
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Test request response:', response.data);
            message.success('Test request created successfully');
            fetchMentorshipRequests();
        } catch (error) {
            console.error('Error creating test request:', error);
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                message.error(error.response.data.message || 'Failed to create test request');
            } else {
                message.error('Failed to create test request');
            }
        }
    };

    const checkDatabaseState = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('No authentication token found. Please log in again.');
                return;
            }

            console.log('Checking database state...');
            
            const response = await axios.get(
                'http://localhost:3002/api/mentorship/test-db-state',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Database state:', response.data);
            message.success('Database state checked successfully');
        } catch (error) {
            console.error('Error checking database state:', error);
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
                message.error(error.response.data.message || 'Failed to check database state');
            } else {
                message.error('Failed to check database state');
            }
        }
    };

    const fetchMentorshipRequests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please log in again.');
                return;
            }

            console.log('Auth token:', token ? 'Present' : 'Missing');
            
            // First verify the token
            const isTokenValid = await verifyToken();
            if (!isTokenValid) {
                setError('Authentication failed. Please log in again.');
                return;
            }

            console.log('Fetching mentorship requests for user:', userInfo);
            
            const response = await axios.get('http://localhost:3002/api/mentorship/student-requests', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            console.log('Raw response data:', JSON.stringify(response.data, null, 2));
            
            if (!response.data || !Array.isArray(response.data)) {
                console.error('Invalid response format:', response.data);
                setError('Invalid response format from server');
                return;
            }

            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching mentorship requests:', error);
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
                setError(error.response.data.message || 'Failed to fetch mentorship requests');
            } else if (error.request) {
                console.error('No response received:', error.request);
                setError('No response received from server');
            } else {
                console.error('Request setup error:', error.message);
                setError('Error setting up the request');
            }
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMentorshipRequests();
    }, []);

    const handleSendRequest = async (mentorId) => {
        try {
            const response = await axios.post(
                'http://localhost:3002/api/mentorship/request',
                { mentorId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            console.log('Mentorship request sent:', response.data);
            fetchMentorshipRequests();
        } catch (error) {
            console.error('Error sending mentorship request:', error);
            if (error.response) {
                setError(error.response.data.message || 'Failed to send mentorship request');
            } else {
                setError('Failed to send mentorship request');
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <Title level={2}>Mentorship Requests</Title>
            
            {userInfo && (
                <Alert
                    message="User Info"
                    description={`Logged in as ${userInfo.role} (ID: ${userInfo.userId})`}
                    type="info"
                    showIcon
                    style={{ marginBottom: '20px' }}
                />
            )}
            
            <div style={{ marginBottom: '20px' }}>
                <Button 
                    type="primary" 
                    onClick={createTestRequest}
                    style={{ marginRight: '10px' }}
                >
                    Create Test Request
                </Button>
                <Button 
                    onClick={checkDatabaseState}
                >
                    Check Database State
                </Button>
            </div>
            
            {requests.length === 0 ? (
                <Card>
                    <Text>No mentorship requests found.</Text>
                </Card>
            ) : (
                requests.map(request => (
                    <Card 
                        key={request._id} 
                        style={{ marginBottom: '16px' }}
                        actions={[
                            request.status === 'pending' && (
                                <Button 
                                    type="primary" 
                                    icon={<CheckCircleOutlined />}
                                    onClick={() => handleSendRequest(request.mentor._id)}
                                >
                                    Accept
                                </Button>
                            ),
                            request.status === 'pending' && (
                                <Button 
                                    danger 
                                    icon={<CloseCircleOutlined />}
                                    onClick={() => handleSendRequest(request.mentor._id)}
                                >
                                    Reject
                                </Button>
                            )
                        ].filter(Boolean)}
                    >
                        <Card.Meta
                            avatar={<UserOutlined style={{ fontSize: '24px' }} />}
                            title={request.mentor?.name || 'Unknown Mentor'}
                            description={
                                <div>
                                    <Text>Status: {request.status}</Text>
                                    <br />
                                    <Text>Email: {request.mentor?.email || 'No email available'}</Text>
                                    <br />
                                    {request.mentor?.profile?.currentPosition && (
                                        <Text>Position: {request.mentor.profile.currentPosition}</Text>
                                    )}
                                    {request.mentor?.profile?.branch && (
                                        <Text>Branch: {request.mentor.profile.branch}</Text>
                                    )}
                                    {request.mentor?.profile?.graduationYear && (
                                        <Text>Graduation Year: {request.mentor.profile.graduationYear}</Text>
                                    )}
                                </div>
                            }
                        />
                    </Card>
                ))
            )}
        </div>
    );
};

export default MentorshipRequests; 