import { addDays, eachDayOfInterval, format, getDay, isSameMonth, subDays } from "date-fns"
import React, { useEffect, useState } from "react"
import { applyColorToDate, ColorTextureCode, DateCellData, getDateKey, UI_COLORS } from "../../utils/colors"
import { getRangeInterval, MonthRange } from "../../utils/monthRange"
import Day from "../Day"

interface LinearViewProps {
  monthRange: MonthRange
  dateCells: Map<string, DateCellData>
  setDateCells: (dateCells: Map<string, DateCellData>) => void
  selectedColorTexture: ColorTextureCode
}

const LinearView: React.FC<LinearViewProps> = ({ monthRange, dateCells, setDateCells, selectedColorTexture }) => {
  const [isDragging, setIsDragging] = useState(false)

  const { start: startDate, end: endDate } = getRangeInterval(monthRange)

  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleMouseDown = (date: Date) => {
    setIsDragging(true)
    applyColorToDate(date, dateCells, selectedColorTexture, setDateCells)
  }

  const handleMouseEnter = (date: Date) => {
    if (isDragging) {
      applyColorToDate(date, dateCells, selectedColorTexture, setDateCells)
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    const handleGlobalTouchEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    document.addEventListener("touchend", handleGlobalTouchEnd)
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("touchend", handleGlobalTouchEnd)
    }
  }, [])

  const handleCustomTextChange = (date: Date, text: string) => {
    const dateKey = getDateKey(date)
    const newDateCells = new Map(dateCells)
    const currentCell = dateCells.get(dateKey) || {}

    if (text.trim()) {
      newDateCells.set(dateKey, {
        ...currentCell,
        customText: text,
      })
    } else {
      const updatedCell = { ...currentCell }
      delete updatedCell.customText

      // If the cell has no other properties, remove it entirely
      if (Object.keys(updatedCell).length === 0) {
        newDateCells.delete(dateKey)
      } else {
        newDateCells.set(dateKey, updatedCell)
      }
    }

    setDateCells(newDateCells)
  }

  const getAdjustedDayOfWeek = (date: Date): number => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1 // Sunday becomes 6, Monday becomes 0
  }

  const fillEmptyCells = (week: Date[]): Date[] => {
    const filledWeek = [...week]

    const firstDate = week.find((day) => day !== null)
    const lastDateIndex =
      week.length -
      1 -
      week
        .slice()
        .reverse()
        .findIndex((day) => day !== null)
    const lastDate = week[lastDateIndex]

    if (firstDate && lastDate) {
      // Fill cells before the first date with dates from previous year
      for (let i = 0; i < week.length; i++) {
        if (week[i] === null) {
          if (i < week.findIndex((day) => day !== null)) {
            // Fill with dates from previous year
            const daysToSubtract = week.findIndex((day) => day !== null) - i
            filledWeek[i] = subDays(firstDate, daysToSubtract)
          } else {
            // Fill with dates from next year
            const daysToAdd = i - lastDateIndex
            filledWeek[i] = addDays(lastDate, daysToAdd)
          }
        }
      }
    }

    return filledWeek
  }

  const weeks: Date[][] = []
  let currentWeek: Date[] = new Array(7).fill(null)

  allDays.forEach((day) => {
    const dayOfWeek = getAdjustedDayOfWeek(day)
    currentWeek[dayOfWeek] = day

    if (dayOfWeek === 6) {
      const filledWeek = fillEmptyCells(currentWeek)
      weeks.push(filledWeek)
      currentWeek = new Array(7).fill(null)
    }
  })

  if (currentWeek.some((day) => day !== null)) {
    const filledWeek = fillEmptyCells(currentWeek)
    weeks.push(filledWeek)
  }

  const getMonthName = (date: Date): string => {
    const monthLabel = format(date, "MMMM")
    const isStartMonth =
      date.getFullYear() === monthRange.start.year && date.getMonth() === monthRange.start.month
    const isJanuary = date.getMonth() === 0

    if (isStartMonth || isJanuary) {
      return `${monthLabel} ${date.getFullYear()}`
    }

    return monthLabel
  }

  const shouldShowMonthName = (week: Date[]): string | null => {
    // Find the first Monday of the month in this week
    const mondayInWeek = week[0] // Monday is at index 0
    if (mondayInWeek) {
      // Find the first day of the month that this Monday belongs to
      const monthStart = new Date(mondayInWeek)
      monthStart.setDate(1) // Go to first day of the month

      // Check if this Monday is the first Monday of its month
      const firstDayOfMonth = getAdjustedDayOfWeek(monthStart)
      const daysToFirstMonday = firstDayOfMonth === 0 ? 0 : 7 - firstDayOfMonth
      const firstMondayOfMonth = new Date(monthStart)
      firstMondayOfMonth.setDate(1 + daysToFirstMonday)

      // If this Monday matches the first Monday of its month, show the month name
      if (mondayInWeek.getTime() === firstMondayOfMonth.getTime()) {
        return getMonthName(mondayInWeek)
      }
    }

    return null
  }

  const getAdjacentDay = (
    weekIndex: number,
    dayIndex: number,
    direction: "top" | "bottom" | "left" | "right"
  ): Date | null => {
    if (direction === "top") {
      return weekIndex > 0 ? weeks[weekIndex - 1][dayIndex] : null
    } else if (direction === "bottom") {
      return weekIndex < weeks.length - 1 ? weeks[weekIndex + 1][dayIndex] : null
    } else if (direction === "left") {
      return dayIndex > 0 ? weeks[weekIndex][dayIndex - 1] : null
    } else if (direction === "right") {
      return dayIndex < 6 ? weeks[weekIndex][dayIndex + 1] : null
    }
    return null
  }

  const areDifferentMonths = (day1: Date | null, day2: Date | null): boolean => {
    if (!day1 || !day2) return false
    // Check if they're from different years OR different months
    return day1.getFullYear() !== day2.getFullYear() || !isSameMonth(day1, day2)
  }

  const getDayBorderStyles = (day: Date | null, dayIndex: number, weekIndex: number): React.CSSProperties => {
    if (!day) {
      return {
        border: `1px solid ${UI_COLORS.border.secondary}`,
        backgroundColor: UI_COLORS.background.tertiary,
      }
    }

    const isFirstDayOfWeek = dayIndex === 0
    const isLastDayOfWeek = dayIndex === 6
    const isFirstWeek = weekIndex === 0
    const isLastWeek = weekIndex === weeks.length - 1

    // Check adjacent cells for different months
    const topDay = getAdjacentDay(weekIndex, dayIndex, "top")
    const bottomDay = getAdjacentDay(weekIndex, dayIndex, "bottom")
    const leftDay = getAdjacentDay(weekIndex, dayIndex, "left")
    const rightDay = getAdjacentDay(weekIndex, dayIndex, "right")

    const hasDifferentMonthAbove = areDifferentMonths(day, topDay)
    const hasDifferentMonthBelow = areDifferentMonths(day, bottomDay)
    const hasDifferentMonthLeft = areDifferentMonths(day, leftDay)
    const hasDifferentMonthRight = areDifferentMonths(day, rightDay)

    // Edge cases for calendar boundaries
    const isTopEdge = isFirstWeek
    const isBottomEdge = isLastWeek
    const isLeftEdge = isFirstDayOfWeek
    const isRightEdge = isLastDayOfWeek

    return {
      borderTop:
        isTopEdge || hasDifferentMonthAbove
          ? `2px solid ${UI_COLORS.border.primary}`
          : `1px solid ${UI_COLORS.border.secondary}`,
      borderRight:
        isRightEdge || hasDifferentMonthRight
          ? `2px solid ${UI_COLORS.border.primary}`
          : `1px solid ${UI_COLORS.border.secondary}`,
      borderBottom:
        isBottomEdge || hasDifferentMonthBelow
          ? `2px solid ${UI_COLORS.border.primary}`
          : `1px solid ${UI_COLORS.border.secondary}`,
      borderLeft:
        isLeftEdge || hasDifferentMonthLeft
          ? `2px solid ${UI_COLORS.border.primary}`
          : `1px solid ${UI_COLORS.border.secondary}`,
    }
  }

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: "1000px",
          border: `2px solid ${UI_COLORS.border.primary}`,
        }}
      >
        <thead>
          <tr style={{ borderBottom: `2px solid ${UI_COLORS.border.primary}` }}>
            <th
              style={{
                width: "120px",
                padding: "10px",
                fontWeight: "bold",
                borderRight: `2px solid ${UI_COLORS.border.primary}`,
                backgroundColor: UI_COLORS.background.secondary,
                textAlign: "left",
              }}
            >
              &nbsp;
            </th>
            {dayNames.map((dayName) => (
              <th
                key={dayName}
                style={{
                  padding: "10px",
                  textAlign: "center",
                  fontWeight: "bold",
                  borderRight: `1px solid ${UI_COLORS.border.secondary}`,
                  backgroundColor: UI_COLORS.background.secondary,
                }}
              >
                {dayName}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => {
            const monthName = shouldShowMonthName(week)

            return (
              <tr key={weekIndex} style={{ minHeight: "60px" }}>
                {/* Month name cell */}
                <td
                  style={{
                    width: "120px",
                    padding: "10px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    borderRight: `2px solid ${UI_COLORS.border.primary}`,
                    backgroundColor: UI_COLORS.background.quaternary,
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderTop: monthName ? `2px solid ${UI_COLORS.border.primary}` : "none",
                    borderBottom: "none",
                  }}
                >
                  {monthName}
                </td>

                {/* Day cells */}
                {week.map((day, dayIndex) => {
                  const dateKey = getDateKey(day)
                  const dateCellData = dateCells.get(dateKey) || {}
                  const isColored = !!(dateCellData.color || dateCellData.texture)
                  const dayColorTexture = dateCellData.color || dateCellData.texture
                  const customText = dateCellData.customText || ""

                  return (
                    <td
                      key={dayIndex}
                      style={{
                        padding: "0",
                        textAlign: "center",
                        verticalAlign: "middle",
                        height: "50px",
                        ...getDayBorderStyles(day, dayIndex, weekIndex),
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Day
                          key={dayIndex}
                          date={day}
                          isColored={isColored}
                          colorTextureCode={dayColorTexture}
                          onMouseDown={() => handleMouseDown(day)}
                          onMouseEnter={() => handleMouseEnter(day)}
                          onCustomTextChange={(text) => handleCustomTextChange(day, text)}
                          customText={customText}
                          customTextOverflow="overflow-x"
                        />
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default LinearView
