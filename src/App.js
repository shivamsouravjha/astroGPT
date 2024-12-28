import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LoginPage from './pages/loginPage';
import HomePage from './pages/homePage';
import RegisterPage from './pages/registerPage';
import DashboardPage from './pages/dashboardPage';
import UserManagementPage from './pages/userManagementPage';
import FileSharingPage from './pages/shareFilePage';
import ProtectedRoute from './components/protectedRoute';
import AdminUserPage from './pages/adminUserPage';
import AdminFilePage from './pages/adminPage';
import apiClient from './utils/apiClient';
import DownloadPage from './pages/downloadPage';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken && refreshToken) {
        try {
          const response = await apiClient.post('/token/refresh/', {
            refresh: refreshToken,
          });
          // Save the new access token
          localStorage.setItem('accessToken', response.data.access);
          console.log('Access token refreshed successfully!');
        } catch (error) {
          console.error('Failed to refresh token:', error.response?.data || error.message);
          // Clear tokens and redirect to login if refresh fails
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login'; // Redirect to login page
        }
      }
    };


    checkAuth();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/download/:uid" element={<DownloadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/share/:fileId" element={<FileSharingPage />} />
      </Route>
      <Route element={<ProtectedRoute requiredRole="admin" />}>
        <Route path="/admin/users" element={<AdminUserPage />} />
        <Route path="/admin/files" element={<AdminFilePage />} />
      </Route>

    </Routes>
  );
}

export default App;
