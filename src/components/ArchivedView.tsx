'use client'

import { useState } from 'react'
import { Check, Trash2, Archive } from 'lucide-react'
import { formatWeekRange, DAY_NAMES_PT } from '@/lib/utils'

interface Task {
  id: number
  title: string
  time: string
  completed: boolean
  dayId: string
  weekStart: string
}

export function ArchivedView({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  const deleteTask = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
  }

  const toggleTask = async (id: number) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      })
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: task.completed } : t))
    }
  }

  // Group by week
  const tasksByWeek = tasks.reduce((acc, task) => {
    const key = task.weekStart
    if (!acc[key]) acc[key] = []
    acc[key].push(task)
    return acc
  }, {} as Record<string, Task[]>)

  const weeks = Object.keys(tasksByWeek).sort((a, b) => b.localeCompare(a))

  if (tasks.length === 0) {
    return (
      <section className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
        <div className="w-12 h-12 rounded-full bg-[#131313] flex items-center justify-center">
          <Archive className="w-5 h-5 text-[#acabab]" />
        </div>
        <p className="text-sm text-[#acabab]">Nenhuma tarefa arquivada</p>
        <p className="text-xs text-[#5a5a5a]">Tarefas de semanas anteriores aparecerão aqui</p>
      </section>
    )
  }

  return (
    <section className="flex-1 overflow-y-auto p-8 pt-4">
      <div className="max-w-2xl space-y-5">
        {weeks.map(weekKey => {
          const weekTasks = tasksByWeek[weekKey]
          const weekStartDate = new Date(weekKey)
          const completed = weekTasks.filter(t => t.completed).length

          return (
            <div key={weekKey} className="bg-[#131313] rounded-xl border border-white/5 overflow-hidden">
              {/* Week header */}
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-medium text-[#acabab] uppercase tracking-wider">
                  {formatWeekRange(weekStartDate)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#5a5a5a]">
                    {completed}/{weekTasks.length} concluídas
                  </span>
                  {/* Progress bar */}
                  <div className="w-16 h-1 bg-[#252626] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#adc6ff] rounded-full transition-all"
                      style={{ width: `${weekTasks.length ? (completed / weekTasks.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="divide-y divide-white/5">
                {weekTasks
                  .sort((a, b) => a.dayId.localeCompare(b.dayId) || a.time.localeCompare(b.time))
                  .map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a1a] transition-colors group">
                    <button onClick={() => toggleTask(task.id)} className="shrink-0">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        task.completed ? 'bg-[#adc6ff] border-[#adc6ff]' : 'border-[#757575]'
                      }`}>
                        {task.completed && <Check className="w-3 h-3 text-[#003d88]" strokeWidth={3} />}
                      </div>
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${task.completed ? 'text-white/40 line-through' : 'text-[#e7e5e5]'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-[#5a5a5a]">{DAY_NAMES_PT[task.dayId]}</span>
                        <span className="text-[10px] text-[#3a3a3a]">·</span>
                        <span className="text-[10px] text-[#5a5a5a]">{task.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-[#acabab] hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
