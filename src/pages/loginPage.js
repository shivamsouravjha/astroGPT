import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState(''); // For MFA TOTP input
  const [step, setStep] = useState(1); // Step 1: Credentials, Step 2: TOTP
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const validateOrRefreshToken = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken) {
        try {
          // Validate the access token
          await axios.get('https://localhost:8000/api/auth/validate/', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          dispatch(setToken(accessToken)); // Token is valid, set it in Redux
          navigate('/dashboard'); // Redirect to dashboard
        } catch (error) {
          console.warn('Access token expired, attempting refresh...');
          if (refreshToken) {
            try {
              // Refresh the token if expired
              const response = await axios.post('https://localhost:8000/api/token/refresh/', {
                refresh: refreshToken,
              });
              const newAccessToken = response.data.access;
              localStorage.setItem('accessToken', newAccessToken); // Update access token
              dispatch(setToken(newAccessToken));
              navigate('/dashboard'); // Redirect to dashboard
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        }
      }
    };

    validateOrRefreshToken();
  }, [dispatch, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (step === 1) {
      try {
        // Step 1: Validate username and password
        const response = await axios.post(
          'https://localhost:8000/api/login/',
          { username, password, step: '1' },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        // If credentials are valid, move to step 2
        setStep(2);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          const errorData = error.response.data;
          if (errorData.error === 'MFA is not enabled' && errorData.redirect) {
            // Redirect user to the enable MFA page
            navigate(errorData.redirect, { state: { username, password } });
            return;
          }
        }
        console.error('Login failed:', error.response ? error.response.data : error.message);

      }
    } else if (step === 2) {
      try {
        // Step 2: Validate TOTP
        const response = await axios.post(
          'https://localhost:8000/api/login/',
          { username, totp, step: '2' },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
        const accessToken = response.data.access;
        const refreshToken = response.data.refresh;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(setToken(accessToken));

        navigate('/dashboard'); // Redirect to dashboard
      } catch (error) {
        console.error('TOTP verification failed:', error.response ? error.response.data : error.message);
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h1>Login</h1>
      {step === 1 && (
        <>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </>
      )}
      {step === 2 && (
        <div>
          <label>Enter TOTP Code:</label>
          <input
            type="text"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
            required
          />
        </div>
      )}
      <button type="submit">
        {step === 1 ? 'Validate Credentials' : 'Login'}
      </button>
    </form>
  );
};

export default LoginPage;
