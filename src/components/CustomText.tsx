import React, { useEffect, useRef, useState } from "react"
import { UI_COLORS } from "../utils/colors"

interface CustomTextProps {
  text: string
  onTextChange: (text: string) => void
  backgroundColor: string
  hoverBackgroundColor: string
  overflowDirection?: "overflow-x" | "overflow-y" | "no-overflow"
}

const CustomText: React.FC<CustomTextProps> = ({
  text,
  onTextChange,
  backgroundColor,
  hoverBackgroundColor,
  overflowDirection = "overflow-x",
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const textRef = useRef<HTMLDivElement>(null)

  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsEditing(true)
    setEditText(text)
  }

  const handleTextEdit = () => {
    const newText = textRef.current?.textContent || ""
    onTextChange(newText)
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleTextEdit()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditText(text)
      // If we're canceling empty text, remove it completely
      if (text === "") {
        onTextChange("")
      }
    }
  }

  useEffect(() => {
    if (isEditing && textRef.current) {
      textRef.current.focus()
      // Place cursor at the end
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(textRef.current)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [isEditing])

  // Update edit text when text prop changes
  useEffect(() => {
    setEditText(text)
  }, [text])

  // Start editing immediately if text is empty (new custom text)
  useEffect(() => {
    if (text === "" && !isEditing) {
      setIsEditing(true)
      setEditText("")
    }
  }, [text, isEditing])

  const getOverflowStyles = (): React.CSSProperties => {
    switch (overflowDirection) {
      case "overflow-y":
        return {
          whiteSpace: "normal",
          wordWrap: "break-word",
          wordBreak: "break-word",
          position: "absolute",
          top: "0",
          left: "0",
          minWidth: "96%",
          zIndex: isEditing ? 10 : 1,
        }
      case "no-overflow":
        return {
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          position: "absolute",
          top: "50%",
          left: "8px",
          transform: "translateY(-50%)",
          minWidth: "100%",
          zIndex: isEditing ? 10 : 1,
        }
      case "overflow-x":
      default:
        return {
          whiteSpace: "nowrap",
          overflow: "visible",
          position: "absolute",
          top: "50%",
          left: "8px",
          transform: "translateY(-50%)",
          zIndex: isEditing ? 10 : 1,
        }
    }
  }

  // Don't render anything if text is empty and not editing
  if (text === "" && !isEditing) {
    return null
  }

  return (
    <div
      ref={textRef}
      contentEditable={isEditing}
      suppressContentEditableWarning={true}
      onClick={handleTextClick}
      onBlur={(e) => {
        e.stopPropagation()
        handleTextEdit()
      }}
      onKeyDown={(e) => {
        e.stopPropagation()
        handleKeyPress(e)
      }}
      style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: UI_COLORS.text.primary,
        backgroundColor: backgroundColor,
        padding: "3px",
        borderRadius: "2px",
        cursor: isEditing ? "text" : "pointer",
        outline: "none",
        border: isEditing ? `1px solid ${UI_COLORS.button.primary.normal}` : "none",
        boxShadow: isEditing ? "0 0 5px rgba(0,123,255,0.3)" : "none",
        minHeight: "20px",
        ...getOverflowStyles(),
      }}
      onMouseEnter={(e) => {
        e.stopPropagation()
        if (!isEditing) {
          e.currentTarget.style.backgroundColor = hoverBackgroundColor
        }
      }}
      onMouseLeave={(e) => {
        e.stopPropagation()
        if (!isEditing) {
          e.currentTarget.style.backgroundColor = backgroundColor
        }
      }}
    >
      {isEditing ? editText : text}
    </div>
  )
}

export default CustomText
