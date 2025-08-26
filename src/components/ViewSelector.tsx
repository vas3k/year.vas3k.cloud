import React from "react"
import { UI_COLORS } from "../utils/colors"

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
          border: `2px solid ${UI_COLORS.border.secondary}`,
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: UI_COLORS.background.secondary,
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
              backgroundColor: selectedView === view ? UI_COLORS.button.primary.normal : "transparent",
              color: selectedView === view ? UI_COLORS.text.white : UI_COLORS.text.primary,
              cursor: "pointer",
              transition: "all 0.2s ease",
              borderRight: view !== "Column" ? `1px solid ${UI_COLORS.border.secondary}` : "none",
              touchAction: "auto",
            }}
            onMouseEnter={(e) => {
              if (selectedView !== view) {
                e.currentTarget.style.backgroundColor = UI_COLORS.background.hover
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
