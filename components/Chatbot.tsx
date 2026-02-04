
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Halo! Ada yang bisa saya bantu terkait aplikasi ini atau Kurikulum Merdeka?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !chatSessionRef.current) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                chatSessionRef.current = ai.chats.create({
                    model: 'gemini-3-flash-preview',
                    config: {
                        systemInstruction: "Anda adalah 'Asisten Cerdas', asisten AI untuk aplikasi administrasi guru. Anda didukung oleh model deep learning canggih dan memiliki akses ke materi terbaru mengenai Kurikulum Merdeka di Indonesia. Jawab pertanyaan seputar fitur aplikasi dan Kurikulum Merdeka. Jaga agar jawaban Anda ringkas, akurat, dan bermanfaat. Berkomunikasilah dalam Bahasa Indonesia.",
                    },
                });
            } catch(e: any) {
                 console.error("Chatbot initialization error:", e);
                 setMessages(prev => [...prev, { sender: 'bot', text: `Gagal menginisialisasi asisten: ${e.message}` }]);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !chatSessionRef.current || isLoading) return;
        
        const userMessage: Message = { sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const stream = await chatSessionRef.current.sendMessageStream({ message: inputValue });

            let botResponse = '';
            setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);

            for await (const chunk of stream) {
                const c = chunk as GenerateContentResponse;
                botResponse += c.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'bot', text: botResponse };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: 'Maaf, terjadi kesalahan. Silakan coba lagi.' }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 z-50"
                aria-label="Buka Asisten Cerdas"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 003 15v1a1 1 0 001 1h12a1 1 0 001-1v-1a1 1 0 00-.293-.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-sm h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col z-50 fade-in">
                    <header className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="font-semibold">Asisten Cerdas</h3>
                        <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white">&times;</button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`rounded-lg px-3 py-2 max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                    {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                             <div className="flex justify-start mb-3">
                                 <div className="rounded-lg px-3 py-2 bg-gray-200 text-gray-800">
                                     <span className="animate-pulse">...</span>
                                 </div>
                             </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <footer className="p-4 border-t">
                        <div className="flex">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ketik pertanyaan Anda..."
                                className="flex-1 rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                disabled={isLoading || !chatSessionRef.current}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || !chatSessionRef.current} className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                Kirim
                            </button>
                        </div>
                    </footer>
                </div>
            )}
        </>
    );
};

export default Chatbot;
