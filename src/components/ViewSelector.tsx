import React from "react"

export type CalendarView = "Linear" | "Classic" | "Column"

interface ViewSelectorProps {
  selectedView: CalendarView
  onViewChange: (view: CalendarView) => void
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ selectedView, onViewChange }) => {
  const views: CalendarView[] = ["Linear", "Classic", "Column"]

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          border: "2px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "#f5f5f5",
        }}
      >
        {views.map((view) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "bold",
              border: "none",
              backgroundColor: selectedView === view ? "#007bff" : "transparent",
              color: selectedView === view ? "#fff" : "#333",
              cursor: "pointer",
              transition: "all 0.2s ease",
              borderRight: view !== "Column" ? "1px solid #ccc" : "none",
              touchAction: "auto",
            }}
            onMouseEnter={(e) => {
              if (selectedView !== view) {
                e.currentTarget.style.backgroundColor = "#e0e0e0"
              }
            }}
            onMouseLeave={(e) => {
              if (selectedView !== view) {
                e.currentTarget.style.backgroundColor = "transparent"
              }
            }}
          >
            {view}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ViewSelector
