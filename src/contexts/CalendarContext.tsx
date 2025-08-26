import React, { createContext, useContext, useEffect, useState } from "react"
import { ColorTextureCode, DateCellData } from "../utils/colors"

type CalendarView = "Linear" | "Classic" | "Column"

interface CalendarContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
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

interface StoredData {
  selectedYear: number
  dateCells: Record<string, DateCellData>
  selectedColorTexture: ColorTextureCode
  selectedView: CalendarView
  version?: string
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYearState] = useState(currentYear)
  const [dateCells, setDateCellsState] = useState<Map<string, DateCellData>>(new Map())
  const [selectedColorTexture, setSelectedColorTextureState] = useState<ColorTextureCode>("red")
  const [selectedView, setSelectedViewState] = useState<CalendarView>("Linear")

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData)

        if (
          parsedData.selectedYear &&
          parsedData.selectedYear >= currentYear - 1 &&
          parsedData.selectedYear <= currentYear + 5
        ) {
          setSelectedYearState(parsedData.selectedYear)
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

  const saveToLocalStorage = (data: StoredData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving calendar data to localStorage:", error)
    }
  }

  const setSelectedYear = (year: number) => {
    setSelectedYearState(year)
    saveToLocalStorage({
      selectedYear: year,
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture,
      selectedView,
    })
  }

  const setDateCells = (newDateCells: Map<string, DateCellData>) => {
    setDateCellsState(newDateCells)
    saveToLocalStorage({
      selectedYear,
      dateCells: Object.fromEntries(newDateCells),
      selectedColorTexture,
      selectedView,
    })
  }

  const setSelectedColorTexture = (colorTexture: ColorTextureCode) => {
    setSelectedColorTextureState(colorTexture)
    saveToLocalStorage({
      selectedYear,
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture: colorTexture,
      selectedView,
    })
  }

  const setSelectedView = (view: CalendarView) => {
    setSelectedViewState(view)
    saveToLocalStorage({
      selectedYear,
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture,
      selectedView: view,
    })
  }

  const value: CalendarContextType = {
    selectedYear,
    setSelectedYear,
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
