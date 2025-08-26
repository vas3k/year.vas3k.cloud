import { addDays, eachDayOfInterval, endOfYear, format, getDay, isSameMonth, startOfYear, subDays } from "date-fns"
import React, { useEffect, useState } from "react"
import { ColorTextureCode } from "../../types/colors"
import Day from "../Day"

interface LinearViewProps {
  selectedYear: number
  coloredDays: Map<string, ColorTextureCode>
  setColoredDays: (days: Map<string, ColorTextureCode>) => void
  selectedColorTexture: ColorTextureCode
  customTexts: Map<string, string>
  setCustomTexts: (texts: Map<string, string>) => void
}

const LinearView: React.FC<LinearViewProps> = ({
  selectedYear,
  coloredDays,
  setColoredDays,
  selectedColorTexture,
  customTexts,
  setCustomTexts,
}) => {
  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)

  const year = selectedYear
  const startDate = startOfYear(new Date(year, 0, 1))
  const endDate = endOfYear(new Date(year, 11, 31))

  const allDays = eachDayOfInterval({ start: startDate, end: endDate })

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  // Helper function to create a unique key for a date
  const getDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  // Handle day click - delegate to Day component
  const handleDayClick = (date: Date) => {
    const dateKey = getDateKey(date)
    const newColoredDays = new Map(coloredDays)
    const currentSelection = coloredDays.get(dateKey)

    // Let the Day component handle the logic
    if (currentSelection && currentSelection === selectedColorTexture) {
      // If same selection, remove it
      newColoredDays.delete(dateKey)
    } else {
      // If different or no selection, apply the new one
      newColoredDays.set(dateKey, selectedColorTexture)
    }

    setColoredDays(newColoredDays)
  }

  // Handle mouse down to start drag
  const handleMouseDown = (date: Date) => {
    setIsDragging(true)
    setDragStartDate(date)
  }

  // Handle mouse enter during drag
  const handleMouseEnter = (date: Date) => {
    if (isDragging && dragStartDate) {
      const dateKey = getDateKey(date)
      const newColoredDays = new Map(coloredDays)
      const currentSelection = coloredDays.get(dateKey)

      if (currentSelection && currentSelection === selectedColorTexture) {
        newColoredDays.delete(dateKey)
      } else {
        newColoredDays.set(dateKey, selectedColorTexture)
      }
      setColoredDays(newColoredDays)
    }
  }

  // Global mouse up handler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
      setDragStartDate(null)
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  // Handle custom text change
  const handleCustomTextChange = (date: Date, text: string) => {
    const dateKey = getDateKey(date)
    const newCustomTexts = new Map(customTexts)

    if (text.trim()) {
      newCustomTexts.set(dateKey, text)
    } else {
      newCustomTexts.delete(dateKey)
    }

    setCustomTexts(newCustomTexts)
  }

  // Adjust day of week to start from Monday (0 = Monday, 6 = Sunday)
  const getAdjustedDayOfWeek = (date: Date): number => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1 // Sunday becomes 6, Monday becomes 0
  }

  // Function to fill empty cells with dates from adjacent years
  const fillEmptyCells = (week: Date[]): Date[] => {
    const filledWeek = [...week]

    // Find the first and last actual dates in the week
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

  // Group days into weeks and fill empty cells with dates from adjacent years
  const weeks: Date[][] = []
  let currentWeek: Date[] = new Array(7).fill(null)

  allDays.forEach((day) => {
    const dayOfWeek = getAdjustedDayOfWeek(day)
    currentWeek[dayOfWeek] = day

    // If we've filled a complete week (Sunday), start a new week
    if (dayOfWeek === 6) {
      // Fill empty cells with dates from previous/next years
      const filledWeek = fillEmptyCells(currentWeek)
      weeks.push(filledWeek)
      currentWeek = new Array(7).fill(null)
    }
  })

  // Add the last incomplete week if it has any days
  if (currentWeek.some((day) => day !== null)) {
    const filledWeek = fillEmptyCells(currentWeek)
    weeks.push(filledWeek)
  }

  // Function to get month name for a given date
  const getMonthName = (date: Date): string => {
    return format(date, "MMMM")
  }

  // Function to check if a week should show a month name
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

  // Function to get adjacent day for border calculations
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

  // Function to check if two days are from different months or years
  const areDifferentMonths = (day1: Date | null, day2: Date | null): boolean => {
    if (!day1 || !day2) return false
    // Check if they're from different years OR different months
    return day1.getFullYear() !== day2.getFullYear() || !isSameMonth(day1, day2)
  }

  // Function to get border styles for a specific day
  const getDayBorderStyles = (day: Date | null, dayIndex: number, weekIndex: number): React.CSSProperties => {
    if (!day) {
      return {
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
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
      borderTop: isTopEdge || hasDifferentMonthAbove ? "2px solid #333" : "1px solid #ccc",
      borderRight: isRightEdge || hasDifferentMonthRight ? "2px solid #333" : "1px solid #ccc",
      borderBottom: isBottomEdge || hasDifferentMonthBelow ? "2px solid #333" : "1px solid #ccc",
      borderLeft: isLeftEdge || hasDifferentMonthLeft ? "2px solid #333" : "1px solid #ccc",
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        padding: "20px",
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          maxWidth: "1600px",
          border: "2px solid #333",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #333" }}>
            <th
              style={{
                width: "120px",
                padding: "10px",
                fontWeight: "bold",
                borderRight: "2px solid #333",
                backgroundColor: "#f5f5f5",
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
                  borderRight: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
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
                    borderRight: "2px solid #333",
                    backgroundColor: "#f0f0f0",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderTop: monthName ? "2px solid #333" : "none",
                    borderBottom: "none",
                  }}
                >
                  {monthName}
                </td>

                {/* Day cells */}
                {week.map((day, dayIndex) => {
                  const dateKey = getDateKey(day)
                  const isColored = coloredDays.has(dateKey)
                  const dayColorTexture = coloredDays.get(dateKey)
                  const customText = customTexts.get(dateKey) || ""

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
                          onClick={() => handleDayClick(day)}
                          onMouseDown={() => handleMouseDown(day)}
                          onMouseEnter={() => handleMouseEnter(day)}
                          onCustomTextChange={(text) => handleCustomTextChange(day, text)}
                          customText={customText}
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
