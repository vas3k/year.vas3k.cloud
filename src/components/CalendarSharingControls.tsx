import React, { useState } from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { UI_COLORS } from "../utils/colors"
import { encodeCalendarPayload } from "../utils/shareEncoding"

const CalendarSharingControls: React.FC = () => {
  const { currentCalendarId, availableCalendars, switchCalendar, getCurrentDataSnapshot, isInitialized } =
    useCalendar()
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle")

  if (!isInitialized || !currentCalendarId) {
    return null
  }

  const handleShare = async () => {
    const snapshot = getCurrentDataSnapshot()
    if (!snapshot) return

    const encoded = encodeCalendarPayload(snapshot)
    const baseUrl = `${window.location.origin}${window.location.pathname}`
    const shareUrl = `${baseUrl}?calendar=${currentCalendarId}&data=${encoded}`

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopyState("copied")
      window.setTimeout(() => setCopyState("idle"), 2500)
    } catch (error) {
      console.error("Failed to copy share link:", error)
      setCopyState("error")
      window.prompt("Copy this calendar link", shareUrl)
    }
  }

  const handleCalendarChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = event.target.value
    if (nextId && nextId !== currentCalendarId) {
      switchCalendar(nextId)
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: UI_COLORS.text.secondary,
          fontWeight: 600,
        }}
      >
        <span>Calendar</span>
        <select
          value={currentCalendarId}
          onChange={handleCalendarChange}
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: `1px solid ${UI_COLORS.border.tertiary}`,
            backgroundColor: UI_COLORS.background.tertiary,
            fontSize: "14px",
            cursor: "pointer",
            touchAction: "auto",
          }}
        >
          {availableCalendars.map((calendar) => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.label}
              {calendar.external ? " • shared" : " • local"}
            </option>
          ))}
        </select>
      </label>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={handleShare}
          style={{
            padding: "10px 18px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: UI_COLORS.button.primary.normal,
            color: UI_COLORS.text.white,
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            touchAction: "auto",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.backgroundColor = UI_COLORS.button.primary.hover
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.backgroundColor = UI_COLORS.button.primary.normal
          }}
        >
          Share calendar
        </button>
        {copyState === "copied" ? (
          <span style={{ color: UI_COLORS.text.secondary, fontSize: "13px" }}>Link copied!</span>
        ) : copyState === "error" ? (
          <span style={{ color: UI_COLORS.button.danger.normal, fontSize: "13px" }}>Copy failed, link shown in prompt.</span>
        ) : null}
      </div>
    </div>
  )
}

export default CalendarSharingControls
