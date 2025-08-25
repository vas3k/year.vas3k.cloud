import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { ALL_COLOR_TEXTURE_CODES, COLORS, ColorTextureCode, TEXTURES } from "../types/colors"

const ColorPicker: React.FC = () => {
  const { selectedColorTexture, setSelectedColorTexture } = useCalendar()

  // Helper function to get background style for a color/texture
  const getBackgroundStyle = (code: ColorTextureCode): React.CSSProperties => {
    if (code in COLORS) {
      // It's a color
      return {
        backgroundColor: COLORS[code as keyof typeof COLORS],
      }
    } else {
      // It's a texture
      return {
        backgroundColor: "#e0e0e0", // Light gray base for textures
        backgroundImage: getTextureBackgroundImage(code as keyof typeof TEXTURES),
      }
    }
  }

  // Helper function to get texture background image
  const getTextureBackgroundImage = (textureCode: keyof typeof TEXTURES): string => {
    switch (textureCode) {
      case "diagonal-stripes":
        return "repeating-linear-gradient(45deg, #ccc, #ccc 5px, transparent 5px, transparent 10px)"
      case "polka-dots":
        return "radial-gradient(circle at 1.5px 1.5px, #ccc 1.5px, transparent 1.5px)"
      case "square-net":
        return "linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)"
      default:
        return ""
    }
  }

  // Helper function to get background size for textures
  const getBackgroundSize = (code: ColorTextureCode): string => {
    if (code in COLORS) {
      return "auto"
    } else {
      switch (code) {
        case "diagonal-stripes":
          return "auto"
        case "polka-dots":
        case "square-net":
          return "6px 6px"
        default:
          return "auto"
      }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {ALL_COLOR_TEXTURE_CODES.map((code) => {
        const isSelected = selectedColorTexture === code
        const backgroundStyle = getBackgroundStyle(code)

        return (
          <button
            key={code}
            onClick={() => setSelectedColorTexture(code)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: isSelected ? "3px solid #333" : "2px solid #ccc",
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
              boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.1)",
              backgroundSize: getBackgroundSize(code),
              ...backgroundStyle,
            }}
            title={code.replace(/-/g, " ")}
          />
        )
      })}
    </div>
  )
}

export default ColorPicker
