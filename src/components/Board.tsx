'use client'

import { useState } from 'react'
import { Plus, Check, X, Trash2 } from 'lucide-react'

const DAYS_CONFIG = [
  { id: 'seg', name: 'Seg' },
  { id: 'ter', name: 'Ter' },
  { id: 'qua', name: 'Qua' },
  { id: 'qui', name: 'Qui' },
  { id: 'sex', name: 'Sex' },
  { id: 'sab', name: 'Sáb' },
  { id: 'dom', name: 'Dom' },
]

const WEEKEND_IDS = new Set(['sab', 'dom'])

interface Task {
  id: number
  title: string
  time: string
  completed: boolean
  dayId: string
  weekStart: string
}

interface BoardProps {
  initialTasks: Task[]
  weekStart: string
}

export function Board({ initialTasks, weekStart }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

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

  const addTask = async (dayId: string, title: string, time: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, time, dayId, weekStart }),
      })
      const newTask: Task = await res.json()
      setTasks(prev => [...prev, newTask])
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error)
    }
  }

  const deleteTask = async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    } catch { /* silent */ }
  }

  return (
    <section className="flex-1 overflow-x-auto p-8 pt-4">
      <div className="flex gap-4 min-w-max h-full pb-4">
        {DAYS_CONFIG.map(day => (
          <Column
            key={day.id}
            day={day}
            tasks={tasks.filter(t => t.dayId === day.id)}
            onToggle={toggleTask}
            onAdd={(title, time) => addTask(day.id, title, time)}
            onDelete={deleteTask}
          />
        ))}
      </div>
    </section>
  )
}

function Column({
  day, tasks, onToggle, onAdd, onDelete,
}: {
  day: { id: string; name: string }
  tasks: Task[]
  onToggle: (id: number) => void
  onAdd: (title: string, time: string) => void
  onDelete: (id: number) => void
}) {
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTime, setNewTime] = useState('')

  const handleAdd = () => {
    if (!newTitle.trim()) return
    onAdd(newTitle.trim(), newTime || '00:00')
    setNewTitle('')
    setNewTime('')
    setAdding(false)
  }

  const isWeekend = WEEKEND_IDS.has(day.id)

  return (
    <div className={`w-[280px] flex flex-col rounded-xl p-4 border ${
      isWeekend ? 'bg-[#111111] border-white/[0.03]' : 'bg-[#131313] border-white/5'
    }`}>
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className={`text-sm font-semibold ${isWeekend ? 'text-[#7a7a7a]' : 'text-[#acabab]'}`}>
          {day.name}
        </h3>
        {tasks.length > 0 && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            day.id === 'seg'
              ? 'bg-[#adc6ff]/10 text-[#adc6ff]'
              : 'bg-[#252626] text-[#acabab]'
          }`}>
            {tasks.length} {tasks.length === 1 ? 'Tarefa' : 'Tarefas'}
          </span>
        )}
      </div>

      <div className="space-y-3 flex-1">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={() => onToggle(task.id)}
            onDelete={() => onDelete(task.id)}
          />
        ))}

        {adding && (
          <div className="p-2 bg-[#1f2020] rounded-lg space-y-2 border border-white/10">
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
              placeholder="Título da tarefa"
              className="w-full bg-transparent text-[0.875rem] text-[#e7e5e5] outline-none placeholder-[#acabab]"
            />
            <div className="flex items-center gap-2">
              <input
                value={newTime}
                onChange={e => setNewTime(e.target.value)}
                type="time"
                className="bg-[#252626] text-[10px] text-[#acabab] rounded px-2 py-1 outline-none w-24"
              />
              <div className="flex gap-1 ml-auto">
                <button onClick={handleAdd} className="p-1 hover:bg-[#adc6ff]/10 rounded text-[#adc6ff] transition-colors">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setAdding(false); setNewTitle(''); setNewTime('') }}
                  className="p-1 hover:bg-white/10 rounded text-[#acabab] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <button
          onClick={() => setAdding(true)}
          className="mt-4 py-2 px-3 border border-dashed border-white/10 rounded-lg text-xs text-[#acabab] hover:border-[#adc6ff]/50 hover:text-[#adc6ff] transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Nova tarefa
        </button>
      )}
    </div>
  )
}

function TaskCard({ task, onToggle, onDelete }: {
  task: Task
  onToggle: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-start gap-3 p-2 hover:bg-[#1f2020] rounded-lg transition-all cursor-pointer">
      <button onClick={onToggle} className="relative w-4 h-4 mt-0.5 shrink-0">
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
          task.completed ? 'bg-[#adc6ff] border-[#adc6ff]' : 'border-[#757575]'
        }`}>
          {task.completed && <Check className="w-3 h-3 text-[#003d88]" strokeWidth={3} />}
        </div>
      </button>
      <div className="flex flex-col flex-1 min-w-0">
        <span className={`text-[0.875rem] truncate ${task.completed ? 'text-white/50 line-through' : 'text-[#e7e5e5]'}`}>
          {task.title}
        </span>
        <span className="text-[10px] text-[#acabab] mt-0.5">{task.time}</span>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-[#acabab] hover:text-red-400 transition-all shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}
