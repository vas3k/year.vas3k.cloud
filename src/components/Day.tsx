import { isToday, isWeekend } from "date-fns"
import React, { useState } from "react"
import { COLORS, ColorTextureCode, TEXTURES, TEXTURE_BACKGROUND_SIZES, WEEKEND_COLOR } from "../types/colors"
import CustomText from "./CustomText"

interface DayProps {
  date: Date
  isColored?: boolean
  colorTextureCode?: ColorTextureCode
  onClick?: () => void
  onMouseDown?: () => void
  onMouseEnter?: () => void
  customText?: string
  onCustomTextChange?: (text: string) => void
}

const Day: React.FC<DayProps> = ({
  date,
  isColored = false,
  colorTextureCode,
  onClick,
  onMouseDown,
  onMouseEnter,
  customText = "",
  onCustomTextChange,
}) => {
  const dayNumber = date.getDate()
  const [isHovered, setIsHovered] = useState(false)
  const [isCreatingCustomText, setIsCreatingCustomText] = useState(false)

  // Get background color for colors (not textures)
  const getBackgroundColor = (): string => {
    if (!isColored || !colorTextureCode || !(colorTextureCode in COLORS)) {
      if (isWeekend(date)) {
        return WEEKEND_COLOR
      }
      return isHovered ? "#f0f0f0" : "#fff"
    }

    const color = COLORS[colorTextureCode as keyof typeof COLORS]
    if (!color) return "#fff"

    // Apply hover effect for colors
    if (isHovered) {
      // Parse OKLCH values and increase lightness slightly for hover
      const match = color.match(/oklch\(([^)]+)\)/)
      if (match) {
        const values = match[1].split(" ")
        if (values.length >= 3) {
          const L = parseFloat(values[0])
          const C = parseFloat(values[1])
          const H = values[2]
          const hoverL = Math.min(0.99, L * 1.01)
          const hoverC = C * 1.02
          return `oklch(${hoverL.toFixed(3)} ${hoverC.toFixed(3)} ${H})`
        }
      }
    }

    return color
  }

  // Get base background color for custom text (without hover effects)
  const getBaseBackgroundColor = (): string => {
    if (!isColored || !colorTextureCode || !(colorTextureCode in COLORS)) {
      if (isWeekend(date)) {
        return WEEKEND_COLOR
      }
      return "#fff"
    }

    const color = COLORS[colorTextureCode as keyof typeof COLORS]
    return color || "#fff"
  }

  // Get texture styles if applicable
  const getTextureStyles = (): React.CSSProperties => {
    if (!isColored || !colorTextureCode || !(colorTextureCode in TEXTURES)) {
      return {}
    }

    return {
      backgroundColor: "#f5f5f5",
      backgroundImage: TEXTURES[colorTextureCode as keyof typeof TEXTURES],
      backgroundSize: TEXTURE_BACKGROUND_SIZES[colorTextureCode as keyof typeof TEXTURE_BACKGROUND_SIZES],
    }
  }

  // Handle day number click to start custom text editing
  const handleDayNumberClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCustomTextChange) {
      setIsCreatingCustomText(true)
      onCustomTextChange("")
    }
  }

  // Handle custom text change
  const handleCustomTextChange = (text: string) => {
    if (onCustomTextChange) {
      onCustomTextChange(text)
      // If text is empty and we're creating, stop creating mode
      if (text.trim().length === 0) {
        setIsCreatingCustomText(false)
      }
    }
  }

  const hasCustomText = customText.trim().length > 0 || isCreatingCustomText

  // Handle mouse enter for both drag and hover
  const handleMouseEnter = () => {
    setIsHovered(true)
    if (onMouseEnter) {
      onMouseEnter()
    }
  }

  return (
    <div
      className="day"
      data-colored={isColored ? "true" : "false"}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "4px",
        textAlign: "center",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        fontWeight: "normal",
        backgroundColor: getBackgroundColor(),
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        overflow: "visible",
        userSelect: "none",
        border: isToday(date) ? "2px inset #000" : "none",
        boxSizing: "border-box",
        ...getTextureStyles(),
      }}
    >
      {hasCustomText ? (
        <CustomText
          text={customText}
          onTextChange={handleCustomTextChange}
          backgroundColor={getBaseBackgroundColor()}
          hoverBackgroundColor="#f0f0f0"
        />
      ) : (
        <div
          onClick={handleDayNumberClick}
          style={{
            cursor: onCustomTextChange ? "pointer" : "default",
            padding: "2px 4px",
            borderRadius: "3px",
            transition: "all 0.2s ease",
            display: "inline-block",
            pointerEvents: "auto",
            fontSize: "inherit",
            lineHeight: "1",
          }}
          onMouseEnter={(e) => {
            if (onCustomTextChange) {
              e.currentTarget.style.fontWeight = "bold"
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.7)"
            }
          }}
          onMouseLeave={(e) => {
            if (onCustomTextChange) {
              e.currentTarget.style.fontWeight = "normal"
              e.currentTarget.style.backgroundColor = "transparent"
            }
          }}
        >
          {dayNumber}
        </div>
      )}
    </div>
  )
}

export default Day
