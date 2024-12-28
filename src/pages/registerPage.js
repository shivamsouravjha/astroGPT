import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user', // Default role
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [qrCode, setQrCode] = useState(''); // State to store the QR code
    const navigate = useNavigate();
    const hexToBase64 = (hexString) => {
        const binary = hexString
            .match(/.{1,2}/g) // Split hex string into pairs of characters
            .map((byte) => String.fromCharCode(parseInt(byte, 16))) // Convert to binary
            .join('');
        return btoa(binary); // Convert binary to Base64
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage('Passwords do not match!');
            return;
        }

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/api/register/',
                {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role, // Include role
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Extract QR code from response
            const { qr_code } = response.data;

            setQrCode(qr_code); // Save QR code to state
            setSuccessMessage('Registration successful! Scan the QR code to set up MFA.');
        } catch (error) {
            setErrorMessage(
                error.response?.data?.message || 'Registration failed. Please try again.'
            );
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
            <h1>Register</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Confirm Password:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Role:</label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="user">User</option>
                        <option value="guest">Guest</option>
                    </select>
                </div>
                <button type="submit">Register</button>
            </form>

            {qrCode && (
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <h2>Scan this QR Code</h2>
                    <img
                        src={`data:image/png;base64,${hexToBase64(qrCode)}`}
                        alt="TOTP QR Code"
                        style={{ width: '200px', height: '200px' }}
                    />
                </div>
            )}
        </div>
    );
};

export default RegisterPage;
