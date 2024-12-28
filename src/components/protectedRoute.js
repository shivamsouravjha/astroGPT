import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import jwtDecode from 'jwt-decode'; // Install with `npm install jwt-decode`

const ProtectedRoute = ({ requiredRole }) => {
    const token = localStorage.getItem('accessToken');
    const user = token ? jwtDecode(token) : null; // Decode token to get user info

    const hasAccess = () => {
        if (!user) return false;
        console.log(user,"eolw");
        // if (requiredRole && user.role !== requiredRole) {
        //     return false; // Redirect if the user lacks the required role
        // }
        return true;
    };

    return hasAccess() ? <Outlet /> : <Navigate to="/dashboard" />; // Redirect unauthorized users
};

export default ProtectedRoute;
