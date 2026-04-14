import React, { useState } from 'react';
import { Paper, Box, TextField, Button, Typography, Avatar, IconButton, AppBar, Toolbar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ChatWindow = ({ recipientName, recipientAvatar, onBack }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'other', text: 'Hey! How are you?', time: '14:30' },
        { id: 2, sender: 'you', text: 'I am doing great! How about you?', time: '14:32' },
    ]);
    
    const [newMessage, setNewMessage] = useState('');
    
    const handleSendMessage = () => {
        if (newMessage.trim()) {
            setMessages([...messages, {
                id: messages.length + 1,
                sender: 'you',
                text: newMessage,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }]);
            setNewMessage('');
        }
    };
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <AppBar position="static" sx={{ bgcolor: '#CC0000' }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onBack} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: '#FFC107' }}>{recipientAvatar}</Avatar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>{recipientName}</Typography>
                </Toolbar>
            </AppBar>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1, bgcolor: '#f5f5f5' }}>
                {messages.map((msg) => (
                    <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.sender === 'you' ? 'flex-end' : 'flex-start', mb: 1, }}>
                        <Paper sx={{ maxWidth: '70%', p: 1.5, bgcolor: msg.sender === 'you' ? '#CC0000' : '#e0e0e0', color: msg.sender === 'you' ? 'white' : 'black', }}>
                            <Typography variant="body2">{msg.text}</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{msg.time}</Typography>
                        </Paper>
                    </Box>
                ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1, p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
                <TextField fullWidth placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} size="small" />
                <Button variant="contained" sx={{ bgcolor: '#CC0000' }} onClick={handleSendMessage} endIcon={<SendIcon />}> Send </Button>
            </Box>
        </Box>
    );
};

export default ChatWindow;