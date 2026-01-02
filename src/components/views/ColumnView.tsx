import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns"
import React, { useEffect, useState } from "react"
import { addCellToDate, applyColorToDate, ColorTextureCode, DateCellsArray, getDateKey, removeCellFromDate, UI_COLORS } from "../../utils/colors"
import Day from "../Day"

interface ColumnViewProps {
  selectedYear: number
  dateCells: Map<string, DateCellsArray>
  setDateCells: (dateCells: Map<string, DateCellsArray>) => void
  selectedColorTexture: ColorTextureCode
}

const ColumnView: React.FC<ColumnViewProps> = ({ selectedYear, dateCells, setDateCells, selectedColorTexture }) => {
  const [isDragging, setIsDragging] = useState(false)

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
          border: `2px solid ${UI_COLORS.border.primary}`,
        }}
      >
        <thead>
          <tr style={{ borderBottom: `2px solid ${UI_COLORS.border.primary}` }}>
            {months.map((month) => (
              <th
                key={month}
                style={{
                  padding: "12px 8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "16px",
                  borderRight: `1px solid ${UI_COLORS.border.secondary}`,
                  backgroundColor: UI_COLORS.background.secondary,
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
                        border: `1px solid ${UI_COLORS.border.tertiary}`,
                        height: "40px",
                        backgroundColor: UI_COLORS.background.tertiary,
                      }}
                    />
                  )
                }

                const dateKey = getDateKey(day)
                const dateCellsArray = dateCells.get(dateKey) || [{}]
                const cellCount = dateCellsArray.length

                return (
                  <td
                    key={month}
                    style={{
                      padding: "0",
                      textAlign: "center",
                      verticalAlign: "top",
                      border: `1px solid ${UI_COLORS.border.tertiary}`,
                      minHeight: "40px",
                      height: "auto",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "row",
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
                              width: `${100 / cellCount}%`,
                              minWidth: "40px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderLeft: cellIndex > 0 ? `1px dashed ${UI_COLORS.border.secondary}` : "none",
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
                              customTextOverflow="overflow-y"
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
  )
}

export default ColumnView
