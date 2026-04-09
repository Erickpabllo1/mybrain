'use client'

import { MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatWeekRange, formatMonthYear, toYearMonth } from '@/lib/utils'
import { NotificationBell } from '@/components/NotificationBell'

interface HeaderProps {
  weekStart: string
  currentView: string
  currentMonth?: string
}

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'calendar', label: 'Calendário' },
  { id: 'archived', label: 'Arquivados' },
]

export function Header({ weekStart, currentView, currentMonth }: HeaderProps) {
  const router = useRouter()
  const weekStartDate = new Date(weekStart)

  const buildUrl = (view: string, weekDate: Date, month?: string) => {
    const w = weekDate.toISOString().split('T')[0]
    if (view === 'overview') return `/rotina?week=${w}`
    if (view === 'calendar') {
      const m = month || toYearMonth(weekDate)
      return `/rotina?view=calendar&week=${w}&month=${m}`
    }
    return `/rotina?view=${view}&week=${w}`
  }

  const navigate = (offset: number) => {
    const d = new Date(weekStartDate)
    d.setUTCDate(d.getUTCDate() + offset * 7)
    const newMonth = currentView === 'calendar'
      ? toYearMonth(d)
      : currentMonth
    router.push(buildUrl(currentView, d, newMonth))
  }

  const goToView = (view: string) => {
    router.push(buildUrl(view, weekStartDate, currentMonth))
  }

  const subtitle = currentView === 'calendar' && currentMonth
    ? formatMonthYear(currentMonth).toUpperCase()
    : currentView === 'archived'
    ? 'TAREFAS ARQUIVADAS'
    : formatWeekRange(weekStartDate)

  return (
    <header className="flex justify-between items-center w-full h-20 px-8 bg-[#0e0e0e] z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-white leading-tight">Minha rotina</h2>
          <span className="text-[0.6875rem] text-[#acabab] tracking-wider uppercase font-medium mt-1">
            {subtitle}
          </span>
        </div>
        <div className="flex items-center gap-0.5 ml-1">
          <button
            onClick={() => navigate(-1)}
            className="hover:bg-white/5 rounded p-1 transition-all duration-200 text-[#acabab] hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="hover:bg-white/5 rounded p-1 transition-all duration-200 text-[#acabab] hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center gap-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => goToView(tab.id)}
              className={`transition-colors text-[0.875rem] pb-1 ${
                currentView === tab.id
                  ? 'text-[#adc6ff] border-b border-[#adc6ff]'
                  : 'text-[#acabab] hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 text-[#acabab]">
          <NotificationBell />
          <button className="hover:bg-white/5 rounded-full p-2 transition-all duration-200">
            <MoreVertical className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#252626] flex items-center justify-center border border-white/10 ml-2 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64"
              alt="Avatar do Usuário"
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
