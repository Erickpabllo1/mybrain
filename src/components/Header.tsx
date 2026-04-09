'use client'

import { Bell, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatWeekRange } from '@/lib/utils'

export function Header({ weekStart }: { weekStart: string }) {
  const router = useRouter()
  const weekStartDate = new Date(weekStart)

  const navigate = (offset: number) => {
    const d = new Date(weekStartDate)
    d.setUTCDate(d.getUTCDate() + offset * 7)
    router.push(`/rotina?week=${d.toISOString().split('T')[0]}`)
  }

  return (
    <header className="flex justify-between items-center w-full h-20 px-8 bg-[#0e0e0e] z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold text-white leading-tight">Minha rotina</h2>
          <span className="text-[0.6875rem] text-[#acabab] tracking-wider uppercase font-medium mt-1">
            {formatWeekRange(weekStartDate)}
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
          <a href="#" className="text-[#adc6ff] border-b border-[#adc6ff] pb-1 text-[0.875rem]">Visão Geral</a>
          <a href="#" className="text-[#acabab] hover:text-gray-300 transition-colors text-[0.875rem]">Calendário</a>
          <a href="#" className="text-[#acabab] hover:text-gray-300 transition-colors text-[0.875rem]">Arquivados</a>
        </nav>

        <div className="flex items-center gap-2 text-[#acabab]">
          <button className="hover:bg-white/5 rounded-full p-2 transition-all duration-200">
            <Bell className="w-5 h-5" />
          </button>
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
