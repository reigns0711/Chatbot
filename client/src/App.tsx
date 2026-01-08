import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { sendMessage } from './api';
import type { Message } from './api';
import { Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await sendMessage(newMessages);
      if (response && response.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: response.content }]);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error.response?.data?.details || error.message || "Unknown connection error";
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Sorry, I'm having trouble: ${errorMessage}. Please check your backend terminal.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl h-[85vh] glass rounded-3xl flex flex-col overflow-hidden chat-shadow"
      >
        {/* Header */}
        <header className="px-8 py-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
              <Bot className="text-indigo-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
                DeepChat <Sparkles className="text-indigo-400" size={16} />
              </h1>
              <p className="text-xs text-slate-400">Powered by Gemini AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400 font-medium">Online</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div className="max-w-3xl mx-auto space-y-2">
            <AnimatePresence>
              {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg} />
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start items-center gap-3 mb-6"
              >
                <div className="p-2 bg-slate-800 border border-slate-700 rounded-full">
                  <Bot size={18} />
                </div>
                <div className="flex gap-1.5 p-4 bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none">
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Footer / Input Area */}
        <footer className="p-6 bg-slate-900/30 border-t border-slate-800">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            <p className="text-[10px] text-center text-slate-500 mt-4 uppercase tracking-widest font-medium">
              Experimental AI Assistant • Built with React & Gemini
            </p>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

export default App;
