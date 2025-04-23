import React from 'react';
import { Routes, Route } from 'react-router-dom';

const AdminRoute = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<div>Admin Dashboard</div>} />
      <Route path="users" element={<div>User Management</div>} />
      <Route path="settings" element={<div>Admin Settings</div>} />
    </Routes>
  );
};

export default AdminRoute; 