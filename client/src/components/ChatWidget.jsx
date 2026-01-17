import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! I\'m the DKN AI Assistant. I can help you with:\n\n• Finding knowledge items\n• Understanding platform features\n• Viewing leaderboard & training info\n• Navigating the system\n\nHow can I help you today?'
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, isMinimized]);

    // Don't render if user is not logged in
    if (!user) return null;

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');

        // Add user message to chat
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Build conversation history (exclude the welcome message)
            const conversationHistory = newMessages
                .slice(1)
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            const response = await api.post('/chatbot/message', {
                message: userMessage,
                conversationHistory
            });

            if (response.data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: response.data.response
                }]);
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, I encountered an error. Please try again.'
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I couldn\'t connect to the server. Please check your connection and try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => {
        if (isMinimized) {
            setIsMinimized(false);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const minimizeChat = () => {
        setIsMinimized(true);
    };

    const closeChat = () => {
        setIsOpen(false);
        setIsMinimized(false);
    };

    // Format message content with basic markdown
    const formatMessage = (content) => {
        return content
            .split('\n')
            .map((line, i) => {
                // Bold text
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Bullet points
                if (line.startsWith('• ') || line.startsWith('- ')) {
                    return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
                }
                // Numbered lists
                if (/^\d+\.\s/.test(line)) {
                    return <li key={i} className="ml-4" dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s/, '') }} />;
                }
                return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />;
            });
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={toggleChat}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${isOpen && !isMinimized
                        ? 'bg-slate-700 hover:bg-slate-600'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'
                    }`}
                title={isOpen ? 'Close chat' : 'Open AI Assistant'}
            >
                {isOpen && !isMinimized ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <MessageCircle className="w-6 h-6 text-white" />
                )}
                {/* Notification dot for new/minimized */}
                {isMinimized && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && !isMinimized && (
                <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">DKN Assistant</h3>
                                <p className="text-blue-100 text-xs">Powered by Gemini AI</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={minimizeChat}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Minimize"
                            >
                                <Minimize2 className="w-4 h-4 text-white" />
                            </button>
                            <button
                                onClick={closeChat}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                title="Close"
                            >
                                <X className="w-4 h-4 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-800">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user'
                                        ? 'bg-blue-600'
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                    }`}>
                                    {msg.role === 'user' ? (
                                        <User className="w-4 h-4 text-white" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-br-md'
                                        : 'bg-slate-700 text-slate-100 rounded-bl-md'
                                    }`}>
                                    <div className="text-sm leading-relaxed">
                                        {formatMessage(msg.content)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-700">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask me anything about DKN..."
                                className="flex-1 bg-slate-800 text-white placeholder-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-700"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isLoading}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Minimized state indicator */}
            {isOpen && isMinimized && (
                <div
                    onClick={() => setIsMinimized(false)}
                    className="fixed bottom-24 right-6 z-50 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 cursor-pointer hover:bg-slate-700 transition-colors shadow-lg"
                >
                    <div className="flex items-center gap-2 text-white">
                        <Bot className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">Chat minimized - Click to expand</span>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatWidget;
