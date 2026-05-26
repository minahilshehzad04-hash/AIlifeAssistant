'use client'

import { useState, useTransition } from 'react'
import { StickyNote, Plus, Trash2 } from 'lucide-react'
import { addNote, deleteNote } from '@/app/dashboard/actions'
import { motion, AnimatePresence } from 'framer-motion'

type Note = {
  id: string
  title: string
  content: string
  category: string
  created_at: string
}

export default function NotesBoard({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [isPending, startTransition] = useTransition()
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    const tempId = Math.random().toString()
    const newNote = {
      id: tempId,
      title: newTitle || 'Untitled Note',
      content: newContent,
      category: 'General',
      created_at: new Date().toISOString()
    }

    setNotes(prev => [newNote, ...prev])
    setNewTitle('')
    setNewContent('')
    setIsAdding(false)

    const formData = new FormData()
    formData.append('title', newNote.title)
    formData.append('content', newNote.content)

    startTransition(async () => {
      await addNote(formData)
    })
  }

  const handleDelete = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId))
    startTransition(async () => {
      await deleteNote(noteId)
    })
  }

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
            <StickyNote className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Recent Notes</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddNote}
              className="flex flex-col gap-2 mb-4 bg-white/5 p-4 rounded-2xl border border-white/10"
            >
              <input 
                type="text" 
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Note title (optional)"
                className="bg-transparent border-none text-sm text-white outline-none placeholder:text-slate-500 font-medium"
              />
              <textarea 
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Write your note here..."
                rows={3}
                required
                className="bg-transparent border-none text-sm text-slate-300 outline-none placeholder:text-slate-600 resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200">Cancel</button>
                <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors">
                  Save Note
                </button>
              </div>
            </motion.form>
          )}

          {notes.length === 0 && !isAdding && (
            <div className="text-center text-slate-500 py-10 text-sm">
              No notes stored.
            </div>
          )}

          {notes.map(note => (
            <motion.div 
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-slate-200 font-medium text-sm truncate pr-4">{note.title}</h3>
                <button 
                  onClick={() => handleDelete(note.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-400 text-xs line-clamp-2 mb-3 leading-relaxed">
                {note.content}
              </p>
              <div className="mt-auto flex justify-between items-center">
                <span className="inline-block px-2 py-1 rounded-md bg-white/5 text-slate-400 text-[10px] font-bold tracking-wider uppercase">
                  {note.category}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
