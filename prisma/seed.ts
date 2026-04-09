import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function getCurrentWeekStart(): Date {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff))
}

async function main() {
  const weekStart = getCurrentWeekStart()

  // Limpa as tarefas da semana atual antes de semear
  await prisma.task.deleteMany({ where: { weekStart } })

  await prisma.task.createMany({
    data: [
      { title: 'Reunião de equipe', time: '09:00', completed: true,  dayId: 'seg', weekStart },
      { title: 'Academia',          time: '18:00', completed: false, dayId: 'seg', weekStart },
      { title: 'Estudar UI Design', time: '20:00', completed: false, dayId: 'ter', weekStart },
      { title: 'Revisão de Código', time: '10:30', completed: true,  dayId: 'qua', weekStart },
      { title: 'Almoço Networking', time: '12:30', completed: false, dayId: 'qui', weekStart },
      { title: 'Planejamento Semanal', time: '16:00', completed: false, dayId: 'sex', weekStart },
    ],
  })

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
