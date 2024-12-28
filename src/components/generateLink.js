import React, { useState } from 'react';
import apiClient from '../utils/apiClient';

function GenerateLink({ fileId }) {
    const [link, setLink] = useState('');
    const [expiry, setExpiry] = useState(60); // Default expiry: 60 minutes

    const handleGenerateLink = async () => {
        try {
            // Call backend to generate the unique UID for the file
            const response = await apiClient.post(`http://localhost:8000/api/files/${fileId}/generate-link/`, {
                expires_in: expiry * 60, // Convert minutes to seconds
            });
            console.log(response.data,"api sre");
            // Use the UID from the backend to construct a frontend link
            const uid = response.data.uid; // Assuming backend returns `uid`
            const frontendLink = `http://localhost:3000/download/${uid}`; // Replace with your frontend base URL
            setLink(frontendLink);
        } catch (error) {
            console.error('Error generating link:', error);
        }
    };

    return (
        <div>
            <label>
                Expiry (minutes):
                <input
                    type="number"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                />
            </label>
            <button onClick={handleGenerateLink}>Generate Link</button>
            {link && (
                <div>
                    <p>Secure Link:</p>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {link}
                    </a>
                </div>
            )}
        </div>
    );
}

export default GenerateLink;
