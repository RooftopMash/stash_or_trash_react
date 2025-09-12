import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot, addDoc, deleteDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Global variables for Firebase configuration
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Sub-components for ProfilePage
const ProfileDetailsForm = ({ user, userData, onSave, onUploadProfilePic }) => {
  const [name, setName] = useState(userData?.name || '');
  const [surname, setSurname] = useState(userData?.surname || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [dob, setDob] = useState(userData?.dob || '');
  const [interests, setInterests] = useState(userData?.interests || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [statusMessage, setStatusMessage] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [isLoadingBio, setIsLoadingBio] = useState(false);

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setSurname(userData.surname || '');
      setPhone(userData.phone || '');
      setDob(userData.dob || '');
      setInterests(userData.interests || '');
      setBio(userData.bio || '');
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    try {
      await onSave({ name, surname, phone, dob, interests, bio });
      setStatusMessage('Profile updated successfully!');
    } catch (error) {
      setStatusMessage(`Error updating profile: ${error.message}`);
      console.error("Error updating profile:", error);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicFile(e.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (profilePicFile) {
      setStatusMessage('Uploading profile picture...');
      try {
        await onUploadProfilePic(profilePicFile);
        setStatusMessage('Profile picture uploaded!');
        setProfilePicFile(null); // Clear file input
      } catch (error) {
        setStatusMessage(`Error uploading picture: ${error.message}`);
        console.error("Error uploading profile picture:", error);
      }
    } else {
      setStatusMessage('Please select a file to upload.');
    }
  };

  const handleGenerateBio = async () => {
    setIsLoadingBio(true);
    setStatusMessage('Generating...');
    try {
      const prompt = `Generate a short, engaging, and professional bio (max 100 words) for a user with the following interests: ${interests}. Focus on their passion and potential value to companies.`;
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: prompt }] });
      const payload = { contents: chatHistory };
      const apiKey = ""; // Canvas will provide this API key at runtime
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const generatedText = result.candidates[0].content.parts[0].text;
        setBio(generatedText);
        setStatusMessage('Bio generated!');
      } else {
        setStatusMessage('Failed to generate bio.');
        console.error("LLM response error:", result);
      }
    } catch (error) {
      setStatusMessage(`Error generating bio: ${error.message}`);
      console.error("LLM API call error:", error);
    } finally {
      setIsLoadingBio(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows="5"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
          <button
            type="button"
            onClick={handleGenerateBio}
            disabled={isLoadingBio || !interests}
            className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingBio ? 'Generating...' : 'Generate Bio with AI'}
          </button>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Profile
        </button>
        {statusMessage && <p className="text-center text-sm mt-2">{statusMessage}</p>}
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Profile Picture</h3>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <button
            onClick={handleUploadClick}
            disabled={!profilePicFile}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Picture
          </button>
        </div>
      </div>
    </div>
  );
};

const SocialMediaLinks = ({ userData, onSave }) => {
  const [linkedin, setLinkedin] = useState(userData?.socialMedia?.linkedin || '');
  const [twitter, setTwitter] = useState(userData?.socialMedia?.twitter || '');
  const [github, setGithub] = useState(userData?.socialMedia?.github || '');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (userData) {
      setLinkedin(userData.socialMedia?.linkedin || '');
      setTwitter(userData.socialMedia?.twitter || '');
      setGithub(userData.socialMedia?.github || '');
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    try {
      await onSave({ linkedin, twitter, github });
      setStatusMessage('Social media links updated successfully!');
    } catch (error) {
      setStatusMessage(`Error updating links: ${error.message}`);
      console.error("Error updating social media links:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Social Media Profiles</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input
            type="url"
            id="linkedin"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
        <div>
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">Twitter URL</label>
          <input
            type="url"
            id="twitter"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://twitter.com/yourhandle"
          />
        </div>
        <div>
          <label htmlFor="github" className="block text-sm font-medium text-gray-700">GitHub URL</label>
          <input
            type="url"
            id="github"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="https://github.com/yourusername"
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Social Links
        </button>
        {statusMessage && <p className="text-center text-sm mt-2">{statusMessage}</p>}
      </form>
    </div>
  );
};

const UserWall = ({ userId, currentUserName, isPublicWall, wallPosts, onAddPost, onToggleWallVisibility }) => {
  const [newPostContent, setNewPostContent] = useState('');
  const [postStatus, setPostStatus] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      setPostStatus("Message cannot be empty.");
      return;
    }
    setPostStatus('Posting...');
    try {
      await onAddPost(newPostContent, postVisibility);
      setNewPostContent('');
      setPostStatus('Post added successfully!');
    } catch (error) {
      setPostStatus(`Error adding post: ${error.message}`);
      console.error("Error adding wall post:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Wall</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Wall Visibility</label>
        <div className="flex items-center space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="wallVisibility"
              value="public"
              checked={isPublicWall}
              onChange={() => onToggleWallVisibility(true)}
            />
            <span className="ml-2 text-gray-700">Public</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio text-blue-600"
              name="wallVisibility"
              value="private"
              checked={!isPublicWall}
              onChange={() => onToggleWallVisibility(false)}
            />
            <span className="ml-2 text-gray-700">Private (Friends Only)</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleAddPost} className="mb-6">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          rows="3"
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
        ></textarea>
        <div className="flex justify-between items-center mt-2">
          <select
            value={postVisibility}
            onChange={(e) => setPostVisibility(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Post
          </button>
        </div>
        {postStatus && <p className="text-sm mt-2 text-center">{postStatus}</p>}
      </form>

      <div className="space-y-4">
        {wallPosts.length === 0 ? (
          <p className="text-gray-600 text-center">No posts yet.</p>
        ) : (
          wallPosts.map(post => (
            <div key={post.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-800 text-base">{post.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                Posted by {post.userName} on {new Date(post.timestamp?.toDate()).toLocaleString()} ({post.visibility})
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


const FriendsManager = ({ userId, friends, friendRequests, onSendRequest, onAcceptRequest, onRejectRequest, allUsers, allUsersError }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatus, setRequestStatus] = useState('');

  const filteredUsers = allUsers.filter(u =>
    u.id !== userId &&
    !friends.some(f => f.id === u.id) &&
    !friendRequests.some(req => req.from === u.id || req.to === u.id) &&
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSendRequest = async (targetUserId) => {
    setRequestStatus('');
    try {
      await onSendRequest(targetUserId);
      setRequestStatus('Friend request sent!');
    } catch (error) {
      setRequestStatus(`Error sending request: ${error.message}`);
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Friends & Connections</h3>

      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-700">Incoming Friend Requests ({friendRequests.length})</h4>
        {friendRequests.length === 0 ? (
          <p className="text-gray-600 text-sm">No new friend requests.</p>
        ) : (
          <ul className="space-y-2">
            {friendRequests.map(req => (
              <li key={req.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <span className="text-gray-800">{req.fromUserName || req.from}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => onAcceptRequest(req.id, req.from, req.fromUserName)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-700">Your Friends ({friends.length})</h4>
        {friends.length === 0 ? (
          <p className="text-gray-600 text-sm">No friends yet. Find new users below!</p>
        ) : (
          <ul className="space-y-2">
            {friends.map(friend => (
              <li key={friend.id} className="flex items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <img
                  src={friend.profilePicUrl || `https://placehold.co/40x40/cbd5e1/475569?text=${friend.name ? friend.name[0] : 'U'}`}
                  alt={friend.name || 'User'}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <span className="text-gray-800">{friend.name || friend.email}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="text-lg font-medium mb-3 text-gray-700">Find New Users</h4>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm mb-4 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {requestStatus && <p className="text-sm text-center mb-2">{requestStatus}</p>}
        {allUsersError ? (
          <p className="text-red-500 text-center text-sm">{allUsersError}</p>
        ) : filteredUsers.length === 0 && searchTerm ? (
          <p className="text-gray-600 text-center">No users found.</p>
        ) : filteredUsers.length === 0 && !searchTerm ? (
          <p className="text-gray-600 text-center">Start typing to find users...</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {filteredUsers.map(user => (
              <li key={user.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <img
                    src={user.profilePicUrl || `https://placehold.co/40x40/cbd5e1/475569?text=${user.name ? user.name[0] : 'U'}`}
                    alt={user.name || 'User'}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                  />
                  <span className="text-gray-800">{user.name || user.email} (ID: {user.id})</span>
                </div>
                <button
                  onClick={() => handleSendRequest(user.id)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const ChatInterface = ({ userId, currentUserName, friends, db }) => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatStatus, setChatStatus] = useState('');

  // Firestore path constants
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const chatsCollectionPath = `artifacts/${appId}/public/data/chats`;

  useEffect(() => {
    if (!selectedFriend || !userId) {
      setMessages([]);
      return;
    }

    const chatRoomId = [userId, selectedFriend.id].sort().join('_');
    const chatQuery = query(
      collection(db, chatsCollectionPath),
      where('chatRoomId', '==', chatRoomId)
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0));
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      setChatStatus("Error loading messages.");
    });

    return () => unsubscribe();
  }, [selectedFriend, userId, db]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || !userId) {
      setChatStatus('Message cannot be empty.');
      return;
    }
    setChatStatus('Sending...');
    try {
      const chatRoomId = [userId, selectedFriend.id].sort().join('_');
      await addDoc(collection(db, chatsCollectionPath), {
        chatRoomId: chatRoomId,
        senderId: userId,
        senderName: currentUserName || 'Anonymous',
        receiverId: selectedFriend.id,
        receiverName: selectedFriend.name || 'Anonymous',
        message: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      setChatStatus('Message sent!');
    } catch (error) {
      setChatStatus(`Error sending message: ${error.message}`);
      console.error("Error sending chat message:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Chat with Friends</h3>

      <div className="flex mb-4">
        <select
          className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setSelectedFriend(friends.find(f => f.id === e.target.value))}
          value={selectedFriend?.id || ''}
        >
          <option value="">Select a friend to chat...</option>
          {friends.map(friend => (
            <option key={friend.id} value={friend.id}>{friend.name || friend.email}</option>
          ))}
        </select>
      </div>

      {selectedFriend ? (
        <div className="border border-gray-200 rounded-md p-4 h-80 flex flex-col">
          <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-50 rounded-md">
            {messages.length === 0 ? (
              <p className="text-gray-600 text-center">No messages yet. Start the conversation!</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm ${
                    msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    <strong>{msg.senderId === userId ? 'You' : msg.senderName}:</strong> {msg.message}
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {msg.timestamp?.toDate().toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send
            </button>
          </form>
          {chatStatus && <p className="text-sm mt-2 text-center">{chatStatus}</p>}
        </div>
      ) : (
        <p className="text-gray-600 text-center">Select a friend to start chatting!</p>
      )}
    </div>
  );
};

const RatingSystem = ({ userId, targetUserId, targetUserName, db }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [averageRating, setAverageRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);

  // Firestore path constants
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const ratingsCollectionPath = `artifacts/${appId}/public/data/ratings`;

  useEffect(() => {
    if (!targetUserId) return;

    const ratingsQuery = query(
      collection(db, ratingsCollectionPath),
      where('ratedUserId', '==', targetUserId)
    );

    const unsubscribe = onSnapshot(ratingsQuery, (snapshot) => {
      let totalScore = 0;
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (typeof data.score === 'number') {
          totalScore += data.score;
          count++;
        }
      });
      setTotalRatings(count);
      setAverageRating(count > 0 ? (totalScore / count).toFixed(1) : null);
    }, (error) => {
      console.error("Error fetching ratings:", error);
    });

    return () => unsubscribe();
  }, [targetUserId, db]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setStatusMessage('Please select a rating.');
      return;
    }
    if (userId === targetUserId) {
      setStatusMessage('You cannot rate your own profile.');
      return;
    }
    setStatusMessage('Submitting rating...');
    try {
      const userRatingQuery = query(
        collection(db, ratingsCollectionPath),
        where('raterUserId', '==', userId),
        where('ratedUserId', '==', targetUserId)
      );
      const existingRatings = await getDocs(userRatingQuery); // getDocs is used here

      if (!existingRatings.empty) {
        setStatusMessage('You have already rated this user.');
        return;
      }

      await addDoc(collection(db, ratingsCollectionPath), {
        raterUserId: userId,
        ratedUserId: targetUserId,
        score: rating,
        comment: comment,
        timestamp: serverTimestamp(),
      });
      setStatusMessage('Rating submitted successfully!');
      setRating(0);
      setComment('');
    } catch (error) {
      setStatusMessage(`Error submitting rating: ${error.message}`);
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">User Rating</h3>
      {averageRating !== null && (
        <p className="text-lg mb-4">
          Average Rating: <span className="font-bold text-blue-600">{averageRating} / 5</span> ({totalRatings} ratings)
        </p>
      )}
      <form onSubmit={handleSubmitRating} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Your Rating</label>
          <div className="flex space-x-2 mt-1">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setRating(score)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                  ${rating >= score ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-700'}
                  hover:bg-yellow-500 transition-colors`}
              >
                {score}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="ratingComment" className="block text-sm font-medium text-gray-700">Comment (optional)</label>
          <textarea
            id="ratingComment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={userId === targetUserId}
        >
          Submit Rating
        </button>
        {statusMessage && <p className="text-center text-sm mt-2">{statusMessage}</p>}
      </form>
    </div>
  );
};

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersError, setAllUsersError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isPublicWall, setIsPublicWall] = useState(true);
  const [wallPosts, setWallPosts] = useState([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Firestore path constants
  const usersCollectionPath = `artifacts/${appId}/users`;
  const publicUsersCollectionPath = `artifacts/${appId}/public/data/public_users`;
  const friendRequestsCollectionPath = `artifacts/${appId}/public/data/friend_requests`;
  const wallPostsCollectionPath = `artifacts/${appId}/public/data/wall_posts`;

  // Firebase Auth setup
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        // User is signed out. Attempt sign-in.
        if (initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (e) {
            console.error("Error signing in with custom token:", e);
          }
        } else {
          try {
            await signInAnonymously(auth);
          } catch (e) {
            console.error("Error signing in anonymously:", e);
          }
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  const currentUserId = currentUser?.uid;
  const currentUserName = userData?.name || currentUser?.email || 'Anonymous User';

  // Fetch current user's profile data
  useEffect(() => {
    if (!currentUserId || !isAuthReady) return;

    const userDocRef = doc(db, usersCollectionPath, currentUserId, "profile", "data");
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        setUserData({ id: docSnap.id, ...docSnap.data() });
        setIsPublicWall(docSnap.data().isPublicWall !== false);
      } else {
        // Create new user data if it doesn't exist
        const defaultData = {
          email: currentUser?.email || '',
          name: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'New User',
          surname: '',
          phone: '',
          dob: '',
          interests: '',
          bio: '',
          profilePicUrl: currentUser?.photoURL || '',
          socialMedia: {},
          isPublicWall: true,
          createdAt: serverTimestamp(),
        };
        await setDoc(userDocRef, defaultData);
        await setDoc(doc(db, publicUsersCollectionPath, currentUserId), {
          id: currentUserId,
          name: defaultData.name,
          surname: defaultData.surname,
          profilePicUrl: defaultData.profilePicUrl,
        });
        setUserData({ id: currentUserId, ...defaultData });
      }
    });
    return () => unsubscribe();
  }, [currentUserId, isAuthReady, currentUser]);

  // Fetch all users for discovery
  useEffect(() => {
    if (!isAuthReady) return;
    setAllUsersError(null);

    const q = collection(db, publicUsersCollectionPath);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllUsers(fetchedUsers);
    }, (error) => {
      console.error("Error fetching all users:", error);
      setAllUsersError("Could not fetch user data. Please check your permissions.");
    });
    return () => unsubscribe();
  }, [isAuthReady]);

  // Fetch friend requests
  useEffect(() => {
    if (!currentUserId || !isAuthReady) return;
    const q = query(collection(db, friendRequestsCollectionPath), where("to", "==", currentUserId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriendRequests(requests);
    }, (error) => {
      console.error("Error fetching friend requests:", error);
    });
    return () => unsubscribe();
  }, [currentUserId, isAuthReady]);

  // Fetch friends list
  useEffect(() => {
    if (!currentUserId || !isAuthReady) return;
    const friendsCollection = collection(db, usersCollectionPath, currentUserId, "friends");
    const unsubscribe = onSnapshot(friendsCollection, (snapshot) => {
      const fetchedFriends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(fetchedFriends);
    }, (error) => {
      console.error("Error fetching friends:", error);
    });
    return () => unsubscribe();
  }, [currentUserId, isAuthReady]);

  // Fetch wall posts
  useEffect(() => {
    if (!currentUserId || !isAuthReady) return;
    const wallQuery = query(
      collection(db, wallPostsCollectionPath),
      where('userId', '==', currentUserId)
    );
    const unsubscribe = onSnapshot(wallQuery, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWallPosts(posts);
    }, (error) => {
      console.error("Error fetching wall posts:", error);
    });
    return () => unsubscribe();
  }, [currentUserId, isAuthReady]);
  
  // Handler functions
  const handleSaveProfile = async (profileData) => {
    const userDocRef = doc(db, usersCollectionPath, currentUserId, "profile", "data");
    const publicUserDocRef = doc(db, publicUsersCollectionPath, currentUserId);

    await updateDoc(userDocRef, profileData);
    await updateDoc(publicUserDocRef, {
      name: profileData.name,
      surname: profileData.surname,
    });
  };

  const handleUploadProfilePic = async (file) => {
    if (!storage || !currentUserId) return;
    const storageRef = ref(storage, `${appId}/profilePics/${currentUserId}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    const userDocRef = doc(db, usersCollectionPath, currentUserId, "profile", "data");
    const publicUserDocRef = doc(db, publicUsersCollectionPath, currentUserId);

    await updateDoc(userDocRef, { profilePicUrl: downloadURL });
    await updateDoc(publicUserDocRef, { profilePicUrl: downloadURL });
  };

  const handleSaveSocialLinks = async (socialMediaLinks) => {
    const userDocRef = doc(db, usersCollectionPath, currentUserId, "profile", "data");
    await updateDoc(userDocRef, { socialMedia: socialMediaLinks });
  };

  const handleToggleWallVisibility = async (isPublic) => {
    const userDocRef = doc(db, usersCollectionPath, currentUserId, "profile", "data");
    await updateDoc(userDocRef, { isPublicWall: isPublic });
    setIsPublicWall(isPublic);
  };

  const handleAddPost = async (content, visibility) => {
    if (!db || !currentUserId) return;
    await addDoc(collection(db, wallPostsCollectionPath), {
      userId: currentUserId,
      userName: currentUserName,
      content: content,
      timestamp: serverTimestamp(),
      visibility: visibility,
    });
  };

  const handleSendFriendRequest = async (targetUserId) => {
    if (!db || !currentUserId) return;
    // Check if a request already exists
    const q = query(
      collection(db, friendRequestsCollectionPath),
      where('from', '==', currentUserId),
      where('to', '==', targetUserId)
    );
    const existingRequests = await getDocs(q);
    if (!existingRequests.empty) {
      throw new Error("Friend request already sent.");
    }
    await addDoc(collection(db, friendRequestsCollectionPath), {
      from: currentUserId,
      fromUserName: currentUserName,
      to: targetUserId,
      toUserName: allUsers.find(u => u.id === targetUserId)?.name || 'Anonymous',
      timestamp: serverTimestamp(),
    });
  };

  const handleAcceptFriendRequest = async (requestId, fromUserId, fromUserName) => {
    if (!db || !currentUserId) return;
    const batch = db.batch();

    // Add friend to current user's friends list
    const myFriendRef = doc(db, usersCollectionPath, currentUserId, "friends", fromUserId);
    batch.set(myFriendRef, { id: fromUserId, name: fromUserName, timestamp: serverTimestamp() });

    // Add current user to friend's friends list
    const otherFriendRef = doc(db, usersCollectionPath, fromUserId, "friends", currentUserId);
    batch.set(otherFriendRef, { id: currentUserId, name: currentUserName, timestamp: serverTimestamp() });

    // Delete the request document
    const requestDocRef = doc(db, friendRequestsCollectionPath, requestId);
    batch.delete(requestDocRef);

    await batch.commit();
  };

  const handleRejectFriendRequest = async (requestId) => {
    if (!db) return;
    const requestDocRef = doc(db, friendRequestsCollectionPath, requestId);
    await deleteDoc(requestDocRef);
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-xl font-semibold text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">User Profile</h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={userData.profilePicUrl || `https://placehold.co/80x80/e5e7eb/6b7280?text=${userData.name ? userData.name[0] : 'U'}`}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">{userData.name || 'User'} {userData.surname}</h2>
              <p className="text-gray-600">ID: {currentUserId}</p>
            </div>
          </div>
        </div>

        <ProfileDetailsForm
          user={{ uid: currentUserId }}
          userData={userData}
          onSave={handleSaveProfile}
          onUploadProfilePic={handleUploadProfilePic}
        />
        <SocialMediaLinks
          userData={userData}
          onSave={handleSaveSocialLinks}
        />
        <UserWall
          userId={currentUserId}
          currentUserName={currentUserName}
          isPublicWall={isPublicWall}
          wallPosts={wallPosts}
          onAddPost={handleAddPost}
          onToggleWallVisibility={handleToggleWallVisibility}
        />
        <FriendsManager
          userId={currentUserId}
          friends={friends}
          friendRequests={friendRequests}
          onSendRequest={handleSendFriendRequest}
          onAcceptRequest={handleAcceptFriendRequest}
          onRejectRequest={handleRejectFriendRequest}
          allUsers={allUsers}
          allUsersError={allUsersError}
        />
        <ChatInterface
          userId={currentUserId}
          currentUserName={currentUserName}
          friends={friends}
          db={db}
        />
        <RatingSystem
          userId={currentUserId}
          targetUserId={currentUserId}
          targetUserName={userData?.name}
          db={db}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
