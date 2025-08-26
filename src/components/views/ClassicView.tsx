import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns"
import React, { useEffect, useState } from "react"
import { ColorTextureCode, applyColorToDate, getDateKey } from "../../utils/colors"
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

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleMouseDown = (date: Date) => {
    setIsDragging(true)
    applyColorToDate(date, coloredDays, selectedColorTexture, setColoredDays)
  }

  const handleMouseEnter = (date: Date) => {
    if (isDragging) {
      applyColorToDate(date, coloredDays, selectedColorTexture, setColoredDays)
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
    const newCustomTexts = new Map(customTexts)

    if (text.trim()) {
      newCustomTexts.set(dateKey, text)
    } else {
      newCustomTexts.delete(dateKey)
    }

    setCustomTexts(newCustomTexts)
  }

  const getAdjustedDayOfWeek = (date: Date): number => {
    const day = getDay(date)
    return day === 0 ? 6 : day - 1 // Sunday becomes 6, Monday becomes 0
  }

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

    if (currentWeek.some((day) => day !== null)) {
      weeks.push([...currentWeek])
    }

    return weeks
  }

  const getMonthName = (month: number): string => {
    return format(new Date(selectedYear, month, 1), "MMMM")
  }

  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
        maxWidth: "100%",
        overflow: "hidden",
        padding: "10px",
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
              minWidth: "280px",
              maxWidth: "400px",
              flex: "0 1 auto",
              width: "100%",
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
                              onMouseDown={() => handleMouseDown(day)}
                              onMouseEnter={() => handleMouseEnter(day)}
                              onCustomTextChange={(text) => handleCustomTextChange(day, text)}
                              customText={customText}
                              customTextOverflow="overflow-x"
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
