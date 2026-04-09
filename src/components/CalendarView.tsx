'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Flag, X, Check, Plus } from 'lucide-react'
import { formatMonthYear, getWeekStart, toYearMonth } from '@/lib/utils'

const DAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

interface CalendarEvent {
  id: number
  date: string
  note: string
  time: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  currentMonth: string
}

export function CalendarView({ events: initialEvents, currentMonth }: CalendarViewProps) {
  const router = useRouter()

  const [events, setEvents] = useState<Record<string, CalendarEvent>>(
    Object.fromEntries(initialEvents.map(e => [e.date, e]))
  )
  const [addingDate, setAddingDate] = useState<string | null>(null)
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [noteInput, setNoteInput] = useState('')
  const [timeInput, setTimeInput] = useState('')

  const navigateMonth = (offset: number) => {
    const [year, month] = currentMonth.split('-').map(Number)
    const d = new Date(Date.UTC(year, month - 1 + offset, 1))
    const newMonth = toYearMonth(d)
    const firstMonday = getWeekStart(d.toISOString())
    router.push(`/rotina?view=calendar&week=${firstMonday.toISOString().split('T')[0]}&month=${newMonth}`)
  }

  const goToToday = () => {
    const now = new Date()
    const ws = getWeekStart(now.toISOString())
    router.push(`/rotina?view=calendar&week=${ws.toISOString().split('T')[0]}&month=${toYearMonth(now)}`)
  }

  const openAdd = (dateStr: string) => {
    setAddingDate(dateStr)
    setNoteInput('')
    setTimeInput('')
    setEditingDate(null)
  }

  const saveEvent = async (dateStr: string) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, note: noteInput, time: timeInput }),
      })
      const newEvent = await res.json()
      setEvents(prev => ({ ...prev, [dateStr]: { id: newEvent.id, date: dateStr, note: noteInput, time: timeInput } }))
    } catch (e) { console.error(e) }
    setAddingDate(null)
    setNoteInput('')
    setTimeInput('')
  }

  const openEdit = (dateStr: string) => {
    const event = events[dateStr]
    if (!event) return
    setEditingDate(dateStr)
    setNoteInput(event.note)
    setTimeInput(event.time)
    setAddingDate(null)
  }

  const updateEvent = async (dateStr: string) => {
    const event = events[dateStr]
    if (!event) return
    setEvents(prev => ({ ...prev, [dateStr]: { ...event, note: noteInput, time: timeInput } }))
    setEditingDate(null)
    await fetch(`/api/events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteInput, time: timeInput }),
    })
  }

  const deleteEvent = async (dateStr: string) => {
    const event = events[dateStr]
    if (!event) return
    setEvents(prev => { const n = { ...prev }; delete n[dateStr]; return n })
    setEditingDate(null)
    await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
  }

  // Build calendar grid (Mon-start)
  const [year, month] = currentMonth.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDay = new Date(Date.UTC(year, month, 0))
  const firstDayOffset = (firstDay.getUTCDay() + 6) % 7

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDayOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    cells.push(new Date(Date.UTC(year, month - 1, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const now = new Date()
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`

  const FormFields = ({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) => (
    <div className="flex flex-col gap-1.5">
      <input
        autoFocus
        value={noteInput}
        onChange={e => setNoteInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }}
        placeholder="Descrição (opcional)"
        className="w-full bg-[#252626] text-[11px] text-[#e7e5e5] rounded px-2 py-1 outline-none placeholder-[#5a5a5a] border border-[#adc6ff]/20"
      />
      <input
        value={timeInput}
        onChange={e => setTimeInput(e.target.value)}
        type="time"
        className="w-full bg-[#252626] text-[11px] text-[#acabab] rounded px-2 py-1 outline-none border border-white/5"
      />
      <div className="flex gap-1 justify-end mt-0.5">
        <button onClick={onSave} className="p-1 bg-[#adc6ff]/10 hover:bg-[#adc6ff]/20 rounded text-[#adc6ff] transition-colors">
          <Check className="w-3 h-3" />
        </button>
        <button onClick={onCancel} className="p-1 hover:bg-white/10 rounded text-[#acabab] transition-colors">
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )

  return (
    <section className="flex-1 overflow-y-auto p-8 pt-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button onClick={() => navigateMonth(-1)} className="hover:bg-white/5 rounded p-1.5 text-[#acabab] hover:text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-base font-semibold text-white w-44 text-center">
            {formatMonthYear(currentMonth)}
          </h3>
          <button onClick={() => navigateMonth(1)} className="hover:bg-white/5 rounded p-1.5 text-[#acabab] hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button onClick={goToToday} className="text-xs text-[#adc6ff] hover:underline px-3 py-1 rounded hover:bg-[#adc6ff]/5 transition-all">
          Hoje
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
        {DAY_HEADERS.map((name, i) => (
          <div key={name} className={`py-2 text-center text-[11px] font-medium uppercase tracking-wider ${
            i >= 5 ? 'bg-[#0e0e0e] text-[#4a4a4a]' : 'bg-[#131313] text-[#acabab]'
          }`}>
            {name}
          </div>
        ))}

        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} className="bg-[#0a0a0a] min-h-[130px]" />

          const dateStr = date.toISOString().split('T')[0]
          const event = events[dateStr]
          const isToday = dateStr === todayStr
          const dow = (date.getUTCDay() + 6) % 7
          const isWeekend = dow >= 5
          const isAdding = addingDate === dateStr
          const isEditing = editingDate === dateStr

          return (
            <div
              key={dateStr}
              className={`min-h-[130px] p-2 flex flex-col transition-colors group/cell ${
                isWeekend ? 'bg-[#0d0d0d] hover:bg-[#111]' : 'bg-[#131313] hover:bg-[#171717]'
              }`}
            >
              {/* Date row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-[#adc6ff] text-[#003d88] font-bold' : isWeekend ? 'text-[#4a4a4a]' : 'text-[#acabab]'
                }`}>
                  {date.getUTCDate()}
                </div>
                {!event && !isAdding && (
                  <button
                    onClick={() => openAdd(dateStr)}
                    className="opacity-0 group-hover/cell:opacity-100 p-0.5 rounded hover:bg-[#adc6ff]/10 text-[#acabab] hover:text-[#adc6ff] transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Add form */}
              {isAdding && (
                <FormFields
                  onSave={() => saveEvent(dateStr)}
                  onCancel={() => setAddingDate(null)}
                />
              )}

              {/* Edit form */}
              {isEditing && (
                <FormFields
                  onSave={() => updateEvent(dateStr)}
                  onCancel={() => setEditingDate(null)}
                />
              )}

              {/* Existing event display */}
              {event && !isAdding && !isEditing && (
                <button onClick={() => openEdit(dateStr)} className="w-full text-left mt-0.5">
                  <div className="flex items-start gap-1.5 bg-[#adc6ff]/10 rounded-md px-2 py-1.5 hover:bg-[#adc6ff]/15 transition-colors group/ev">
                    <Flag className="w-3 h-3 text-[#adc6ff] shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      {event.time && (
                        <p className="text-[10px] text-[#adc6ff]/70 font-medium mb-0.5">{event.time}</p>
                      )}
                      <p className="text-[11px] text-[#adc6ff] leading-snug line-clamp-2">
                        {event.note || 'Dia importante'}
                      </p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteEvent(dateStr) }}
                      className="opacity-0 group-hover/ev:opacity-100 p-0.5 rounded hover:bg-red-500/20 text-[#acabab] hover:text-red-400 transition-all shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-[11px] text-[#3a3a3a] text-center">
        Passe o mouse sobre um dia e clique em + para marcar um compromisso
      </p>
    </section>
  )
}
