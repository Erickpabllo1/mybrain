import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const task = await prisma.task.update({
    where: { id: Number(id) },
    data: body,
  })

  return NextResponse.json({ ...task, weekStart: task.weekStart.toISOString() })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await prisma.task.delete({ where: { id: Number(id) } })

  return new NextResponse(null, { status: 204 })
}
