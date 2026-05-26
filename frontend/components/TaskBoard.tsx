'use client'

import { useState, useTransition } from 'react'
import { CheckSquare, Clock, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { addTask, updateTaskStatus, deleteTask } from '@/app/dashboard/actions'
import { motion, AnimatePresence } from 'framer-motion'

type Task = {
  id: string
  title: string
  status: string
  metadata: { priority: string }
  created_at: string
}

export default function TaskBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isPending, startTransition] = useTransition()
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // Optimistic additions
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const tempId = Math.random().toString()
    const newTask = {
      id: tempId,
      title: newTaskTitle,
      status: 'pending',
      metadata: { priority: 'medium' },
      created_at: new Date().toISOString()
    }

    setTasks(prev => [newTask, ...prev])
    setNewTaskTitle('')
    setIsAdding(false)

    const formData = new FormData()
    formData.append('title', newTask.title)

    startTransition(async () => {
      await addTask(formData)
    })
  }

  // Optimistic toggles
  const handleToggleStatus = (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    startTransition(async () => {
      await updateTaskStatus(taskId, newStatus)
    })
  }

  // Optimistic deletes
  const handleDelete = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
    startTransition(async () => {
      await deleteTask(taskId)
    })
  }

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-md flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-slate-100">Today's Tasks</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="text-sm bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-slate-200 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        <AnimatePresence>
          {isAdding && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTask}
              className="flex gap-2 mb-4"
            >
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              />
              <button type="submit" className="bg-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-500 transition-colors">
                Save
              </button>
            </motion.form>
          )}

          {tasks.length === 0 && !isAdding && (
            <div className="text-center text-slate-500 py-10 text-sm">
              No tasks yet. Click Add to create one!
            </div>
          )}

          {tasks.map(task => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                task.status === 'completed' 
                  ? 'bg-white/[0.01] border-white/[0.02] opacity-50' 
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleToggleStatus(task.id, task.status)}>
                {task.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
                )}
                <div>
                  <p className={`font-medium text-sm transition-all ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {task.title}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
