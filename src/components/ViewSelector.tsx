import React from "react"

export type CalendarView = "Linear" | "Classic"

interface ViewSelectorProps {
  selectedView: CalendarView
  onViewChange: (view: CalendarView) => void
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ selectedView, onViewChange }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      <label
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          color: "#333",
        }}
      >
        View:
      </label>
      <select
        value={selectedView}
        onChange={(e) => onViewChange(e.target.value as CalendarView)}
        style={{
          padding: "8px 12px",
          fontSize: "14px",
          border: "2px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#fff",
          cursor: "pointer",
          outline: "none",
          transition: "border-color 0.2s ease",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#007bff"
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#ccc"
        }}
      >
        <option value="Linear">Linear</option>
        <option value="Classic">Classic</option>
      </select>
    </div>
  )
}

export default ViewSelector
