import React, { createContext, useContext, useEffect, useState } from "react"
import { ColorTextureCode, DateCellData } from "../utils/colors"
import { createDefaultMonthRange, ensureValidRange, MonthRange, isValidMonthPointer } from "../utils/monthRange"

type CalendarView = "Linear" | "Classic" | "Column"

interface CalendarContextType {
  monthRange: MonthRange
  setMonthRange: (range: MonthRange) => void
  dateCells: Map<string, DateCellData>
  setDateCells: (dateCells: Map<string, DateCellData>) => void
  selectedColorTexture: ColorTextureCode
  setSelectedColorTexture: (colorTexture: ColorTextureCode) => void
  selectedView: CalendarView
  setSelectedView: (view: CalendarView) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

interface CalendarProviderProps {
  children: React.ReactNode
}

const STORAGE_KEY = "calendar_data"
const STORAGE_VERSION = "3.0"

interface StoredData {
  monthRange: MonthRange
  selectedYear?: number
  dateCells: Record<string, DateCellData>
  selectedColorTexture: ColorTextureCode
  selectedView: CalendarView
  version?: string
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear()

  const [monthRange, setMonthRangeState] = useState<MonthRange>(createDefaultMonthRange(currentYear))
  const [dateCells, setDateCellsState] = useState<Map<string, DateCellData>>(new Map())
  const [selectedColorTexture, setSelectedColorTextureState] = useState<ColorTextureCode>("red")
  const [selectedView, setSelectedViewState] = useState<CalendarView>("Linear")

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData)

        if (parsedData.monthRange) {
          const { start, end } = parsedData.monthRange
          if (start && end && isValidMonthPointer(start) && isValidMonthPointer(end)) {
            setMonthRangeState(ensureValidRange(parsedData.monthRange))
          }
        } else if (
          parsedData.selectedYear &&
          parsedData.selectedYear >= currentYear - 1 &&
          parsedData.selectedYear <= currentYear + 5
        ) {
          setMonthRangeState(createDefaultMonthRange(parsedData.selectedYear))
        }

        if (parsedData.dateCells) {
          const dateCellsMap = new Map(Object.entries(parsedData.dateCells))
          setDateCellsState(dateCellsMap)
        }

        if (parsedData.selectedColorTexture) {
          setSelectedColorTextureState(parsedData.selectedColorTexture)
        }

        if (parsedData.selectedView && ["Linear", "Classic", "Column"].includes(parsedData.selectedView)) {
          setSelectedViewState(parsedData.selectedView)
        }
      }
    } catch (error) {
      console.error("Error loading calendar data from localStorage:", error)
    }
  }, [currentYear])

  const saveToLocalStorage = (overrides: Partial<StoredData> = {}) => {
    const dataToSave: StoredData = {
      monthRange,
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture,
      selectedView,
      version: STORAGE_VERSION,
      ...overrides,
    }

    dataToSave.version = STORAGE_VERSION

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Error saving calendar data to localStorage:", error)
    }
  }

  const setMonthRange = (range: MonthRange) => {
    const validRange = ensureValidRange(range)
    setMonthRangeState(validRange)
    saveToLocalStorage({ monthRange: validRange })
  }

  const setDateCells = (newDateCells: Map<string, DateCellData>) => {
    setDateCellsState(newDateCells)
    saveToLocalStorage({ dateCells: Object.fromEntries(newDateCells) })
  }

  const setSelectedColorTexture = (colorTexture: ColorTextureCode) => {
    setSelectedColorTextureState(colorTexture)
    saveToLocalStorage({ selectedColorTexture: colorTexture })
  }

  const setSelectedView = (view: CalendarView) => {
    setSelectedViewState(view)
    saveToLocalStorage({ selectedView: view })
  }

  const value: CalendarContextType = {
    monthRange,
    setMonthRange,
    dateCells,
    setDateCells,
    selectedColorTexture,
    setSelectedColorTexture,
    selectedView,
    setSelectedView,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider")
  }
  return context
}
