import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { chatWithVideo } from '../services/groqService';
import { getTranslations, Language } from '../translations';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoContext: string;
    videoTitle: string;
    language: Language;
}

const ChatModal: React.FC<ChatModalProps> = ({
    isOpen,
    onClose,
    videoContext,
    videoTitle,
    language,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const t = getTranslations(language);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithVideo(
                input,
                videoContext,
                messages.map((m) => ({
                    role: m.role,
                    parts: [{ text: m.content }],
                })),
                language
            );

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response,
            };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: language === 'ko'
                    ? '죄송합니다, 응답을 생성하는 중 오류가 발생했습니다.'
                    : 'Sorry, there was an error generating a response.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl h-[80vh] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lime-400/10 rounded-xl flex items-center justify-center">
                            <Sparkles className="text-lime-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{t.chatModalTitle}</h2>
                            <p className="text-xs text-gray-500 truncate max-w-md">{videoTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <MessageCircle size={48} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">{t.chatModalDesc}</p>
                            <p className="text-sm mt-2">
                                {language === 'ko'
                                    ? '영상 내용을 바탕으로 답변해 드립니다'
                                    : 'I\'ll answer based on the video content'}
                            </p>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-lime-400 text-black'
                                    : 'bg-white/5 text-white border border-white/10'
                                    }`}
                            >
                                <p className="text-sm font-medium whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/5 text-white border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-2">
                                <Loader2 className="animate-spin" size={16} />
                                <span className="text-sm">{t.thinking}</span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={t.chatPlaceholder}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/50"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="px-6 py-3 bg-lime-400 text-black rounded-xl font-bold hover:bg-lime-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send size={18} />
                            {t.chatSend}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
