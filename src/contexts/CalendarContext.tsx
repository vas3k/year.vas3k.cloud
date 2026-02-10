import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { ColorTextureCode, DateCellData } from "../utils/colors"
import { createDefaultMonthRange, ensureValidRange, MonthRange, isValidMonthPointer } from "../utils/monthRange"
import { decodeCalendarPayload } from "../utils/shareEncoding"

export type CalendarView = "Linear" | "Classic" | "Column"

export interface StoredData {
  monthRange: MonthRange
  selectedYear?: number
  dateCells: Record<string, DateCellData>
  selectedColorTexture: ColorTextureCode
  selectedView: CalendarView
  version?: string
}

interface CalendarEntry {
  id: string
  data: StoredData
  external: boolean
  lastUpdated: string
}

interface CalendarRegistry {
  currentId: string
  localId: string
  calendars: Record<string, CalendarEntry>
}

export interface CalendarSummary {
  id: string
  label: string
  external: boolean
  lastUpdated: string
  isCurrent: boolean
}

interface CalendarContextType {
  monthRange: MonthRange
  setMonthRange: (range: MonthRange) => void
  dateCells: Map<string, DateCellData>
  setDateCells: (dateCells: Map<string, DateCellData>) => void
  selectedColorTexture: ColorTextureCode
  setSelectedColorTexture: (colorTexture: ColorTextureCode) => void
  selectedView: CalendarView
  setSelectedView: (view: CalendarView) => void
  currentCalendarId: string | null
  availableCalendars: CalendarSummary[]
  switchCalendar: (calendarId: string) => void
  isInitialized: boolean
  getCurrentDataSnapshot: () => StoredData | null
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

const STORAGE_KEY = "calendar_data"
const REGISTRY_STORAGE_KEY = "calendar_registry"
const STORAGE_VERSION = "3.0"

const generateCalendarId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12)
  }
  return Math.random().toString(36).slice(2, 14)
}

const normalizeStoredData = (data: Partial<StoredData> | null | undefined, fallbackYear: number): StoredData => {
  const defaultRange = createDefaultMonthRange(fallbackYear)
  let monthRange = defaultRange

  if (data?.monthRange && data.monthRange.start && data.monthRange.end) {
    const { start, end } = data.monthRange
    if (isValidMonthPointer(start) && isValidMonthPointer(end)) {
      monthRange = ensureValidRange(data.monthRange)
    }
  } else if (typeof data?.selectedYear === "number") {
    monthRange = createDefaultMonthRange(data.selectedYear)
  }

  const dateCells =
    data?.dateCells && typeof data.dateCells === "object" ? (data.dateCells as Record<string, DateCellData>) : {}

  const selectedColorTexture =
    data?.selectedColorTexture && typeof data.selectedColorTexture === "string"
      ? (data.selectedColorTexture as ColorTextureCode)
      : "red"

  const selectedView =
    data?.selectedView && ["Linear", "Classic", "Column"].includes(data.selectedView)
      ? (data.selectedView as CalendarView)
      : "Linear"

  return {
    monthRange,
    dateCells,
    selectedColorTexture,
    selectedView,
    version: STORAGE_VERSION,
  }
}

const parseLegacyStoredData = (raw: string | null, fallbackYear: number): StoredData | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return null
    return normalizeStoredData(parsed as Partial<StoredData>, fallbackYear)
  } catch (error) {
    console.error("Error parsing legacy calendar data:", error)
    return null
  }
}

const parseRegistry = (raw: string | null, fallbackYear: number): CalendarRegistry | null => {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") {
      return null
    }

    const localId = typeof parsed.localId === "string" && parsed.localId.trim() ? parsed.localId : generateCalendarId()
    const calendars: Record<string, CalendarEntry> = {}
    const nowIso = new Date().toISOString()

    if (parsed.calendars && typeof parsed.calendars === "object") {
      for (const [id, entryValue] of Object.entries(parsed.calendars as Record<string, unknown>)) {
        if (!id || typeof entryValue !== "object" || entryValue === null) continue

        const entryObject = entryValue as { data?: StoredData; external?: boolean; lastUpdated?: string }
        const normalizedData = normalizeStoredData(entryObject.data ?? (entryObject as Partial<StoredData>), fallbackYear)
        calendars[id] = {
          id,
          data: normalizedData,
          external: Boolean(entryObject.external && id !== localId),
          lastUpdated: typeof entryObject.lastUpdated === "string" ? entryObject.lastUpdated : nowIso,
        }
      }
    }

    const currentId =
      typeof parsed.currentId === "string" && parsed.currentId in calendars ? parsed.currentId : localId

    return {
      currentId,
      localId,
      calendars,
    }
  } catch (error) {
    console.error("Error parsing calendar registry:", error)
    return null
  }
}

const buildSummaries = (registry: CalendarRegistry, activeId: string): CalendarSummary[] => {
  const entries = Object.values(registry.calendars)
  entries.sort((a, b) => {
    if (a.id === registry.localId && b.id !== registry.localId) return -1
    if (a.id !== registry.localId && b.id === registry.localId) return 1
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  })

  return entries.map((entry) => ({
    id: entry.id,
    label: entry.external ? `Shared ${entry.id.slice(0, 6)}` : "My calendar",
    external: entry.external,
    lastUpdated: entry.lastUpdated,
    isCurrent: entry.id === activeId,
  }))
}

const readCalendarIdFromUrl = (): string | null => {
  if (typeof window === "undefined") return null
  try {
    const url = new URL(window.location.href)
    const calendarId = url.searchParams.get("calendar")
    return calendarId && calendarId.trim() ? calendarId : null
  } catch (error) {
    console.error("Error reading calendar id from URL:", error)
    return null
  }
}

const parseSharedCalendarFromUrl = (fallbackYear: number): { id: string; data: StoredData } | null => {
  if (typeof window === "undefined") return null

  try {
    const url = new URL(window.location.href)
    const calendarId = url.searchParams.get("calendar")
    const encodedData = url.searchParams.get("data")

    if (!calendarId || !encodedData) {
      return null
    }

    const decoded = decodeCalendarPayload(encodedData)
    if (!decoded || typeof decoded !== "object") {
      return null
    }

    const normalized = normalizeStoredData(decoded as Partial<StoredData>, fallbackYear)
    return {
      id: calendarId,
      data: normalized,
    }
  } catch (error) {
    console.error("Failed to parse shared calendar from URL:", error)
    return null
  }
}

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentYear = new Date().getFullYear()

  const [monthRange, setMonthRangeState] = useState<MonthRange>(createDefaultMonthRange(currentYear))
  const [dateCells, setDateCellsState] = useState<Map<string, DateCellData>>(new Map())
  const [selectedColorTexture, setSelectedColorTextureState] = useState<ColorTextureCode>("red")
  const [selectedView, setSelectedViewState] = useState<CalendarView>("Linear")
  const [currentCalendarId, setCurrentCalendarId] = useState<string | null>(null)
  const [availableCalendars, setAvailableCalendars] = useState<CalendarSummary[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  const registryRef = useRef<CalendarRegistry | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const fallbackYear = currentYear
    const nowIso = new Date().toISOString()
    const legacyData = parseLegacyStoredData(localStorage.getItem(STORAGE_KEY), fallbackYear)
    const storedRegistry = parseRegistry(localStorage.getItem(REGISTRY_STORAGE_KEY), fallbackYear)

    let registry = storedRegistry
    if (!registry) {
      const localId = generateCalendarId()
      const baseData = legacyData ?? normalizeStoredData(null, fallbackYear)
      registry = {
        currentId: localId,
        localId,
        calendars: {
          [localId]: {
            id: localId,
            data: baseData,
            external: false,
            lastUpdated: nowIso,
          },
        },
      }
    } else {
      if (!registry.calendars[registry.localId]) {
        const baseData = legacyData ?? normalizeStoredData(null, fallbackYear)
        registry.calendars[registry.localId] = {
          id: registry.localId,
          data: baseData,
          external: false,
          lastUpdated: nowIso,
        }
      }
    }

    const sharedCalendar = parseSharedCalendarFromUrl(fallbackYear)
    if (sharedCalendar) {
      registry.calendars[sharedCalendar.id] = {
        id: sharedCalendar.id,
        data: sharedCalendar.data,
        external: sharedCalendar.id !== registry.localId,
        lastUpdated: nowIso,
      }
      registry.currentId = sharedCalendar.id

      try {
        const url = new URL(window.location.href)
        url.searchParams.set("calendar", sharedCalendar.id)
        url.searchParams.delete("data")
        window.history.replaceState({}, "", url.toString())
      } catch (error) {
        console.error("Failed to clean shared calendar URL parameters:", error)
      }
    } else {
      const requestedId = readCalendarIdFromUrl()
      if (requestedId && registry.calendars[requestedId]) {
        registry.currentId = requestedId
      } else if (!registry.currentId || !registry.calendars[registry.currentId]) {
        registry.currentId = registry.localId
      }
    }

    registryRef.current = registry

    const activeEntry =
      registry.calendars[registry.currentId] ?? registry.calendars[registry.localId]

    const normalizedActive = normalizeStoredData(activeEntry?.data, fallbackYear)
    setMonthRangeState(normalizedActive.monthRange)
    setDateCellsState(new Map(Object.entries(normalizedActive.dateCells ?? {})))
    setSelectedColorTextureState(normalizedActive.selectedColorTexture)
    setSelectedViewState(normalizedActive.selectedView)
    setCurrentCalendarId(registry.currentId)
    setAvailableCalendars(buildSummaries(registry, registry.currentId))

    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry))
    } catch (error) {
      console.error("Error saving calendar registry to localStorage:", error)
    }

    const localEntry = registry.calendars[registry.localId]
    if (localEntry) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntry.data))
      } catch (error) {
        console.error("Error saving primary calendar data to localStorage:", error)
      }
    }

    setIsInitialized(true)
  }, [currentYear])

  const persistRegistry = (registry: CalendarRegistry, activeId: string) => {
    registryRef.current = registry
    setAvailableCalendars(buildSummaries(registry, activeId))

    try {
      localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry))
    } catch (error) {
      console.error("Error persisting calendar registry:", error)
    }

    const localEntry = registry.calendars[registry.localId]
    if (localEntry) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localEntry.data))
      } catch (error) {
        console.error("Error saving local calendar snapshot:", error)
      }
    }
  }

  useEffect(() => {
    if (!isInitialized) return
    if (!currentCalendarId) return

    const registry = registryRef.current
    if (!registry) return

    const snapshot: StoredData = {
      monthRange: ensureValidRange(monthRange),
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture,
      selectedView,
      version: STORAGE_VERSION,
    }

    const existingEntry = registry.calendars[currentCalendarId]
    const updatedEntry: CalendarEntry = {
      id: currentCalendarId,
      data: snapshot,
      external: currentCalendarId !== registry.localId ? existingEntry?.external ?? true : false,
      lastUpdated: new Date().toISOString(),
    }

    const updatedRegistry: CalendarRegistry = {
      ...registry,
      currentId: currentCalendarId,
      calendars: {
        ...registry.calendars,
        [currentCalendarId]: updatedEntry,
      },
    }

    persistRegistry(updatedRegistry, currentCalendarId)
  }, [monthRange, dateCells, selectedColorTexture, selectedView, currentCalendarId, isInitialized])

  const setMonthRange = (range: MonthRange) => {
    setMonthRangeState(ensureValidRange(range))
  }

  const setDateCells = (newDateCells: Map<string, DateCellData>) => {
    setDateCellsState(new Map(newDateCells))
  }

  const setSelectedColorTexture = (colorTexture: ColorTextureCode) => {
    setSelectedColorTextureState(colorTexture)
  }

  const setSelectedView = (view: CalendarView) => {
    setSelectedViewState(view)
  }

  const switchCalendar = (calendarId: string) => {
    const registry = registryRef.current
    if (!registry) return
    const targetEntry = registry.calendars[calendarId]
    if (!targetEntry) return

    const normalized = normalizeStoredData(targetEntry.data, monthRange.start.year)
    const nextRegistry: CalendarRegistry = {
      ...registry,
      currentId: calendarId,
    }
    registryRef.current = nextRegistry

    setMonthRangeState(normalized.monthRange)
    setDateCellsState(new Map(Object.entries(normalized.dateCells ?? {})))
    setSelectedColorTextureState(normalized.selectedColorTexture)
    setSelectedViewState(normalized.selectedView)
    setCurrentCalendarId(calendarId)
    setAvailableCalendars(buildSummaries(nextRegistry, calendarId))

    try {
      const url = new URL(window.location.href)
      url.searchParams.set("calendar", calendarId)
      url.searchParams.delete("data")
      window.history.replaceState({}, "", url.toString())
    } catch (error) {
      console.error("Failed to update calendar id in URL:", error)
    }
  }

  const getCurrentDataSnapshot = (): StoredData | null => {
    if (!currentCalendarId) return null
    return {
      monthRange: ensureValidRange(monthRange),
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture,
      selectedView,
      version: STORAGE_VERSION,
    }
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
    currentCalendarId,
    availableCalendars,
    switchCalendar,
    isInitialized,
    getCurrentDataSnapshot,
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
