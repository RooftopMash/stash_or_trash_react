import React, { useState } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, AppBar, Toolbar, Typography } from '@mui/material';

const Messages = () => {
  const [conversations] = useState([
    { id: 1, name: 'Alice', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Bob', lastMessage: 'See you at the meeting!' },
    // Add more sample conversations if needed
  ]);
  
  const [chatThread, setChatThread] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatThread([...chatThread, { text: newMessage, sender: 'Me' }]);
      setNewMessage('');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Messages</Typography>
        </Toolbar>
      </AppBar>
      
      <List>
        {conversations.map(convo => (
          <ListItem button key={convo.id} onClick={() => setChatThread([])}>
            <ListItemText primary={convo.name} secondary={convo.lastMessage} />
          </ListItem>
        ))}
      </List>
      
      <Box>
        <List>
          {chatThread.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg.sender}: {msg.text} />
            </ListItem>
          ))}
        </List>
        
        <TextField
          variant="outlined"
          label="Type a message"
          fullWidth
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={handleSendMessage}>Send</Button>
      </Box>
    </Box>
  );
};

export default Messages;
