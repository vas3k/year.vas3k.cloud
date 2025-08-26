import React, { createContext, useContext, useEffect, useState } from "react"
import { ColorTextureCode } from "../utils/colors"

type CalendarView = "Linear" | "Classic" | "Column"

interface CalendarContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  coloredDays: Map<string, ColorTextureCode>
  setColoredDays: (coloredDays: Map<string, ColorTextureCode>) => void
  selectedColorTexture: ColorTextureCode
  setSelectedColorTexture: (colorTexture: ColorTextureCode) => void
  customTexts: Map<string, string>
  setCustomTexts: (customTexts: Map<string, string>) => void
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
  coloredDays: Record<string, ColorTextureCode>
  selectedColorTexture: ColorTextureCode
  customTexts: Record<string, string>
  selectedView: CalendarView
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear()

  // Initialize state with default values
  const [selectedYear, setSelectedYearState] = useState(currentYear)
  const [coloredDays, setColoredDaysState] = useState<Map<string, ColorTextureCode>>(new Map())
  const [selectedColorTexture, setSelectedColorTextureState] = useState<ColorTextureCode>("red")
  const [customTexts, setCustomTextsState] = useState<Map<string, string>>(new Map())
  const [selectedView, setSelectedViewState] = useState<CalendarView>("Linear")

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const parsedData: StoredData = JSON.parse(storedData)

        // Load selected year (validate it's reasonable)
        if (
          parsedData.selectedYear &&
          parsedData.selectedYear >= currentYear - 1 &&
          parsedData.selectedYear <= currentYear + 5
        ) {
          setSelectedYearState(parsedData.selectedYear)
        }

        // Load colored days
        if (parsedData.coloredDays) {
          const coloredDaysMap = new Map(Object.entries(parsedData.coloredDays))
          setColoredDaysState(coloredDaysMap)
        }

        // Load selected color texture
        if (parsedData.selectedColorTexture) {
          setSelectedColorTextureState(parsedData.selectedColorTexture)
        }

        // Load custom texts
        if (parsedData.customTexts) {
          const customTextsMap = new Map(Object.entries(parsedData.customTexts))
          setCustomTextsState(customTextsMap)
        }

        // Load selected view
        if (parsedData.selectedView && ["Linear", "Classic", "Column"].includes(parsedData.selectedView)) {
          setSelectedViewState(parsedData.selectedView)
        }
      }
    } catch (error) {
      console.error("Error loading calendar data from localStorage:", error)
    }
  }, [currentYear])

  // Save data to localStorage whenever state changes
  const saveToLocalStorage = (data: StoredData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving calendar data to localStorage:", error)
    }
  }

  // Wrapper functions that save to localStorage
  const setSelectedYear = (year: number) => {
    setSelectedYearState(year)
    saveToLocalStorage({
      selectedYear: year,
      coloredDays: Object.fromEntries(coloredDays),
      selectedColorTexture,
      customTexts: Object.fromEntries(customTexts),
      selectedView,
    })
  }

  const setColoredDays = (newColoredDays: Map<string, ColorTextureCode>) => {
    setColoredDaysState(newColoredDays)
    saveToLocalStorage({
      selectedYear,
      coloredDays: Object.fromEntries(newColoredDays),
      selectedColorTexture,
      customTexts: Object.fromEntries(customTexts),
      selectedView,
    })
  }

  const setSelectedColorTexture = (colorTexture: ColorTextureCode) => {
    setSelectedColorTextureState(colorTexture)
    saveToLocalStorage({
      selectedYear,
      coloredDays: Object.fromEntries(coloredDays),
      selectedColorTexture: colorTexture,
      customTexts: Object.fromEntries(customTexts),
      selectedView,
    })
  }

  const setCustomTexts = (newCustomTexts: Map<string, string>) => {
    setCustomTextsState(newCustomTexts)
    saveToLocalStorage({
      selectedYear,
      coloredDays: Object.fromEntries(coloredDays),
      selectedColorTexture,
      customTexts: Object.fromEntries(newCustomTexts),
      selectedView,
    })
  }

  const setSelectedView = (view: CalendarView) => {
    setSelectedViewState(view)
    saveToLocalStorage({
      selectedYear,
      coloredDays: Object.fromEntries(coloredDays),
      selectedColorTexture,
      customTexts: Object.fromEntries(customTexts),
      selectedView: view,
    })
  }

  const value: CalendarContextType = {
    selectedYear,
    setSelectedYear,
    coloredDays,
    setColoredDays,
    selectedColorTexture,
    setSelectedColorTexture,
    customTexts,
    setCustomTexts,
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
