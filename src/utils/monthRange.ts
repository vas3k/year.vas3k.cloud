import { endOfMonth, startOfMonth } from "date-fns"

export interface MonthPointer {
  year: number
  month: number // 0-based
}

export interface MonthRange {
  start: MonthPointer
  end: MonthPointer
}

export const isValidMonthPointer = (pointer: MonthPointer): boolean => {
  return (
    Number.isInteger(pointer.year) &&
    Number.isInteger(pointer.month) &&
    pointer.month >= 0 &&
    pointer.month <= 11
  )
}

export const createDefaultMonthRange = (year: number): MonthRange => ({
  start: { year, month: 0 },
  end: { year, month: 11 },
})

const toMonthIndex = (pointer: MonthPointer): number => pointer.year * 12 + pointer.month

export const isBeforeOrEqual = (a: MonthPointer, b: MonthPointer): boolean => {
  return toMonthIndex(a) <= toMonthIndex(b)
}

export const isAfter = (a: MonthPointer, b: MonthPointer): boolean => {
  return toMonthIndex(a) > toMonthIndex(b)
}

export const normalizeMonthRange = (range: MonthRange): MonthRange => {
  if (isAfter(range.start, range.end)) {
    return {
      start: { ...range.end },
      end: { ...range.start },
    }
  }

  return {
    start: { ...range.start },
    end: { ...range.end },
  }
}

export const ensureValidRange = (range: MonthRange): MonthRange => {
  const normalized = normalizeMonthRange(range)
  return normalized
}

export const monthPointerToDate = (pointer: MonthPointer): Date => {
  return new Date(pointer.year, pointer.month, 1)
}

export const getRangeInterval = (range: MonthRange): { start: Date; end: Date } => {
  const normalized = normalizeMonthRange(range)
  return {
    start: startOfMonth(monthPointerToDate(normalized.start)),
    end: endOfMonth(monthPointerToDate(normalized.end)),
  }
}

export const enumerateMonths = (range: MonthRange): MonthPointer[] => {
  const normalized = normalizeMonthRange(range)
  const months: MonthPointer[] = []

  let currentYear = normalized.start.year
  let currentMonth = normalized.start.month

  while (currentYear < normalized.end.year || (currentYear === normalized.end.year && currentMonth <= normalized.end.month)) {
    months.push({ year: currentYear, month: currentMonth })
    currentMonth += 1
    if (currentMonth === 12) {
      currentMonth = 0
      currentYear += 1
    }
  }

  return months
}

export const monthPointerToValue = (pointer: MonthPointer): string => {
  return `${pointer.year}-${pointer.month}`
}

export const parseMonthPointerValue = (value: string): MonthPointer => {
  const [yearString, monthString] = value.split("-")
  const year = parseInt(yearString, 10)
  const month = parseInt(monthString, 10)

  if (Number.isNaN(year) || Number.isNaN(month)) {
    throw new Error(`Invalid month pointer value: ${value}`)
  }

  return { year, month }
}
