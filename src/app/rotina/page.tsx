import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Board } from '@/components/Board'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getWeekStart } from '@/lib/utils'

export default async function RotinaPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const weekStart = getWeekStart(week)

  const tasks = await prisma.task.findMany({
    where: { weekStart },
    orderBy: { time: 'asc' },
  })

  const serializedTasks = tasks.map(t => ({
    id: t.id,
    title: t.title,
    time: t.time,
    completed: t.completed,
    dayId: t.dayId,
    weekStart: t.weekStart.toISOString(),
  }))

  return (
    <div className="flex h-screen bg-[#0e0e0e] text-[#e7e5e5] overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Header weekStart={weekStart.toISOString()} />
        <Board
          key={weekStart.toISOString()}
          initialTasks={serializedTasks}
          weekStart={weekStart.toISOString()}
        />

        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-8">
          <button className="w-14 h-14 bg-[#adc6ff] text-[#003d88] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
            <Plus className="w-8 h-8" />
          </button>
        </div>
      </main>
    </div>
  )
}
