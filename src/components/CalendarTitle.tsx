import React from "react"
import { useCalendar } from "../contexts/CalendarContext"

const CalendarTitle: React.FC = () => {
  const { selectedYear, setSelectedYear } = useCalendar()
  const currentYear = new Date().getFullYear()

  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i)

  return (
    <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
      My plans for{" "}
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        style={{
          fontSize: "inherit",
          fontWeight: "inherit",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          padding: "0",
          borderRadius: "4px",
          touchAction: "auto",
        }}
      >
        {yearOptions.map((yearOption) => (
          <option key={yearOption} value={yearOption}>
            {yearOption}
          </option>
        ))}
      </select>
    </h1>
  )
}

export default CalendarTitle
