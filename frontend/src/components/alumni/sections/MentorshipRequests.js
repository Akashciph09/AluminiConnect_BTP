import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../../config';

const MentorshipRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Auth token:', token ? 'Present' : 'Missing');

      // First check if we have any students
      const studentsResponse = await axios.get(`${config.API_URL}/users/alumni`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Found students:', studentsResponse.data);
      
      if (studentsResponse.data && studentsResponse.data.length > 0) {
        // Create a test request with the first student
        await createTestRequest(studentsResponse.data[0]._id);
      } else {
        console.log('No students found in the database');
      }

      // Fetch mentorship requests
      await fetchMentorshipRequests();
    } catch (error) {
      console.error('Error initializing data:', error);
      setError('Failed to initialize data');
    } finally {
      setLoading(false);
    }
  };

  const createTestRequest = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Creating test request for student:', studentId);
      
      const response = await axios.post(`${config.API_URL}/mentorship/create-test-request/${studentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Test request created:', response.data);
    } catch (error) {
      console.error('Error creating test request:', error);
    }
  };

  const fetchMentorshipRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First, get all requests for debugging
      const debugResponse = await axios.get(`${config.API_URL}/mentorship/debug/all-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('All requests in database:', debugResponse.data);
      
      // Then get mentor-specific requests
      const response = await axios.get(`${config.API_URL}/mentorship/mentor-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      console.log('Fetched requests:', response.data);
      
      if (response.data && response.data.length > 0) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
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
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      await axios.put(`${config.API_URL}/mentorship/${requestId}/status`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchMentorshipRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setError('Failed to update request status');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Mentorship Requests</h2>
      
      {requests.length === 0 ? (
        <div className="text-center text-gray-500">No mentorship requests found</div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {request.student?.profilePicture ? (
                    <img
                      src={request.student.profilePicture}
                      alt={request.student.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {request.student?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{request.student?.name || 'Unknown Student'}</h3>
                    <p className="text-gray-600">{request.student?.email || 'No email provided'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'accepted')}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(request._id, 'rejected')}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
              {request.message && (
                <p className="mt-2 text-gray-700">{request.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Requested on: {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorshipRequests; 