import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from "date-fns"
import React, { useEffect, useState } from "react"
import { addCellToDate, applyColorToDate, ColorTextureCode, DateCellsArray, getDateKey, removeCellFromDate, UI_COLORS } from "../../utils/colors"
import Day from "../Day"

interface ClassicViewProps {
  selectedYear: number
  dateCells: Map<string, DateCellsArray>
  setDateCells: (dateCells: Map<string, DateCellsArray>) => void
  selectedColorTexture: ColorTextureCode
}

const ClassicView: React.FC<ClassicViewProps> = ({ selectedYear, dateCells, setDateCells, selectedColorTexture }) => {
  const [isDragging, setIsDragging] = useState(false)

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const handleMouseDown = (date: Date, cellIndex: number) => {
    setIsDragging(true)
    applyColorToDate(date, dateCells, selectedColorTexture, setDateCells, cellIndex)
  }

  const handleMouseEnter = (date: Date, cellIndex: number) => {
    if (isDragging) {
      applyColorToDate(date, dateCells, selectedColorTexture, setDateCells, cellIndex)
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

  const handleCustomTextChange = (date: Date, text: string, cellIndex: number = 0) => {
    const dateKey = getDateKey(date)
    const newDateCells = new Map(dateCells)
    const currentCells = dateCells.get(dateKey) || [{}]
    const newCells = [...currentCells]

    // Ensure the cell at index exists
    while (newCells.length <= cellIndex) {
      newCells.push({})
    }

    if (text.trim()) {
      newCells[cellIndex] = {
        ...newCells[cellIndex],
        customText: text,
      }
    } else {
      const updatedCell = { ...newCells[cellIndex] }
      delete updatedCell.customText
      newCells[cellIndex] = updatedCell
    }

    // Only delete the date if there's a single empty cell
    // Keep multiple cells even if empty (user explicitly added them)
    if (newCells.length === 1 && Object.keys(newCells[0]).length === 0) {
      newDateCells.delete(dateKey)
    } else {
      newDateCells.set(dateKey, newCells)
    }

    setDateCells(newDateCells)
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
              border: `2px solid ${UI_COLORS.border.primary}`,
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: UI_COLORS.background.primary,
              minWidth: "280px",
              maxWidth: "400px",
              flex: "0 1 auto",
              width: "100%",
            }}
          >
            {/* Month header */}
            <div
              style={{
                backgroundColor: UI_COLORS.background.secondary,
                padding: "12px",
                textAlign: "center",
                borderBottom: `2px solid ${UI_COLORS.border.primary}`,
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
                          borderBottom: `1px solid ${UI_COLORS.border.secondary}`,
                          backgroundColor: UI_COLORS.background.tertiary,
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
                                border: `1px solid ${UI_COLORS.border.tertiary}`,
                                width: "14.28%",
                                maxWidth: "14.28%",
                                height: "40px",
                                overflow: "visible",
                              }}
                            />
                          )
                        }

                        const dateKey = getDateKey(day)
                        const dateCellsArray = dateCells.get(dateKey) || [{}]

                        return (
                          <td
                            key={dayIndex}
                            style={{
                              padding: "0",
                              textAlign: "center",
                              verticalAlign: "top",
                              border: `1px solid ${UI_COLORS.border.tertiary}`,
                              width: "14.28%",
                              maxWidth: "14.28%",
                              minHeight: "40px",
                              height: "auto",
                              overflow: "visible",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "stretch",
                              }}
                            >
                              {dateCellsArray.map((cellData, cellIndex) => {
                                const isColored = !!(cellData.color || cellData.texture)
                                const dayColorTexture = cellData.color || cellData.texture
                                const customText = cellData.customText || ""

                                return (
                                  <div
                                    key={cellIndex}
                                    style={{
                                      flex: 1,
                                      minHeight: "40px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      borderTop: cellIndex > 0 ? `1px dashed ${UI_COLORS.border.secondary}` : "none",
                                    }}
                                  >
                                    <Day
                                      date={day}
                                      isColored={isColored}
                                      colorTextureCode={dayColorTexture}
                                      onMouseDown={() => handleMouseDown(day, cellIndex)}
                                      onMouseEnter={() => handleMouseEnter(day, cellIndex)}
                                      onCustomTextChange={(text) => handleCustomTextChange(day, text, cellIndex)}
                                      customText={customText}
                                      customTextOverflow="overflow-x"
                                      cellIndex={cellIndex}
                                      totalCells={dateCellsArray.length}
                                      onAddCell={() => addCellToDate(day, dateCells, setDateCells)}
                                      onRemoveCell={() => removeCellFromDate(day, dateCells, setDateCells, cellIndex)}
                                    />
                                  </div>
                                )
                              })}
                            </div>
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
