export function getWeekStart(dateParam?: string): Date {
  const now = dateParam ? new Date(dateParam) : new Date()
  const day = now.getUTCDay()
  const diff = now.getUTCDate() - day + (day === 0 ? -6 : 1)
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), diff))
}

const MONTHS_UPPER = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO',
]

const MONTHS_TITLE = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6)

  const startDay = weekStart.getUTCDate()
  const endDay = weekEnd.getUTCDate()
  const startMonth = MONTHS_UPPER[weekStart.getUTCMonth()]
  const endMonth = MONTHS_UPPER[weekEnd.getUTCMonth()]

  if (weekStart.getUTCMonth() === weekEnd.getUTCMonth()) {
    return `${startDay} A ${endDay} DE ${startMonth}`
  }
  return `${startDay} DE ${startMonth} A ${endDay} DE ${endMonth}`
}

export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number)
  return `${MONTHS_TITLE[month - 1]} ${year}`
}

export const DAY_OFFSETS: Record<string, number> = {
  seg: 0, ter: 1, qua: 2, qui: 3, sex: 4, sab: 5, dom: 6,
}

export const DAY_NAMES_PT: Record<string, string> = {
  seg: 'Segunda', ter: 'Terça', qua: 'Quarta', qui: 'Quinta',
  sex: 'Sexta', sab: 'Sábado', dom: 'Domingo',
}

export function getTaskDate(weekStart: string | Date, dayId: string): Date {
  const ws = typeof weekStart === 'string' ? new Date(weekStart) : weekStart
  const offset = DAY_OFFSETS[dayId] ?? 0
  return new Date(Date.UTC(ws.getUTCFullYear(), ws.getUTCMonth(), ws.getUTCDate() + offset))
}

export function getMonthRange(yearMonth: string): { start: Date; end: Date } {
  const [year, month] = yearMonth.split('-').map(Number)
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  }
}

export function toYearMonth(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}
