import { Sparkles, ArrowRight, Plus } from 'lucide-react'
import TaskBoard from '@/components/TaskBoard'
import NotesBoard from '@/components/NotesBoard'
import { getTasks, getNotes, getDailyBrief } from './actions'
import Link from 'next/link'

export default async function DashboardOverview() {
  const [tasks, notes, suggestions] = await Promise.all([
    getTasks(),
    getNotes(),
    getDailyBrief()
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight mb-1">Good morning</h1>
          <p className="text-slate-400">Here's your intelligent overview for today.</p>
        </div>
      </div>

      {/* AI Daily Brief */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
          <Sparkles className="w-24 h-24 text-indigo-400" />
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-indigo-100">AI Daily Brief</h2>
        </div>
        
        <div className="space-y-3 relative z-10">
          {suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-3 text-indigo-200/80">
              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <p>{suggestion}</p>
            </div>
          ))}
        </div>
        
        <Link href="/dashboard/chat" className="mt-6 inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200 transition-colors font-medium">
          Chat with Assistant <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <TaskBoard initialTasks={tasks} />
        <NotesBoard initialNotes={notes} />
      </div>
    </div>
  )
}
