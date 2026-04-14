import React from 'react';

const Conversations = ({ conversations, onSelect }) => {
  return (
    <div className="conversations">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="conversation" onClick={() => onSelect(conversation.id)}>
          <div className="participants">{conversation.participants.join(', ')}</div>
          <div className="last-message">{conversation.lastMessage}</div>
          <div className="timestamp">{new Date(conversation.timestamp).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default Conversations;