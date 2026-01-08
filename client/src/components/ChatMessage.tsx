import React from 'react';
import type { Message } from '../api';
import { User, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-3`}>
                <div className={`p-2 rounded-full ${isUser ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                    {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>
                <div
                    className={`px-4 py-3 rounded-2xl ${isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
                        } shadow-sm`}
                >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatMessage;
