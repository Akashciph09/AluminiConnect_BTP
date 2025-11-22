import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import StudentDashboard from './components/student/StudentDashboard';
import AlumniDashboard from './components/alumni/AlumniDashboard';
import StudentProfile from './components/student/sections/StudentProfile';
import StudentWorkshops from './components/student/sections/StudentWorkshops';
import StudentOpportunities from './components/student/sections/StudentOpportunities';
import StudentMentorship from './components/student/sections/StudentMentorship';
import StudentSettings from './components/student/sections/StudentSettings';
import FreelanceShowTell from './components/student/sections/FreelanceShowTell';
import ProfileOverview from './components/alumni/sections/ProfileOverview';
import Network from './components/alumni/sections/Network';
import Opportunities from './components/alumni/sections/Opportunities';
import Settings from './components/alumni/sections/Settings';
import JobApplications from './components/alumni/sections/JobApplications';
import Workshops from './components/alumni/sections/Workshops';
import MentorshipRequests from './components/alumni/sections/MentorshipRequests';
import JobPostForm from './components/JobPostForm';
import JobList from './components/JobList';
import PrivateRoute from './components/auth/PrivateRoute';
import StudentRoute from './components/auth/StudentRoute';
import AlumniRoute from './components/auth/AlumniRoute';
import './components/JobStyles.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Student Routes */}
            <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>}>
              <Route index element={<StudentProfile />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="workshops" element={<StudentWorkshops />} />
              <Route path="opportunities" element={<StudentOpportunities />} />
              <Route path="mentorship" element={<StudentMentorship />} />
              <Route path="settings" element={<StudentSettings />} />
              <Route path="show-tell" element={<FreelanceShowTell />} />
            </Route>

            {/* Alumni Routes */}
            <Route path="/alumni" element={<AlumniRoute><AlumniDashboard /></AlumniRoute>}>
              <Route index element={<ProfileOverview />} />
              <Route path="profile" element={<ProfileOverview />} />
              <Route path="network" element={<Network />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="applications" element={<JobApplications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="workshops" element={<Workshops />} />
              <Route path="post-job" element={<JobPostForm />} />
              <Route path="mentorship-requests" element={<MentorshipRequests />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
