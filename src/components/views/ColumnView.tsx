import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns"
import React, { useEffect, useState } from "react"
import { ColorTextureCode, DateCellData, applyColorToDate, getDateKey } from "../../utils/colors"
import Day from "../Day"

interface ColumnViewProps {
  selectedYear: number
  dateCells: Map<string, DateCellData>
  setDateCells: (dateCells: Map<string, DateCellData>) => void
  selectedColorTexture: ColorTextureCode
}

const ColumnView: React.FC<ColumnViewProps> = ({ selectedYear, dateCells, setDateCells, selectedColorTexture }) => {
  const [isDragging, setIsDragging] = useState(false)

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

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleGlobalTouchCancel = (e: TouchEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    document.addEventListener("mouseup", handleGlobalMouseUp)
    document.addEventListener("touchend", handleGlobalTouchEnd, { passive: false })
    document.addEventListener("touchcancel", handleGlobalTouchCancel, { passive: false })
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
      document.removeEventListener("touchend", handleGlobalTouchEnd)
      document.removeEventListener("touchcancel", handleGlobalTouchCancel)
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

  const getDaysForMonth = (month: number): Date[] => {
    const startDate = startOfMonth(new Date(selectedYear, month, 1))
    const endDate = endOfMonth(new Date(selectedYear, month, 1))
    return eachDayOfInterval({ start: startDate, end: endDate })
  }

  const getMonthName = (month: number): string => {
    return format(new Date(selectedYear, month, 1), "MMMM")
  }

  const getMaxDaysInYear = (): number => {
    return Math.max(...Array.from({ length: 12 }, (_, i) => getDaysForMonth(i).length))
  }

  const months = Array.from({ length: 12 }, (_, i) => i)
  const maxDays = getMaxDaysInYear()

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
                const dayData = dateCells.get(dateKey) || {}
                const isColored = !!(dayData.color || dayData.texture)
                const dayColorTexture = dayData.color || dayData.texture
                const customText = dayData.customText || ""

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
