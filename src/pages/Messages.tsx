import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Video, Send, ArrowLeft, Search, Phone, PhoneOff, Mic, MicOff, VideoIcon, VideoOff, Coins, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useApp } from '../context/AppContext';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d45a5820`;

interface ChatSession {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPaid: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'text' | 'system';
}

interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
}

export const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser: contextUser, isAuthenticated } = useApp();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Video call state
  const [inCall, setInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !contextUser) {
      navigate('/login');
      return;
    }
    
    setCurrentUser(contextUser as User);
    loadChatSessions(contextUser.id);
  }, [isAuthenticated, contextUser]);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
      startPolling();
    } else {
      stopPolling();
    }
    
    return () => stopPolling();
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startPolling = () => {
    stopPolling();
    pollingIntervalRef.current = window.setInterval(() => {
      if (selectedSession) {
        loadMessages(selectedSession.id, true);
      }
    }, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const loadChatSessions = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/chat/sessions?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load chat sessions');

      const data = await response.json();
      setChatSessions(data);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string, silent = false) => {
    try {
      const response = await fetch(`${API_URL}/chat/messages?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load messages');

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      if (!silent) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
      }
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (!response.ok) throw new Error('Failed to search users');

      const users = await response.json();
      const filtered = users.filter((u: User) => 
        u.id !== currentUser?.id &&
        (u.name.toLowerCase().includes(query.toLowerCase()) ||
         u.role === 'mentor' || u.role === 'both')
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    }
  };

  const startNewChat = async (otherUser: User) => {
    if (!currentUser) return;

    try {
      // Check if session already exists
      const existing = chatSessions.find(s => 
        s.participants.includes(otherUser.id)
      );

      if (existing) {
        setSelectedSession(existing);
        setShowSearch(false);
        return;
      }

      // Create new session (requires payment of 50 tokens)
      const response = await fetch(`${API_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: currentUser.id,
          userId2: otherUser.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start chat');
      }

      const newSession = await response.json();
      
      // Reload user data to get updated token balance
      const userResponse = await fetch(`${API_URL}/users/${currentUser.id}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      if (userResponse.ok) {
        const updatedUser = await userResponse.json();
        localStorage.setItem('skillshare_user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
      }

      setChatSessions([newSession, ...chatSessions]);
      setSelectedSession(newSession);
      setShowSearch(false);
      toast.success(`Chat started with ${otherUser.name} (50 tokens deducted)`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast.error(error.message);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSession || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          senderId: currentUser.id,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const message = await response.json();
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Reload sessions to update last message
      loadChatSessions(currentUser.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const startVideoCall = async () => {
    if (!selectedSession) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC peer connection
      const config: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      };

      peerConnectionRef.current = new RTCPeerConnection(config);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnectionRef.current?.addTrack(track, stream);
      });

      // Handle incoming tracks
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      setInCall(true);
      toast.success('Video call started');
      
      // Send system message
      await fetch(`${API_URL}/chat/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSession.id,
          senderId: currentUser?.id,
          content: `${currentUser?.name} started a video call`,
          type: 'system',
        }),
      });
    } catch (error: any) {
      console.error('Error starting video call:', error);
      toast.error('Failed to start video call: ' + error.message);
    }
  };

  const endVideoCall = () => {
    // Stop all tracks
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    
    // Close peer connection
    peerConnectionRef.current?.close();
    
    // Clear refs
    localStreamRef.current = null;
    peerConnectionRef.current = null;
    
    setInCall(false);
    setIsMuted(false);
    setIsVideoOff(false);
    
    toast.info('Video call ended');
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const getOtherParticipant = (session: ChatSession) => {
    if (!currentUser) return { id: '', name: 'Unknown', avatar: '' };
    
    const otherId = session.participants.find(id => id !== currentUser.id) || '';
    return {
      id: otherId,
      name: session.participantNames[otherId] || 'Unknown',
      avatar: session.participantAvatars[otherId],
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-orange-500" />
              <h1 className="text-xl">Messages</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Coins className="w-4 h-4 text-orange-500" />
            <span>{currentUser?.tokens || 0} tokens</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto h-[calc(100vh-73px)] flex">
        {/* Chat List Sidebar */}
        <div className={`${selectedSession ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white border-r border-gray-200 flex-col`}>
          {/* Search Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-full flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Start New Chat (50 tokens)</span>
            </button>
          </div>

          {/* Search Panel */}
          {showSearch && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search mentors..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-1">
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    onClick={() => startNewChat(user)}
                    className="w-full flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span>{user.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                    </div>
                  </button>
                ))}
                {searchQuery && searchResults.length === 0 && (
                  <div className="text-center py-4 text-sm text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Users className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500 mb-1">No conversations yet</p>
                <p className="text-sm text-gray-400">Start a new chat to connect with mentors</p>
              </div>
            ) : (
              <div>
                {chatSessions.map(session => {
                  const other = getOtherParticipant(session);
                  return (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full flex items-center gap-3 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        selectedSession?.id === session.id ? 'bg-orange-50' : ''
                      }`}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {other.avatar ? (
                          <img src={other.avatar} alt={other.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{other.name[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between mb-1">
                          <span className="truncate">{other.name}</span>
                          {session.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{session.lastMessage || 'Start chatting...'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedSession ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white">
                  {getOtherParticipant(selectedSession).avatar ? (
                    <img 
                      src={getOtherParticipant(selectedSession).avatar} 
                      alt={getOtherParticipant(selectedSession).name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{getOtherParticipant(selectedSession).name[0]}</span>
                  )}
                </div>
                <div>
                  <div>{getOtherParticipant(selectedSession).name}</div>
                  <div className="text-xs text-gray-500">Active now</div>
                </div>
              </div>
              
              <button
                onClick={startVideoCall}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video Call</span>
              </button>
            </div>

            {/* Video Call Overlay */}
            {inCall && (
              <div className="absolute inset-0 bg-gray-900 z-50 flex flex-col">
                {/* Remote Video */}
                <div className="flex-1 relative">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Local Video (Picture-in-Picture) */}
                  <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Call Controls */}
                <div className="bg-gray-800 px-4 py-6 flex items-center justify-center gap-4">
                  <button
                    onClick={toggleMute}
                    className={`p-4 rounded-full transition-colors ${
                      isMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                  </button>
                  
                  <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-colors ${
                      isVideoOff ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <VideoIcon className="w-6 h-6 text-white" />}
                  </button>
                  
                  <button
                    onClick={endVideoCall}
                    className="p-4 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <PhoneOff className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.type === 'system' ? (
                    <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg text-center max-w-md">
                      {message.content}
                    </div>
                  ) : (
                    <div
                      className={`max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === currentUser?.id
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};