import React from 'react';
import './ConnectionRequests.css'; // Optional: create a CSS file for styling

const ConnectionRequests = () => {
    const pendingFriendRequests = [
        // Example friend requests data
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' }
    ];

    const pendingClientRequests = [
        // Example client requests data
        { id: 1, name: 'Acme Corp' },
        { id: 2, name: 'Beta LLC' }
    ];

    const pendingSponsorRequests = [
        // Example sponsor requests data
        { id: 1, name: 'Charity A' },
        { id: 2, name: 'Organization B' }
    ];

    const handleAccept = (id) => {
        // Handle acceptance logic here
        console.log(`Accepted request with ID: ${id}`);
    };

    const handleDecline = (id) => {
        // Handle decline logic here
        console.log(`Declined request with ID: ${id}`);
    };

    return (
        <div className="connection-requests">
            <h2>Connection Requests</h2>
            <h3>Pending Friend Requests</h3>
            <ul>
                {pendingFriendRequests.map(request => (
                    <li key={request.id}>{request.name}
                        <button onClick={() => handleAccept(request.id)}>Accept</button>
                        <button onClick={() => handleDecline(request.id)}>Decline</button>
                    </li>
                ))}
            </ul>
            <h3>Pending Client Requests</h3>
            <ul>
                {pendingClientRequests.map(request => (
                    <li key={request.id}>{request.name}
                        <button onClick={() => handleAccept(request.id)}>Accept</button>
                        <button onClick={() => handleDecline(request.id)}>Decline</button>
                    </li>
                ))}
            </ul>
            <h3>Pending Sponsor Requests</h3>
            <ul>
                {pendingSponsorRequests.map(request => (
                    <li key={request.id}>{request.name}
                        <button onClick={() => handleAccept(request.id)}>Accept</button>
                        <button onClick={() => handleDecline(request.id)}>Decline</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConnectionRequests;