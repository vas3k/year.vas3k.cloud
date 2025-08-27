import { isToday, isWeekend } from "date-fns"
import React, { useState } from "react"
import { COLORS, ColorTextureCode, TEXTURES, UI_COLORS, WEEKEND_COLOR } from "../utils/colors"
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
  customTextOverflow?: "overflow-x" | "overflow-y" | "no-overflow"
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
  customTextOverflow = "overflow-x",
}) => {
  const dayNumber = date.getDate()
  const [isHovered, setIsHovered] = useState(false)
  const [isCreatingCustomText, setIsCreatingCustomText] = useState(false)

  const getBackgroundColor = (): string => {
    if (!isColored || !colorTextureCode || !(colorTextureCode in COLORS)) {
      if (isWeekend(date)) {
        return WEEKEND_COLOR
      }
      return isHovered ? UI_COLORS.background.quaternary : UI_COLORS.background.primary
    }

    const color = COLORS[colorTextureCode as keyof typeof COLORS]
    if (!color) return UI_COLORS.background.primary

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

  const getBaseBackgroundColor = (): string => {
    if (!isColored || !colorTextureCode || !(colorTextureCode in COLORS)) {
      if (isWeekend(date)) {
        return WEEKEND_COLOR
      }
      return UI_COLORS.background.primary
    }

    const color = COLORS[colorTextureCode as keyof typeof COLORS]
    return color || UI_COLORS.background.primary
  }

  const getTextureStyles = (): React.CSSProperties => {
    if (!isColored || !colorTextureCode || !(colorTextureCode in TEXTURES)) {
      return {}
    }

    const textureCode = colorTextureCode as keyof typeof TEXTURES
    return {
      backgroundColor: UI_COLORS.background.secondary,
      backgroundImage: TEXTURES[textureCode],
      backgroundSize: "9px 9px",
      backgroundPosition: "center 2px",
    }
  }

  const handleDayNumberClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onCustomTextChange) {
      setIsCreatingCustomText(true)
      onCustomTextChange("")
    }
  }

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

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) {
      return
    }
    setIsHovered(true)
    if (onMouseEnter) {
      onMouseEnter()
    }
  }

  return (
    <div
      className="day"
      data-colored={isColored ? "true" : "false"}
      onClick={(e) => {
        if (e.target !== e.currentTarget) {
          return
        }
        if (onClick) onClick()
      }}
      onMouseDown={(e) => {
        if (e.target !== e.currentTarget) {
          return
        }
        if (onMouseDown) onMouseDown()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={(e) => {
        if (e.target !== e.currentTarget) {
          return
        }
        if (onMouseDown) onMouseDown()
      }}
      onTouchMove={(e) => {
        if (e.target !== e.currentTarget) {
          return
        }
        if (onMouseEnter) onMouseEnter()
      }}
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
        cursor: "cell",
        transition: "background-color 0.2s ease",
        overflow: "visible",
        userSelect: "none",
        border: isToday(date) ? `2px inset ${UI_COLORS.border.inset}` : "none",
        boxSizing: "border-box",
        touchAction: "auto",
        ...getTextureStyles(),
      }}
    >
      {hasCustomText ? (
        <CustomText
          text={customText}
          onTextChange={handleCustomTextChange}
          backgroundColor={getBaseBackgroundColor()}
          hoverBackgroundColor={UI_COLORS.background.quaternary}
          overflowDirection={customTextOverflow}
        />
      ) : (
        <div
          onClick={handleDayNumberClick}
          style={{
            cursor: onCustomTextChange ? "text" : "default",
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
