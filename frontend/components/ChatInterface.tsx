'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, CheckCircle2, Clock, RotateCcw } from 'lucide-react'
import { sendChatMessage, getChatHistory } from '@/app/dashboard/actions'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  extractedTasks?: string[]
  extractedReminders?: string[]
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load History
  useEffect(() => {
    const loadHistory = async () => {
      const history = await getChatHistory()
      if (history.length > 0) {
        setMessages(history)
      } else {
        setMessages([
          {
            id: 'init',
            role: 'assistant',
            content: "Hello! I'm your **Life Admin Assistant** 🧠\n\nI can help you with:\n- 📋 **Task management**\n- 📝 **Notes**\n- 📅 **Planning**\n\nWhat can I help you with today?"
          }
        ])
      }
    }
    loadHistory()
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: userMessage }
    setMessages(prev => [...prev, newMsg])
    setIsLoading(true)

    try {
      const response = await sendChatMessage(userMessage)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        extractedTasks: response.extracted_tasks,
        extractedReminders: response.extracted_reminders
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex flex-col h-[700px] bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-white/5 border-b border-white/5 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Bot className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h2 className="font-semibold text-slate-100">AI Assistant</h2>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Powered by Gemini 2.5 Flash
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1
                ${msg.role === 'user' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className={`space-y-2 max-w-[80%] ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                {/* Bubble */}
                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-purple-600/80 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/8 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-p:my-1 prose-p:leading-relaxed
                      prose-ul:my-2 prose-ul:pl-4 prose-ul:space-y-1
                      prose-ol:my-2 prose-ol:pl-4 prose-ol:space-y-1
                      prose-li:text-slate-200 prose-li:marker:text-indigo-400
                      prose-strong:text-white prose-strong:font-semibold
                      prose-headings:text-slate-100 prose-headings:font-semibold
                      prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1
                      prose-code:text-indigo-300 prose-code:bg-white/10 prose-code:px-1 prose-code:rounded
                    ">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Extracted Tasks */}
                {msg.extractedTasks && msg.extractedTasks.length > 0 && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 w-full">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Extracted Tasks
                    </p>
                    <div className="space-y-1.5">
                      {msg.extractedTasks.map((t, i) => (
                        <div key={i} className="text-xs text-indigo-200 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/10 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Reminders */}
                {msg.extractedReminders && msg.extractedReminders.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 w-full">
                    <p className="text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Reminders
                    </p>
                    <div className="space-y-1.5">
                      {msg.extractedReminders.map((r, i) => (
                        <div key={i} className="text-xs text-amber-200 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/10 flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">⏰</span> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white/5 border border-white/5 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay }}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all placeholder:text-slate-500 resize-none leading-relaxed"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  )
}
