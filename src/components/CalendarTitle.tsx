import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { isAfter, monthPointerToValue, MonthPointer, parseMonthPointerValue } from "../utils/monthRange"

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const CalendarTitle: React.FC = () => {
  const { monthRange, setMonthRange } = useCalendar()
  const currentYear = new Date().getFullYear()

  const monthNames = MONTH_NAMES

  const minYear = Math.min(currentYear - 3, monthRange.start.year, monthRange.end.year)
  const maxYear = Math.max(currentYear + 8, monthRange.start.year, monthRange.end.year)

  const monthOptions: { value: string; label: string }[] = []
  for (let year = minYear; year <= maxYear; year++) {
    for (let month = 0; month < 12; month++) {
      const pointer: MonthPointer = { year, month }
      monthOptions.push({
        value: monthPointerToValue(pointer),
        label: `${monthNames[month]} ${year}`,
      })
    }
  }

  const yearShortcutOptions: { value: string; label: string; key?: string }[] = []
  for (let year = 2025; year <= 2030; year++) {
    const pointer: MonthPointer = { year, month: 0 }
    yearShortcutOptions.push({
      value: monthPointerToValue(pointer),
      label: `${year}`,
      key: `year-${year}`,
    })
  }

  const startOptions: { value: string; label: string; key?: string }[] = [
    ...yearShortcutOptions,
    ...monthOptions,
  ]

  const handleStartChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStart = parseMonthPointerValue(event.target.value)
    let newEnd = monthRange.end

    if (newStart.month === 0) {
      newEnd = { year: newStart.year, month: 11 }
    } else if (isAfter(newStart, newEnd)) {
      newEnd = { ...newStart }
    }

    setMonthRange({ start: newStart, end: newEnd })
  }

  const handleEndChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newEnd = parseMonthPointerValue(event.target.value)
    let newStart = monthRange.start

    if (isAfter(newStart, newEnd)) {
      newStart = { ...newEnd }
    }

    setMonthRange({ start: newStart, end: newEnd })
  }

  const headerPrefix = "My plans from"

  return (
    <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
      {headerPrefix}{" "}
      <select
        value={monthPointerToValue(monthRange.start)}
        onChange={handleStartChange}
        style={{
          fontSize: "inherit",
          fontWeight: "inherit",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "0",
          borderRadius: "4px",
          touchAction: "auto",
        }}
      >
        {startOptions.map((option) => (
          <option key={option.key ?? option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {" to "}
      <select
        value={monthPointerToValue(monthRange.end)}
        onChange={handleEndChange}
        style={{
          fontSize: "inherit",
          fontWeight: "inherit",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "0",
          borderRadius: "4px",
          touchAction: "auto",
        }}
      >
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </h1>
  )
}

export default CalendarTitle
