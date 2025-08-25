import React, { useEffect, useRef, useState } from "react"

interface CustomTextProps {
  text: string
  onTextChange: (text: string) => void
  backgroundColor: string
  hoverBackgroundColor: string
}

const CustomText: React.FC<CustomTextProps> = ({ text, onTextChange, backgroundColor, hoverBackgroundColor }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(text)
  const textRef = useRef<HTMLDivElement>(null)

  // Handle text click to start editing
  const handleTextClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditText(text)
  }

  // Handle text editing
  const handleTextEdit = () => {
    const newText = textRef.current?.textContent || ""
    onTextChange(newText)
    setIsEditing(false)
  }

  // Handle key press in edit mode
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

  // Focus the text element when editing starts
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
      onBlur={handleTextEdit}
      onKeyDown={handleKeyPress}
      style={{
        fontSize: "18px",
        fontWeight: "bold",
        color: "#333",
        backgroundColor: backgroundColor,
        padding: "3px",
        borderRadius: "2px",
        cursor: isEditing ? "text" : "pointer",
        outline: "none",
        whiteSpace: "nowrap",
        overflow: "visible",
        position: "absolute",
        top: "50%",
        left: "8px", // Start from left padding of the cell
        transform: "translateY(-50%)", // Only center vertically, not horizontally
        minWidth: "100%",
        zIndex: isEditing ? 10 : 1,
        border: isEditing ? "1px solid #007bff" : "none",
        boxShadow: isEditing ? "0 0 5px rgba(0,123,255,0.3)" : "none",
        minHeight: "20px",
      }}
      onMouseEnter={(e) => {
        if (!isEditing) {
          e.currentTarget.style.backgroundColor = hoverBackgroundColor
        }
      }}
      onMouseLeave={(e) => {
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
