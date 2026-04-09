import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Board } from '@/components/Board'
import { CalendarView } from '@/components/CalendarView'
import { ArchivedView } from '@/components/ArchivedView'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getWeekStart, getMonthRange, toYearMonth } from '@/lib/utils'

type SearchParams = Promise<{
  week?: string
  view?: string
  month?: string
}>

export default async function RotinaPage({ searchParams }: { searchParams: SearchParams }) {
  const { week, view = 'overview', month } = await searchParams
  const weekStart = getWeekStart(week)

  function serialize(tasks: { id: number; title: string; time: string; completed: boolean; dayId: string; weekStart: Date }[]) {
    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      time: t.time,
      completed: t.completed,
      dayId: t.dayId,
      weekStart: t.weekStart.toISOString(),
    }))
  }

  let content: React.ReactNode
  let currentMonth = month

  if (view === 'calendar') {
    if (!currentMonth) currentMonth = toYearMonth(weekStart)
    const { start, end } = getMonthRange(currentMonth)
    const firstWeekOfMonth = getWeekStart(start.toISOString())

    const tasks = await prisma.task.findMany({
      where: { weekStart: { gte: firstWeekOfMonth, lte: end } },
      orderBy: { time: 'asc' },
    })

    content = (
      <CalendarView
        tasks={serialize(tasks)}
        currentMonth={currentMonth}
        weekStart={weekStart.toISOString()}
      />
    )
  } else if (view === 'archived') {
    const tasks = await prisma.task.findMany({
      where: { weekStart: { lt: weekStart } },
      orderBy: [{ weekStart: 'desc' }, { time: 'asc' }],
    })

    content = <ArchivedView initialTasks={serialize(tasks)} />
  } else {
    const tasks = await prisma.task.findMany({
      where: { weekStart },
      orderBy: { time: 'asc' },
    })

    content = (
      <Board
        key={weekStart.toISOString()}
        initialTasks={serialize(tasks)}
        weekStart={weekStart.toISOString()}
      />
    )
  }

  return (
    <div className="flex h-screen bg-[#0e0e0e] text-[#e7e5e5] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header
          weekStart={weekStart.toISOString()}
          currentView={view}
          currentMonth={currentMonth}
        />
        {content}

        {view === 'overview' && (
          <div className="fixed bottom-8 right-8">
            <button className="w-14 h-14 bg-[#adc6ff] text-[#003d88] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
              <Plus className="w-8 h-8" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
