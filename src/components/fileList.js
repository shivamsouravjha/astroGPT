
import React, { useEffect, useState } from 'react';
import apiClient from '../utils/apiClient';
import GenerateLink from './generateLink';

const FileList = () => {
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const token = localStorage.getItem('accessToken'); // Retrieve the stored token
                const response = await apiClient.get('http://localhost:8000/api/files/', {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the request
                    },
                });
                setFiles(response.data);
            } catch (error) {
                console.error('Failed to fetch files:', error);
            }
        };

        fetchFiles();
    }, []);

    const handleShareSecurely = async (fileId, expirationTime, accessRole) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await apiClient.post(
                `http://localhost:8000/api/files/${fileId}/share-securely`,
                {
                    expirationTime,
                    accessRole,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            alert(`Secure link: ${response.data.link}`);
        } catch (error) {
            console.error('Failed to generate secure link:', error);
            alert('Failed to generate secure link. Please try again.');
        }
    };

    return (
        <div>
            <h2>Your Files</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {files.length > 0 ? (
                <ul>
                    {files.map((file) => (
                        <div key={file.id} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                            <GenerateLink fileId={file.id} />
                            <div>
                                <h4>Share Securely:</h4>
                                <label>
                                    Expiration Time (in hours):
                                    <input
                                        type="number"
                                        placeholder="Enter hours"
                                        onChange={(e) => (file.expirationTime = e.target.value)}
                                    />
                                </label>
                                <br />
                                <label>
                                    Access Role:
                                    <select
                                        onChange={(e) => (file.accessRole = e.target.value)}
                                    >
                                        <option value="guest">Guest</option>
                                        <option value="regular">Regular User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </label>
                                <br />
                                <button
                                    onClick={() =>
                                        handleShareSecurely(file.id, file.expirationTime, file.accessRole)
                                    }
                                >
                                    Generate Secure Link
                                </button>
                            </div>
                        </div>
                    ))}
                </ul>
            ) : (
                <p>No files uploaded yet.</p>
            )}
        </div>
    );
};

export default FileList;
