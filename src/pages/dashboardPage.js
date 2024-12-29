import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import FileUpload from '../components/fileUpload';
import FileList from '../components/fileList';
import AdminFilePage from '../pages/adminPage';
import AdminUserPage from '../pages/adminUserPage';
const DashboardPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');
    const user = token ? jwtDecode(token) : null;

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    return (
        <div>
            <h1>{user?.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}</h1>
            <button onClick={handleLogout}>Logout</button>
            <FileUpload />
            <FileList />
            {user?.role === 'admin' && (
                <div>
                    <h2>Admin-Specific Actions</h2>
                    <AdminFilePage />
                    <AdminUserPage />
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
