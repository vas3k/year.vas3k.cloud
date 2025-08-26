import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import { ALL_COLOR_TEXTURE_CODES, COLORS, ColorTextureCode, TEXTURES, UI_COLORS } from "../utils/colors"

const ColorPicker: React.FC = () => {
  const { selectedColorTexture, setSelectedColorTexture } = useCalendar()

  const getBackgroundStyle = (code: ColorTextureCode): React.CSSProperties => {
    if (code in COLORS) {
      // It's a color
      return {
        backgroundColor: COLORS[code as keyof typeof COLORS],
      }
    } else {
      // It's a texture
      const textureCode = code as keyof typeof TEXTURES
      return {
        backgroundColor: UI_COLORS.background.hover,
        backgroundImage: TEXTURES[textureCode],
        backgroundSize: "6px 6px",
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
              border: isSelected ? `3px solid ${UI_COLORS.border.primary}` : `2px solid ${UI_COLORS.border.secondary}`,
              cursor: "pointer",
              transition: "all 0.2s ease",
              outline: "none",
              boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.1)",
              touchAction: "auto",
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
