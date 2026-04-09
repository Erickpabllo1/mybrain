export function getWeekStart(dateParam?: string): Date {
  const now = dateParam ? new Date(dateParam) : new Date()
  const day = now.getUTCDay() // 0 = Domingo
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff))
}

const MONTHS_PT = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
]

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 4) // Sex

  const startDay = weekStart.getUTCDate()
  const endDay = weekEnd.getUTCDate()
  const startMonth = MONTHS_PT[weekStart.getUTCMonth()]
  const endMonth = MONTHS_PT[weekEnd.getUTCMonth()]

  if (weekStart.getUTCMonth() === weekEnd.getUTCMonth()) {
    return `${startDay} A ${endDay} DE ${startMonth}`
  }
  return `${startDay} DE ${startMonth} A ${endDay} DE ${endMonth}`
}
