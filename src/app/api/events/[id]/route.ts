import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const event = await prisma.calendarEvent.update({
    where: { id: Number(id) },
    data: body,
  })

  return NextResponse.json({
    id: event.id,
    date: event.date.toISOString().split('T')[0],
    note: event.note,
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await prisma.calendarEvent.delete({ where: { id: Number(id) } })
  return new NextResponse(null, { status: 204 })
}
