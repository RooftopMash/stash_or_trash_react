import { db } from '../firebase';

// Function to send a message
export const sendMessage = async (conversationId, message) => {
    const messageData = {
        text: message,
        timestamp: new Date(),
    };
    await db.collection('conversations').doc(conversationId).collection('messages').add(messageData);
};

// Function to fetch conversations
export const fetchConversations = async (userId) => {
    const snapshot = await db.collection('conversations').where('participants', 'array-contains', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Function to listen for new messages in a conversation
export const listenForMessages = (conversationId, callback) => {
    return db.collection('conversations').doc(conversationId).collection('messages')
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(messages);
        });
};
