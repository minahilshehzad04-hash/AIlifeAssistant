import { getTasks } from '@/app/dashboard/actions'
import TaskBoard from '@/components/TaskBoard'
import { CheckSquare } from 'lucide-react'

export default async function TasksPage() {
  const tasks = await getTasks()
  const pendingCount = tasks.filter((t: any) => t.status === 'pending').length
  const completedCount = tasks.filter((t: any) => t.status === 'completed').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <CheckSquare className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Tasks</h1>
          <p className="text-slate-400 text-sm">
            {pendingCount} pending · {completedCount} completed
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: tasks.length, color: 'text-slate-300' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-400' },
          { label: 'Completed', value: completedCount, color: 'text-emerald-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Task Board */}
      <TaskBoard initialTasks={tasks} />
    </div>
  )
}
