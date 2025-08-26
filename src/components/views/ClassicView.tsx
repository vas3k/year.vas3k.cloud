import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns"
import React, { useEffect, useState } from "react"
import { ColorTextureCode } from "../../types/colors"
import Day from "../Day"

interface ClassicViewProps {
  selectedYear: number
  coloredDays: Map<string, ColorTextureCode>
  setColoredDays: (days: Map<string, ColorTextureCode>) => void
  selectedColorTexture: ColorTextureCode
  customTexts: Map<string, string>
  setCustomTexts: (texts: Map<string, string>) => void
}

const ClassicView: React.FC<ClassicViewProps> = ({
  selectedYear,
  coloredDays,
  setColoredDays,
  selectedColorTexture,
  customTexts,
  setCustomTexts,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null)

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

  // Function to get weeks for a specific month
  const getWeeksForMonth = (month: number): Date[][] => {
    const startDate = startOfMonth(new Date(selectedYear, month, 1))
    const endDate = endOfMonth(new Date(selectedYear, month, 1))

    const allDays = eachDayOfInterval({ start: startDate, end: endDate })
    const weeks: Date[][] = []
    let currentWeek: Date[] = new Array(7).fill(null)

    allDays.forEach((day) => {
      const dayOfWeek = getAdjustedDayOfWeek(day)
      currentWeek[dayOfWeek] = day

      // If we've filled a complete week (Sunday), start a new week
      if (dayOfWeek === 6) {
        weeks.push([...currentWeek])
        currentWeek = new Array(7).fill(null)
      }
    })

    // Add the last incomplete week if it has any days
    if (currentWeek.some((day) => day !== null)) {
      weeks.push([...currentWeek])
    }

    return weeks
  }

  // Function to get month name
  const getMonthName = (month: number): string => {
    return format(new Date(selectedYear, month, 1), "MMMM")
  }

  // Generate all months
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        padding: "20px",
        justifyContent: "center",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      {months.map((month) => {
        const weeks = getWeeksForMonth(month)
        const monthName = getMonthName(month)

        return (
          <div
            key={month}
            style={{
              border: "2px solid #333",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#fff",
              minWidth: "320px",
              maxWidth: "400px",
              flex: "0 1 auto",
            }}
          >
            {/* Month header */}
            <div
              style={{
                backgroundColor: "#f5f5f5",
                padding: "12px",
                textAlign: "center",
                borderBottom: "2px solid #333",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              {monthName}
            </div>

            {/* Calendar grid */}
            <div
              style={{
                width: "100%",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  tableLayout: "fixed",
                }}
              >
                <thead>
                  <tr>
                    {dayNames.map((dayName) => (
                      <th
                        key={dayName}
                        style={{
                          padding: "4px 2px",
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: "11px",
                          borderBottom: "1px solid #ccc",
                          backgroundColor: "#f9f9f9",
                          width: "14.28%", // 100% / 7 days
                          maxWidth: "14.28%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {dayName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((day, dayIndex) => {
                        // Only process if day is not null
                        if (!day) {
                          return (
                            <td
                              key={dayIndex}
                              style={{
                                padding: "0",
                                textAlign: "center",
                                verticalAlign: "middle",
                                border: "1px solid #eee",
                                width: "14.28%",
                                maxWidth: "14.28%",
                                height: "40px",
                                overflow: "visible",
                              }}
                            />
                          )
                        }

                        const dateKey = getDateKey(day)
                        const dayColorTexture = coloredDays.get(dateKey)
                        const isColored = dayColorTexture !== undefined
                        const customText = customTexts.get(dateKey) || ""

                        return (
                          <td
                            key={dayIndex}
                            style={{
                              padding: "0",
                              textAlign: "center",
                              verticalAlign: "middle",
                              border: "1px solid #eee",
                              width: "14.28%",
                              maxWidth: "14.28%",
                              height: "40px",
                              overflow: "visible",
                            }}
                          >
                            <Day
                              date={day}
                              isColored={isColored}
                              colorTextureCode={dayColorTexture}
                              onClick={() => handleDayClick(day)}
                              onMouseDown={() => handleMouseDown(day)}
                              onMouseEnter={() => handleMouseEnter(day)}
                              onCustomTextChange={(text) => handleCustomTextChange(day, text)}
                              customText={customText}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ClassicView
