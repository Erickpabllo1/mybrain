'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTaskDate, formatMonthYear, getWeekStart, toYearMonth } from '@/lib/utils'

const DAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

interface Task {
  id: number
  title: string
  time: string
  completed: boolean
  dayId: string
  weekStart: string
}

interface CalendarViewProps {
  tasks: Task[]
  currentMonth: string // 'YYYY-MM'
  weekStart: string
}

export function CalendarView({ tasks, currentMonth, weekStart }: CalendarViewProps) {
  const router = useRouter()

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
    const m = toYearMonth(now)
    router.push(`/rotina?view=calendar&week=${ws.toISOString().split('T')[0]}&month=${m}`)
  }

  // Build tasks map: 'YYYY-MM-DD' -> Task[]
  const tasksByDate: Record<string, Task[]> = {}
  for (const task of tasks) {
    const taskDate = getTaskDate(task.weekStart, task.dayId)
    const key = taskDate.toISOString().split('T')[0]
    if (!tasksByDate[key]) tasksByDate[key] = []
    tasksByDate[key].push(task)
  }

  // Build calendar grid (Mon-start)
  const [year, month] = currentMonth.split('-').map(Number)
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDay = new Date(Date.UTC(year, month, 0))
  const firstDayOffset = (firstDay.getUTCDay() + 6) % 7 // Mon=0 … Sun=6

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDayOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    cells.push(new Date(Date.UTC(year, month - 1, d)))
  }
  while (cells.length % 7 !== 0) cells.push(null)

  const now = new Date()
  const todayStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
  const currentWeekStartStr = weekStart.split('T')[0]

  const handleDayClick = (date: Date) => {
    const ws = getWeekStart(date.toISOString())
    router.push(`/rotina?week=${ws.toISOString().split('T')[0]}`)
  }

  return (
    <section className="flex-1 overflow-y-auto p-8 pt-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="hover:bg-white/5 rounded p-1.5 text-[#acabab] hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-base font-semibold text-white w-44 text-center">
            {formatMonthYear(currentMonth)}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className="hover:bg-white/5 rounded p-1.5 text-[#acabab] hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="text-xs text-[#adc6ff] hover:underline px-3 py-1 rounded hover:bg-[#adc6ff]/5 transition-all"
        >
          Hoje
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
        {/* Day headers */}
        {DAY_HEADERS.map((name, i) => (
          <div
            key={name}
            className={`py-2 text-center text-[11px] font-medium uppercase tracking-wider ${
              i >= 5 ? 'bg-[#0e0e0e] text-[#5a5a5a]' : 'bg-[#131313] text-[#acabab]'
            }`}
          >
            {name}
          </div>
        ))}

        {/* Calendar cells */}
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="bg-[#0a0a0a] min-h-[110px]" />
          }

          const dateStr = date.toISOString().split('T')[0]
          const dayTasks = tasksByDate[dateStr] || []
          const isToday = dateStr === todayStr
          const dayOfWeek = (date.getUTCDay() + 6) % 7 // Mon=0…Sun=6
          const isWeekend = dayOfWeek >= 5

          // Highlight current week
          const ws = getWeekStart(date.toISOString())
          const isCurrentWeek = ws.toISOString().split('T')[0] === currentWeekStartStr

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(date)}
              className={`min-h-[110px] p-2 cursor-pointer transition-colors ${
                isWeekend ? 'bg-[#0e0e0e] hover:bg-[#131313]' : 'bg-[#131313] hover:bg-[#1a1a1a]'
              } ${isCurrentWeek ? 'ring-inset ring-1 ring-[#adc6ff]/10' : ''}`}
            >
              <div className={`text-xs font-medium mb-2 w-6 h-6 flex items-center justify-center rounded-full ${
                isToday
                  ? 'bg-[#adc6ff] text-[#003d88] font-bold'
                  : isWeekend
                  ? 'text-[#5a5a5a]'
                  : 'text-[#acabab]'
              }`}>
                {date.getUTCDate()}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
                      task.completed
                        ? 'bg-[#252626] text-[#5a5a5a] line-through'
                        : 'bg-[#adc6ff]/10 text-[#adc6ff]'
                    }`}
                  >
                    {task.time} {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[10px] text-[#acabab] pl-1">
                    +{dayTasks.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
