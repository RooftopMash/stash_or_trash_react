import React from 'react';

const ConnectionRequests = () => {
    const requests = [
        // Sample data for demonstration. Replace with actual data fetching.
        { id: 1, name: 'John Doe', type: 'friend' },
        { id: 2, name: 'Jane Smith', type: 'client' },
        { id: 3, name: 'Acme Inc.', type: 'sponsor' },
    ];

    const handleAccept = (id) => {
        console.log(`Accepted request with id: ${id}`);
        // Add your logic to accept the request
    };

    const handleDecline = (id) => {
        console.log(`Declined request with id: ${id}`);
        // Add your logic to decline the request
    };

    return (
        <div>
            <h2>Pending Connection Requests</h2>
            <ul>
                {requests.map((request) => (
                    <li key={request.id}>
                        {request.name} ({request.type})
                        <button onClick={() => handleAccept(request.id)}>Accept</button>
                        <button onClick={() => handleDecline(request.id)}>Decline</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConnectionRequests;
