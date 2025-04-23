import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StudentDashboard from '../components/student/StudentDashboard';
import StudentProfile from '../components/student/sections/StudentProfile';
import StudentOpportunities from '../components/student/sections/StudentOpportunities';
import StudentMentorship from '../components/student/sections/Mentorship';
import StudentWorkshops from '../components/student/sections/StudentWorkshops';
import StudentMessages from '../components/student/sections/StudentMessages';

const StudentRoute = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<StudentDashboard />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="opportunities" element={<StudentOpportunities />} />
        <Route path="mentorship" element={<StudentMentorship />} />
        <Route path="workshops" element={<StudentWorkshops />} />
        <Route path="messages" element={<StudentMessages />} />
      </Route>
    </Routes>
  );
};

export default StudentRoute; 