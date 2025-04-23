import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProfileOverview from '../components/alumni/sections/ProfileOverview';
import Network from '../components/alumni/sections/Network';
import Opportunities from '../components/alumni/sections/Opportunities';
import Messages from '../components/alumni/sections/Messages';
import Settings from '../components/alumni/sections/Settings';
import JobApplications from '../components/alumni/sections/JobApplications';
import Workshops from '../components/alumni/sections/Workshops';
import JobPostForm from '../components/JobPostForm';

const AlumniRoute = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<ProfileOverview />} />
      <Route path="profile" element={<ProfileOverview />} />
      <Route path="network" element={<Network />} />
      <Route path="opportunities" element={<Opportunities />} />
      <Route path="applications" element={<JobApplications />} />
      <Route path="messages" element={<Messages />} />
      <Route path="settings" element={<Settings />} />
      <Route path="workshops" element={<Workshops />} />
      <Route path="post-job" element={<JobPostForm />} />
    </Routes>
  );
};

export default AlumniRoute; 