'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'

interface CalendarEvent {
  id: number
  date: string
  note: string
  time: string
}

export function NotificationBell() {
  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([])
  const [showPanel, setShowPanel] = useState(false)
  const notifiedRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const checkEvents = async () => {
      const now = new Date()
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      const month = dateStr.substring(0, 7)

      try {
        const res = await fetch(`/api/events?month=${month}`)
        const events: CalendarEvent[] = await res.json()

        const todayWithTime = events.filter(e => e.date === dateStr && e.time)
        const nowMinutes = now.getHours() * 60 + now.getMinutes()

        const upcoming: CalendarEvent[] = []

        for (const event of todayWithTime) {
          const [h, m] = event.time.split(':').map(Number)
          const eventMinutes = h * 60 + m
          const diff = eventMinutes - nowMinutes

          // Mostrar no painel: próximos 120 minutos ou já passados há menos de 10 min
          if (diff >= -10 && diff <= 120) {
            upcoming.push(event)
          }

          // Notificação: 15 min antes
          if (diff > 0 && diff <= 15 && !notifiedRef.current.has(event.id)) {
            notifiedRef.current.add(event.id)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`Compromisso em ${diff} min`, {
                body: `${event.time} — ${event.note || 'Compromisso agendado'}`,
              })
            }
          }
        }

        setUpcomingEvents(upcoming)
      } catch (e) {
        console.error(e)
      }
    }

    checkEvents()
    const interval = setInterval(checkEvents, 60_000)
    return () => clearInterval(interval)
  }, [])

  const count = upcomingEvents.length

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(v => !v)}
        className="relative hover:bg-white/5 rounded-full p-2 transition-all duration-200 text-[#acabab] hover:text-white"
      >
        <Bell className="w-5 h-5" />
        {count > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#adc6ff] rounded-full ring-2 ring-[#0e0e0e]" />
        )}
      </button>

      {/* Painel de notificações */}
      {showPanel && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPanel(false)} />
          <div className="absolute right-0 top-11 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs font-medium text-white">Compromissos de hoje</p>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs text-[#acabab]">Nenhum compromisso próximo</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                {upcomingEvents.map(event => {
                  const now = new Date()
                  const nowMin = now.getHours() * 60 + now.getMinutes()
                  const [h, m] = event.time.split(':').map(Number)
                  const diff = (h * 60 + m) - nowMin
                  const label = diff < 0
                    ? `há ${Math.abs(diff)} min`
                    : diff === 0
                    ? 'agora'
                    : `em ${diff} min`

                  return (
                    <div key={event.id} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex flex-col items-center gap-0.5 shrink-0">
                        <span className="text-[11px] font-medium text-[#adc6ff]">{event.time}</span>
                        <span className={`text-[10px] ${diff <= 15 ? 'text-amber-400' : 'text-[#5a5a5a]'}`}>
                          {label}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#e7e5e5] truncate">
                          {event.note || 'Compromisso agendado'}
                        </p>
                      </div>
                      {diff <= 15 && diff >= 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
