import { createClient } from '@/utils/supabase/server'
import { logout } from '../login/actions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, LayoutDashboard, CheckSquare, StickyNote, MessageSquare, LogOut, Settings } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/20 backdrop-blur-xl flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold tracking-tight text-lg text-slate-200">Life Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-slate-100 font-medium transition-colors border border-white/5">
            <LayoutDashboard className="w-4 h-4 text-indigo-400" />
            Overview
          </Link>
          <Link href="/dashboard/tasks" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 font-medium transition-colors">
            <CheckSquare className="w-4 h-4" />
            Tasks
          </Link>
          <Link href="/dashboard/notes" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 font-medium transition-colors">
            <StickyNote className="w-4 h-4" />
            Notes
          </Link>
          <Link href="/dashboard/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 font-medium transition-colors">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="px-4 py-3 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col gap-1 mb-2">
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Logged in as</span>
            <span className="text-sm text-slate-300 truncate">{user.email}</span>
          </div>
          <form action={logout}>
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
