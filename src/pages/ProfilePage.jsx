// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
// ADDED getDocs to the import list
import { db, auth, storage, collection, doc, getDoc, setDoc, updateDoc, ref, uploadBytes, getDownloadURL, onSnapshot, addDoc, query, where, serverTimestamp, appId, getDocs } from '../firebase';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(); // Use translation hook

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
      setStatusMessage(t('profileUpdatedSuccessfully'));
    } catch (error) {
      setStatusMessage(t('errorUpdatingProfile', { message: error.message }));
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
      setStatusMessage(t('uploadingProfilePicture'));
      try {
        await onUploadProfilePic(profilePicFile);
        setStatusMessage(t('profilePictureUploaded'));
        setProfilePicFile(null); // Clear file input
      } catch (error) {
        setStatusMessage(t('errorUploadingPicture', { message: error.message }));
        console.error("Error uploading profile picture:", error);
      }
    } else {
      setStatusMessage(t('pleaseSelectFile'));
    }
  };

  const handleGenerateBio = async () => {
    setIsLoadingBio(true);
    setStatusMessage(t('generating'));
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
        setStatusMessage(t('bioGenerated'));
      } else {
        setStatusMessage(t('failedToGenerateBio'));
        console.error("LLM response error:", result);
      }
    } catch (error) {
      setStatusMessage(t('errorGeneratingBio', { message: error.message }));
      console.error("LLM API call error:", error);
    } finally {
      setIsLoadingBio(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('personalInformation')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="surname" className="block text-sm font-medium text-gray-700">{t('surname')}</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('cellphoneNumber')}</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700">{t('dateOfBirth')}</label>
          <input
            type="date"
            id="dob"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">{t('interests')}</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">{t('bio')}</label>
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
            {isLoadingBio ? t('generating') : t('generateBioWithAI')}
          </button>
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {t('saveProfile')}
        </button>
        {statusMessage && <p className="text-center text-sm mt-2">{statusMessage}</p>}
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('profilePicture')}</h3>
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
            {t('uploadPicture')}
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
  const { t } = useTranslation(); // Use translation hook

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
      setStatusMessage(t('socialMediaLinksUpdated'));
    } catch (error) {
      setStatusMessage(t('errorUpdatingLinks', { message: error.message }));
      console.error("Error updating social media links:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('socialMediaProfiles')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">{t('linkedinURL')}</label>
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
          <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">{t('twitterURL')}</label>
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
          <label htmlFor="github" className="block text-sm font-medium text-gray-700">{t('githubURL')}</label>
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
          {t('saveSocialLinks')}
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
  const { t } = useTranslation(); // Use translation hook

  const handleAddPost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      setPostStatus(t('postContentEmpty'));
      return;
    }
    setPostStatus(t('posting'));
    try {
      await onAddPost(newPostContent, postVisibility);
      setNewPostContent('');
      setPostStatus(t('postAddedSuccessfully'));
    } catch (error) {
      setPostStatus(t('errorAddingPost', { message: error.message }));
      console.error("Error adding wall post:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('yourWall')}</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t('wallVisibility')}</label>
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
            <span className="ml-2 text-gray-700">{t('public')}</span>
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
            <span className="ml-2 text-gray-700">{t('privateFriendsOnly')}</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleAddPost} className="mb-6">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
          rows="3"
          placeholder={t('whatsOnYourMind')}
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
        ></textarea>
        <div className="flex justify-between items-center mt-2">
          <select
            value={postVisibility}
            onChange={(e) => setPostVisibility(e.target.value)}
            className="p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="public">{t('public')}</option>
            <option value="private">{t('private')}</option>
          </select>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {t('post')}
          </button>
        </div>
        {postStatus && <p className="text-sm mt-2 text-center">{postStatus}</p>}
      </form>

      <div className="space-y-4">
        {wallPosts.length === 0 ? (
          <p className="text-gray-600 text-center">{t('noPostsYet')}</p>
        ) : (
          wallPosts.map(post => (
            <div key={post.id} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-800 text-base">{post.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t('postedBy', { userName: post.userName, timestamp: new Date(post.timestamp?.toDate()).toLocaleString(), visibility: post.visibility })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


const FriendsManager = ({ userId, friends, friendRequests, onSendRequest, onAcceptRequest, onRejectRequest, allUsers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requestStatus, setRequestStatus] = useState('');
  const { t } = useTranslation(); // Use translation hook

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
      setRequestStatus(t('friendRequestSent'));
    } catch (error) {
      setRequestStatus(t('errorSendingRequest', { message: error.message }));
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('friendsConnections')}</h3>

      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-700">{t('incomingFriendRequests', { count: friendRequests.length })}</h4>
        {friendRequests.length === 0 ? (
          <p className="text-gray-600 text-sm">{t('noNewFriendRequests')}</p>
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
                    {t('accept')}
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
                  >
                    {t('reject')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3 text-gray-700">{t('yourFriends', { count: friends.length })}</h4>
        {friends.length === 0 ? (
          <p className="text-gray-600 text-sm">{t('noFriendsYet')}</p>
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
        <h4 className="text-lg font-medium mb-3 text-gray-700">{t('findNewUsers')}</h4>
        <input
          type="text"
          placeholder={t('searchByNameOrEmail')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm mb-4 text-sm focus:ring-blue-500 focus:border-blue-500"
        />
        {requestStatus && <p className="text-sm text-center mb-2">{requestStatus}</p>}
        {filteredUsers.length === 0 && searchTerm ? (
          <p className="text-gray-600 text-center">{t('noUsersFound')}</p>
            ) : filteredUsers.length === 0 && !searchTerm ? (
              <p className="text-gray-600 text-center">{t('startTypingToFindUsers')}</p>
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
                  {t('addFriend')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const ChatInterface = ({ userId, currentUserName, friends }) => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatStatus, setChatStatus] = useState('');
  const { t } = useTranslation(); // Use translation hook

  useEffect(() => {
    if (!selectedFriend || !userId) {
      setMessages([]);
      return;
    }

    const chatRoomId1 = [userId, selectedFriend.id].sort().join('_');
    const chatRoomId2 = [selectedFriend.id, userId].sort().join('_');

    const chatQuery = query(
      collection(db, `artifacts/${appId}/public/data/chats`),
      where('chatRoomId', 'in', [chatRoomId1, chatRoomId2])
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const fetchedMessages = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(msg =>
          (msg.senderId === userId && msg.receiverId === selectedFriend.id) ||
          (msg.senderId === selectedFriend.id && msg.receiverId === userId)
        )
        .sort((a, b) => (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0));
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      setChatStatus(t('errorLoadingMessages'));
    });

    return () => unsubscribe();
  }, [selectedFriend, userId, t]);


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedFriend || !userId) {
      setChatStatus(t('messageCannotBeEmpty'));
      return;
    }
    setChatStatus(t('sending'));
    try {
      const chatRoomId = [userId, selectedFriend.id].sort().join('_');
      await addDoc(collection(db, `artifacts/${appId}/public/data/chats`), {
        chatRoomId: chatRoomId,
        senderId: userId,
        senderName: currentUserName || 'Anonymous',
        receiverId: selectedFriend.id,
        receiverName: selectedFriend.name || 'Anonymous',
        message: newMessage,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      setChatStatus(t('messageSent'));
    } catch (error) {
      setChatStatus(t('errorSendingMessage', { message: error.message }));
      console.error("Error sending chat message:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('chatWithFriends')}</h3>

      <div className="flex mb-4">
        <select
          className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => setSelectedFriend(friends.find(f => f.id === e.target.value))}
          value={selectedFriend?.id || ''}
        >
          <option value="">{t('selectFriendToChat')}</option>
          {friends.map(friend => (
            <option key={friend.id} value={friend.id}>{friend.name || friend.email}</option>
          ))}
        </select>
      </div>

      {selectedFriend ? (
        <div className="border border-gray-200 rounded-md p-4 h-80 flex flex-col">
          <div className="flex-grow overflow-y-auto mb-4 p-2 bg-gray-50 rounded-md">
            {messages.length === 0 ? (
              <p className="text-gray-600 text-center">{t('noMessagesYet')}</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block px-3 py-1 rounded-lg text-sm ${
                    msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                  }`}>
                    <strong>{msg.senderId === userId ? t('you') : msg.senderName}:</strong> {msg.message}
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
              placeholder={t('typeYourMessage')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {t('send')}
            </button>
          </form>
          {chatStatus && <p className="text-sm mt-2 text-center">{chatStatus}</p>}
        </div>
      ) : (
        <p className="text-gray-600 text-center">{t('selectFriendToStartChatting')}</p>
      )}
    </div>
  );
};

const RatingSystem = ({ userId, targetUserId, targetUserName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [averageRating, setAverageRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const { t } = useTranslation(); // Use translation hook

  useEffect(() => {
    if (!targetUserId) return;

    const ratingsQuery = query(
      collection(db, `artifacts/${appId}/public/data/ratings`),
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
  }, [targetUserId]);

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setStatusMessage(t('pleaseSelectRating'));
      return;
    }
    if (userId === targetUserId) {
      setStatusMessage(t('cannotRateOwnProfile'));
      return;
    }
    setStatusMessage(t('submitRating'));
    try {
      const userRatingQuery = query(
        collection(db, `artifacts/${appId}/public/data/ratings`),
        where('raterUserId', '==', userId),
        where('ratedUserId', '==', targetUserId)
      );
      const existingRatings = await getDocs(userRatingQuery); // getDocs is used here

      if (!existingRatings.empty) {
        setStatusMessage(t('alreadyRated'));
        return;
      }

      await addDoc(collection(db, `artifacts/${appId}/public/data/ratings`), {
        raterUserId: userId,
        ratedUserId: targetUserId,
        score: rating,
        comment: comment,
        timestamp: serverTimestamp(),
      });
      setStatusMessage(t('ratingSubmittedSuccessfully'));
      setRating(0);
      setComment('');
    } catch (error) {
      setStatusMessage(t('errorSubmittingRating', { message: error.message }));
      console.error("Error submitting rating:", error);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('userRating')}</h3>
      {averageRating !== null && (
        <p className="text-lg mb-4">
          {t('averageRating')} <span className="font-bold text-blue-600">{averageRating} / 5</span> ({totalRatings} {t('ratings')})
        </p>
      )}
      <form onSubmit={handleSubmitRating} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('yourRating')}</label>
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
          <label htmlFor="ratingComment" className="block text-sm font-medium text-gray-700">{t('commentOptional')}</label>
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
          {t('submitRating')}
        </button>
        {statusMessage && <p className="text-center text-sm mt-2">{statusMessage}</p>}
      </form>
    </div>
  );
};


const ProfilePage = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isPublicWall, setIsPublicWall] = useState(true);
  const { t } = useTranslation(); // Use translation hook

  const currentUserId = user?.uid;
  const currentUserName = userData?.name || user?.email || 'Anonymous User';

  // Fetch current user's profile data
  useEffect(() => {
    if (!currentUserId) return;

    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, "data");
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData({ id: docSnap.id, ...docSnap.data() });
        setIsPublicWall(docSnap.data().isPublicWall !== false);
      } else {
        setDoc(userDocRef, {
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          surname: '',
          phone: '',
          dob: '',
          interests: '',
          bio: '',
          profilePicUrl: user.photoURL || '',
          socialMedia: {},
          isPublicWall: true,
          createdAt: serverTimestamp(),
        });
        setUserData({
          id: user.uid,
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          surname: '',
          phone: '',
          dob: '',
          interests: '',
          bio: '',
          profilePicUrl: user.photoURL || '',
          socialMedia: {},
          isPublicWall: true,
          createdAt: new Date(),
        });
      }
    }, (error) => {
      console.error("Error fetching user profile:", error);
    });

    return () => unsubscribe();
  }, [currentUserId, user]); // Added user to dependency array

  // Fetch all users (for friend search)
  useEffect(() => {
    const usersCollectionRef = collection(db, `artifacts/${appId}/users`);
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        // Assuming profile data is nested like this: doc.data().profile.data
        // If your user data is directly under doc.data(), adjust this line:
        // ...doc.data()
        ...(doc.data().profile && doc.data().profile.data ? doc.data().profile.data : doc.data())
      }));
      setAllUsers(usersData);
    }, (error) => {
      console.error("Error fetching all users:", error);
    });
    return () => unsubscribe();
  }, []);


  // Listen for friend requests TO current user
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, `artifacts/${appId}/public/data/friendRequests`),
      where("to", "==", currentUserId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const requests = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const senderProfileRef = doc(db, `artifacts/${appId}/users/${data.from}/profile`, "data");
        const senderProfileSnap = await getDoc(senderProfileRef);
        const senderName = senderProfileSnap.exists() ? (senderProfileSnap.data().name || senderProfileSnap.data().email) : 'Unknown User';
        return { id: docSnap.id, fromUserName: senderName, ...data };
      }));
      setFriendRequests(requests.filter(req => req.status === 'pending'));
    }, (error) => {
      console.error("Error fetching friend requests:", error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Listen for friends of current user
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, `artifacts/${appId}/public/data/friendships`),
      where("users", "array-contains", currentUserId)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const friendList = await Promise.all(snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const friendId = data.users.find(id => id !== currentUserId);
        if (friendId) {
          const friendProfileRef = doc(db, `artifacts/${appId}/users/${friendId}/profile`, "data");
          const friendProfileSnap = await getDoc(friendProfileRef);
          if (friendProfileSnap.exists()) {
            const friendData = friendProfileSnap.data();
            return {
              id: friendId,
              name: friendData.name || friendData.email,
              profilePicUrl: friendData.profilePicUrl,
            };
          }
        }
        return null;
      }));
      setFriends(friendList.filter(Boolean));
    }, (error) => {
      console.error("Error fetching friends:", error);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  const [wallPosts, setWallPosts] = useState([]);

  useEffect(() => {
    if (!currentUserId) return;

    const postsQuery = query(
      collection(db, `artifacts/${appId}/public/data/wallPosts`),
      where("userId", "==", currentUserId)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const posts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
      setWallPosts(posts);
    }, (error) => {
      console.error("Error fetching wall posts:", error);
    });

    return () => unsubscribe();
  }, [currentUserId]);


  const handleSaveProfile = async (profileData) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, "data");
    await updateDoc(userDocRef, profileData);
  };

  const handleUploadProfilePic = async (file) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));
    const storageRef = ref(storage, `artifacts/${appId}/users/${currentUserId}/profile_pictures/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, "data");
    await updateDoc(userDocRef, { profilePicUrl: downloadURL });
  };

  const handleSaveSocialMedia = async (socialMediaLinks) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, "data");
    await updateDoc(userDocRef, { socialMedia: socialMediaLinks });
  };

  const handleAddWallPost = async (content, visibility) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));
    await addDoc(collection(db, `artifacts/${appId}/public/data/wallPosts`), {
      userId: currentUserId,
      userName: currentUserName,
      content: content,
      visibility: visibility,
      timestamp: serverTimestamp(),
    });
  };

  const handleToggleWallVisibility = async (makePublic) => {
    if (!currentUserId) return;
    const userDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile`, "data");
    await updateDoc(userDocRef, { isPublicWall: makePublic });
  };


  const handleSendFriendRequest = async (targetUserId) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));
    if (currentUserId === targetUserId) throw new Error(t('cannotSendRequestToSelf'));

    const existingRequestQuery = query(
      collection(db, `artifacts/${appId}/public/data/friendRequests`),
      where("from", "==", currentUserId),
      where("to", "==", targetUserId)
    );
    const existingRequestSnap = await getDocs(existingRequestQuery);
    if (!existingRequestSnap.empty) {
      throw new Error(t('requestAlreadySent'));
    }

    const existingFriendshipQuery = query(
      collection(db, `artifacts/${appId}/public/data/friendships`),
      where("users", "array-contains", currentUserId),
      where("users", "array-contains", targetUserId)
    );
    const existingFriendshipSnap = await getDocs(existingFriendshipQuery);
    if (!existingFriendshipSnap.empty) {
      throw new Error(t('alreadyFriends'));
    }

    await addDoc(collection(db, `artifacts/${appId}/public/data/friendRequests`), {
      from: currentUserId,
      to: targetUserId,
      status: 'pending',
      timestamp: serverTimestamp(),
    });
  };

  const handleAcceptFriendRequest = async (requestId, senderId, senderName) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));

    const requestDocRef = doc(db, `artifacts/${appId}/public/data/friendRequests`, requestId);
    await updateDoc(requestDocRef, { status: 'accepted' });

    const friendshipId = [currentUserId, senderId].sort().join('_');
    const friendshipRef = doc(db, `artifacts/${appId}/public/data/friendships`, friendshipId);
    await setDoc(friendshipRef, {
      users: [currentUserId, senderId],
      establishedAt: serverTimestamp(),
    });
  };

  const handleRejectFriendRequest = async (requestId) => {
    if (!currentUserId) throw new Error(t('userNotAuthenticated'));
    const requestDocRef = doc(db, `artifacts/${appId}/public/data/friendRequests`, requestId);
    await updateDoc(requestDocRef, { status: 'rejected' });
  };


  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700">{t('loadingProfile')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">{t('yourProfile')}</h1>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-xl mb-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src={userData.profilePicUrl || `https://placehold.co/120x120/cbd5e1/475569?text=${userData.name ? userData.name[0] : 'U'}`}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-300 shadow-lg"
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/120x120/cbd5e1/475569?text=${userData.name ? userData.name[0] : 'U'}`; }}
          />
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">{userData.name} {userData.surname}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-500">User ID: {user.uid}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileDetailsForm
            user={user}
            userData={userData}
            onSave={handleSaveProfile}
            onUploadProfilePic={handleUploadProfilePic}
          />

          <SocialMediaLinks
            userData={userData}
            onSave={handleSaveSocialMedia}
          />
        </div>

        <UserWall
          userId={currentUserId}
          currentUserName={currentUserName}
          isPublicWall={userData.isPublicWall}
          wallPosts={wallPosts}
          onAddPost={handleAddWallPost}
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
        />

        <ChatInterface
          userId={currentUserId}
          currentUserName={currentUserName}
          friends={friends}
        />

        <RatingSystem
          userId={currentUserId}
          targetUserId={currentUserId}
          targetUserName={currentUserName}
        />

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('verificationBrandEngagement')}</h3>
          <p className="text-gray-700 mb-2">
            {t('validationExplanation1')}
          </p>
          <p className="text-gray-700 mb-2">
            {t('validationExplanation2')}
          </p>
          <p className="text-gray-700 font-semibold">
            {t('currentValidationLevel')} <span className="text-green-600">{t('highValidation')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
