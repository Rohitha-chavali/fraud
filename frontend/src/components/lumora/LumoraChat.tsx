import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  ArrowRight,
  ShieldAlert,
  Bot,
  User,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sendLumoraChat } from '../../services/api';
import { ChatMessage } from '../../types';

export const LumoraChat: React.FC = () => {
  const {
    isLumoraOpen,
    setIsLumoraOpen,
    activeTransaction,
    inspectedTxnId,
    setInspectedTxnId,
    lumoraInitialPrompt,
    setLumoraInitialPrompt,
    settings,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'lumora',
      text: "Hello, I am **Lumora**, your intelligent fraud investigation companion. I am grounded in your platform's live transaction telemetry, risk scoring vectors, and anomaly models.\n\nHow can I assist your investigation today?",
      timestamp: 'Just now',
      suggestedActions: [
        'Why was TXN-92831 flagged?',
        'What is an impossible travel pattern?',
        'Could this be a false positive?',
        'How to reduce false positives?',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle external prompt trigger
  useEffect(() => {
    if (lumoraInitialPrompt && isLumoraOpen) {
      handleSend(lumoraInitialPrompt);
      setLumoraInitialPrompt(null);
    }
  }, [lumoraInitialPrompt, isLumoraOpen]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await sendLumoraChat({
        message: text,
        transactionId: inspectedTxnId || activeTransaction?.transactionId,
        history,
        settings: { style: settings.lumoraStyle },
      });

      const aiMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'lumora',
        text: res.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: res.suggestedActions,
        citedSignals: res.citedSignals,
        transactionContext: res.transactionContext,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'lumora',
        text: "I encountered a transient latency issue communicating with the AI reasoning layer. However, looking at the deterministic rules: high amount deviations combined with novel device fingerprints represent the primary exposure vector. Please retry your query.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageText = (txt: string) => {
    // Basic Markdown bullet and bold formatting helper
    return txt.split('\n').map((line, idx) => {
      let formatted = line;
      // Bold
      const boldParts = formatted.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={idx} className="block my-0.5">
          {boldParts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="text-white font-semibold">
                {part}
              </strong>
            ) : (
              part
            )
          )}
        </span>
      );
    });
  };

  if (!isLumoraOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 sm:w-[440px] h-[600px] max-h-[85vh] rounded-2xl bg-[#0b101e]/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl shadow-black/80 flex flex-col z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-purple-900/40 bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
            <Sparkles className="w-5 h-5 text-purple-300" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-wide">LUMORA</h3>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI Fraud Companion
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-slate-300 font-medium">Online · Grounded in Telemetry</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsLumoraOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Context Banner */}
      <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Context:</span>
          {inspectedTxnId ? (
            <span className="font-mono text-purple-300 font-semibold px-1.5 py-0.5 bg-purple-950/60 border border-purple-800/60 rounded">
              {inspectedTxnId}
            </span>
          ) : (
            <span className="text-slate-400 italic">General Platform</span>
          )}
        </div>
        {inspectedTxnId && (
          <button
            onClick={() => setInspectedTxnId(null)}
            className="text-[10px] text-slate-400 hover:text-slate-200 underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-900/30'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-none shadow-md'
                }`}
              >
                {formatMessageText(msg.text)}

                {/* Cited Signals */}
                {msg.citedSignals && msg.citedSignals.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                    {msg.citedSignals.map((sig, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40"
                      >
                        {sig}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

              {/* Suggested Follow-up Actions */}
              {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[92%]">
                  {msg.suggestedActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-purple-900/40 text-purple-200 hover:text-purple-100 border border-purple-500/20 hover:border-purple-400/40 transition-all flex items-center gap-1"
                    >
                      <span>{action}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-purple-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-2xl w-fit">
            <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="text-xs text-slate-400">Lumora is evaluating risk signals...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-800 bg-[#080d19]/90">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lumora about risk, anomalies, or next steps..."
            disabled={loading}
            className="w-full pl-3.5 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="absolute right-1.5 p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-[9px] text-slate-400 text-center mt-2">
          Lumora provides AI-assisted analysis. Final decisions should be reviewed by authorized personnel.
        </p>
      </div>
    </div>
  );
};
