import React, { useEffect, useState } from 'react';
import axios from 'axios';
import apiClient from '../utils/apiClient';

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('accessToken'); // Retrieve JWT token from storage

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await apiClient.get('http://localhost:8000/api/admin/users/', {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT in headers
          },
        });
        console.log(response.data,"api sre");
        setUsers(response.data.results || response.data); // Adjust based on response format
      } catch (error) {
        console.error('Error fetching users:', error.response?.data || error.message);
      }
    };

    fetchUsers();
  }, [token]);

  // Delete a user
  const deleteUser = async (userId) => {
    try {
      await axios.delete(`http://localhost:8000/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update the user list after deletion
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error.response?.data || error.message);
    }
  };

  return (
    <div>
      <h1>Admin: Manage Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - {user.email}
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUserPage;
