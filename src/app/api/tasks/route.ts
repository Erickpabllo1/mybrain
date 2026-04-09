import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const weekParam = searchParams.get('weekStart')

  if (!weekParam) {
    return NextResponse.json({ error: 'weekStart é obrigatório' }, { status: 400 })
  }

  const weekStart = new Date(weekParam)
  const tasks = await prisma.task.findMany({
    where: { weekStart },
    orderBy: { time: 'asc' },
  })

  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, time, dayId, weekStart, completed = false } = body

  if (!title || !dayId || !weekStart) {
    return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
  }

  const task = await prisma.task.create({
    data: {
      title,
      time: time || '00:00',
      completed,
      dayId,
      weekStart: new Date(weekStart),
    },
  })

  return NextResponse.json(
    { ...task, weekStart: task.weekStart.toISOString() },
    { status: 201 }
  )
}
