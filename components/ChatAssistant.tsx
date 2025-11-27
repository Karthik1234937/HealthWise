import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { chatWithHealthBot } from '../services/geminiService';
import { LabReportData } from '../types';

interface ChatAssistantProps {
  labData: LabReportData;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ labData }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "I've analyzed your lab report. Do you have any specific questions about your results?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Convert internal message format to Gemini history format
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithHealthBot(history, userMessage, labData);
      
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
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

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-medical-50 flex items-center gap-3">
        <div className="p-2 bg-white rounded-full shadow-sm">
            <Bot className="w-5 h-5 text-medical-600" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-800">HealthWise Assistant</h3>
            <p className="text-xs text-gray-500">Ask about your results</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-medical-600 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-100 rounded-2xl p-4 rounded-bl-none flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="text-xs text-gray-500">Thinking...</span>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your cholesterol, hemoglobin..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-medical-600 text-white rounded-lg hover:bg-medical-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
