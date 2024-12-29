import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiClient from '../utils/apiClient';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiClient.get('https://localhost:8000/api/users/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User Management</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagementPage;
