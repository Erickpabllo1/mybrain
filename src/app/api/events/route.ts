import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getMonthRange } from '@/lib/utils'

function serialize(e: { id: number; date: Date; note: string; time: string }) {
  return { id: e.id, date: e.date.toISOString().split('T')[0], note: e.note, time: e.time }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  if (!month) return NextResponse.json({ error: 'month é obrigatório' }, { status: 400 })

  const { start, end } = getMonthRange(month)
  const events = await prisma.calendarEvent.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(events.map(serialize))
}

export async function POST(req: NextRequest) {
  const { date, note = '', time = '' } = await req.json()
  if (!date) return NextResponse.json({ error: 'date é obrigatório' }, { status: 400 })

  const event = await prisma.calendarEvent.create({
    data: { date: new Date(date), note, time },
  })

  return NextResponse.json(serialize(event), { status: 201 })
}
