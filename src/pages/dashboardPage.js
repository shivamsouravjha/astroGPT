import React from 'react';
import FileUpload from '../components/fileUpload';
import FileList from '../components/fileList';
import { useNavigate } from 'react-router-dom';
const DashboardPage = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };
    return (
        <div>
            <h1>Dashboard</h1>

            <button onClick={handleLogout}>Logout</button>

            <FileUpload />
            <FileList />
        </div>
    );
};

export default DashboardPage;
