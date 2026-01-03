import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/Header';
import { Video, Mic, MicOff, VideoOff, Monitor, MessageSquare, Users, Phone, Settings } from 'lucide-react';

export const LiveSession: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const participants = [
    { id: '1', name: 'John Smith (Host)', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop', isMentor: true },
    { id: '2', name: 'You', avatar: 'https://images.unsplash.com/photo-1514369118554-e20d93546b30?w=200&h=200&fit=crop', isMentor: false }
  ];

  const chatMessages = [
    { id: '1', sender: 'John Smith', message: 'Welcome to the session! Feel free to ask questions anytime.', timestamp: '2:00 PM' },
    { id: '2', sender: 'You', message: 'Thanks! Excited to learn.', timestamp: '2:01 PM' }
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      // Simulate sending message
      setChatMessage('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4 grid grid-cols-2 gap-4">
            {/* Mentor Video (Large) */}
            <div className="col-span-2 bg-gray-800 rounded-xl overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img
                      src={participants[0].avatar}
                      alt={participants[0].name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <p className="text-white text-xl">{participants[0].name}</p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/70 text-white rounded-lg text-sm">
                {participants[0].name}
              </div>
              {isScreenSharing && (
                <div className="absolute top-4 left-4 px-3 py-2 bg-green-600 text-white rounded-lg text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Screen Sharing
                </div>
              )}
            </div>

            {/* Your Video (Small) */}
            <div className="bg-gray-800 rounded-xl overflow-hidden relative h-48">
              <div className="w-full h-full flex items-center justify-center">
                {isVideoOff ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <VideoOff className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-white">Camera Off</p>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center">
                    <img
                      src={participants[1].avatar}
                      alt="You"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white rounded text-xs">
                You {isMuted && '(Muted)'}
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              {/* Left Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-6 h-6 text-white" />
                  ) : (
                    <Video className="w-6 h-6 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Monitor className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Center - End Call */}
              <button className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors flex items-center gap-2">
                <Phone className="w-5 h-5" />
                End Call
              </button>

              {/* Right Controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowChat(!showChat);
                    setShowParticipants(false);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    showChat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <MessageSquare className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() => {
                    setShowParticipants(!showParticipants);
                    setShowChat(false);
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    showParticipants ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Users className="w-6 h-6 text-white" />
                </button>
                <button className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                  <Settings className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Chat/Participants */}
        {(showChat || showParticipants) && (
          <aside className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => {
                  setShowChat(true);
                  setShowParticipants(false);
                }}
                className={`flex-1 px-4 py-3 transition-colors ${
                  showChat ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => {
                  setShowParticipants(true);
                  setShowChat(false);
                }}
                className={`flex-1 px-4 py-3 transition-colors ${
                  showParticipants ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Participants ({participants.length})
              </button>
            </div>

            {/* Chat Content */}
            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="text-white">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm">{msg.sender}</span>
                        <span className="text-xs text-gray-400">{msg.timestamp}</span>
                      </div>
                      <p className="text-gray-300">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Participants Content */}
            {showParticipants && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-white">{participant.name}</p>
                        {participant.isMentor && (
                          <span className="text-xs text-blue-400">Mentor</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        )}
      </main>
    </div>
  );
};
