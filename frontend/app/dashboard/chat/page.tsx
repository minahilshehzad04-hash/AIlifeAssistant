import ChatInterface from '@/components/ChatInterface'
import { Brain, Sparkles } from 'lucide-react'

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Brain className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Assistant</h1>
          <p className="text-slate-400 text-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Powered by GPT-4o mini with RAG memory
          </p>
        </div>
      </div>

      {/* Capability pills */}
      <div className="flex flex-wrap gap-2">
        {['Task Extraction', 'Planning Suggestions', 'Reminders', 'Memory Recall'].map((cap) => (
          <span key={cap} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
            {cap}
          </span>
        ))}
      </div>

      {/* Chat Component */}
      <ChatInterface />
    </div>
  )
}
