
import React, { useState, useRef, useEffect } from 'react';
import { runChat } from '../services/geminiService';
import type { StatisticalMethod, ChatMessage } from '../types';
import { PaperAirplaneIcon, SparklesIcon } from './icons';

interface GeminiChatProps {
  method: StatisticalMethod;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ method }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const modelMessage: ChatMessage = { role: 'model', content: '' };
    setMessages((prev) => [...prev, modelMessage]);

    try {
      const stream = await runChat(method, input);
      for await (const chunk of stream) {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }
    } catch (error) {
      console.error('Gemini API error:', error);
       setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, content: '抱歉，發生錯誤，請稍後再試。' } : msg
          )
        );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg h-full flex flex-col p-4 max-h-[70vh]">
      <div className="flex items-center mb-4 border-b border-slate-200 pb-3">
        <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="font-bold text-slate-700">與 AI 深入探討</h3>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${
                msg.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-slate-700'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].role === 'model' && (
          <div className="mb-4 flex justify-start">
             <div className="p-3 rounded-lg bg-white text-slate-700">
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75 mr-2"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`詢問關於 ${method.name} 的問題...`}
          className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 disabled:bg-slate-400"
          disabled={isLoading}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};
