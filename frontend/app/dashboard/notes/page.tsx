import { getNotes } from '@/app/dashboard/actions'
import NotesBoard from '@/components/NotesBoard'
import { StickyNote } from 'lucide-react'

export default async function NotesPage() {
  const notes = await getNotes()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <StickyNote className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Notes</h1>
          <p className="text-slate-400 text-sm">{notes.length} note{notes.length !== 1 ? 's' : ''} stored</p>
        </div>
      </div>

      {/* Notes Board */}
      <NotesBoard initialNotes={notes} />
    </div>
  )
}
