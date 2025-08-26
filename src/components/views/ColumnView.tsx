import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns"
import React, { useEffect, useState } from "react"
import { ColorTextureCode, applyColorToDate, getDateKey } from "../../utils/colors"
import Day from "../Day"

interface ColumnViewProps {
  selectedYear: number
  coloredDays: Map<string, ColorTextureCode>
  setColoredDays: (days: Map<string, ColorTextureCode>) => void
  selectedColorTexture: ColorTextureCode
  customTexts: Map<string, string>
  setCustomTexts: (texts: Map<string, string>) => void
}

const ColumnView: React.FC<ColumnViewProps> = ({
  selectedYear,
  coloredDays,
  setColoredDays,
  selectedColorTexture,
  customTexts,
  setCustomTexts,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  // Handle mouse down to start drag
  const handleMouseDown = (date: Date) => {
    setIsDragging(true)
    applyColorToDate(date, coloredDays, selectedColorTexture, setColoredDays)
  }

  // Handle mouse enter during drag
  const handleMouseEnter = (date: Date) => {
    if (isDragging) {
      applyColorToDate(date, coloredDays, selectedColorTexture, setColoredDays)
    }
  }

  // Global mouse up and touch end handler
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

  // Function to get all days for a specific month
  const getDaysForMonth = (month: number): Date[] => {
    const startDate = startOfMonth(new Date(selectedYear, month, 1))
    const endDate = endOfMonth(new Date(selectedYear, month, 1))
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  // Function to get month name
  const getMonthName = (month: number): string => {
    return format(new Date(selectedYear, month, 1), "MMMM")
  }

  // Get the maximum number of days in any month (for table height)
  const getMaxDaysInYear = (): number => {
    return Math.max(...Array.from({ length: 12 }, (_, i) => getDaysForMonth(i).length))
  }

  // Generate all months
  const months = Array.from({ length: 12 }, (_, i) => i)
  const maxDays = getMaxDaysInYear()

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto", // Enable horizontal scrolling on mobile
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      }}
    >
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          minWidth: "800px",
          border: "2px solid #333",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #333" }}>
            {months.map((month) => (
              <th
                key={month}
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRight: "1px solid #ccc",
                  backgroundColor: "#f5f5f5",
                  width: `${100 / 12}%`, // Equal width for all columns
                }}
              >
                {getMonthName(month)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxDays }, (_, dayIndex) => (
            <tr key={dayIndex}>
              {months.map((month) => {
                const monthDays = getDaysForMonth(month)
                const day = monthDays[dayIndex] || null

                if (!day) {
                  return (
                    <td
                      key={month}
                      style={{
                        padding: "0",
                        textAlign: "center",
                        verticalAlign: "middle",
                        border: "1px solid #eee",
                        height: "40px",
                        backgroundColor: "#f9f9f9",
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
                    key={month}
                    style={{
                      padding: "0",
                      textAlign: "center",
                      verticalAlign: "middle",
                      border: "1px solid #eee",
                      height: "40px",
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
                      customTextOverflow="overflow-y"
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ColumnView
