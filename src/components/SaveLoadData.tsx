import React, { useRef } from "react"
import { useCalendar } from "../contexts/CalendarContext"

const SaveLoadData: React.FC = () => {
  const {
    selectedYear,
    dateCells,
    selectedColorTexture,
    selectedView,
    setDateCells,
    setSelectedYear,
    setSelectedColorTexture,
    setSelectedView,
  } = useCalendar()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveData = () => {
    const dataToSave = {
      selectedYear,
      dateCells: Object.fromEntries(dateCells),
      selectedColorTexture,
      selectedView,
      exportDate: new Date().toISOString(),
      version: "2.0",
    }

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `year-planner-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleLoadData = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const loadedData = JSON.parse(e.target?.result as string)

        if (!loadedData || typeof loadedData !== "object") {
          alert("Invalid data file format")
          return
        }

        if (loadedData.dateCells && typeof loadedData.dateCells === "object") {
          const newDateCells = new Map(dateCells)

          Object.entries(loadedData.dateCells).forEach(([dateKey, cellData]) => {
            const existing = newDateCells.get(dateKey) || {}
            newDateCells.set(dateKey, {
              ...existing,
              ...(cellData as any),
            })
          })
          setDateCells(newDateCells)
        }

        if (loadedData.selectedYear && typeof loadedData.selectedYear === "number") {
          setSelectedYear(loadedData.selectedYear)
        }
        if (loadedData.selectedColorTexture && typeof loadedData.selectedColorTexture === "string") {
          setSelectedColorTexture(loadedData.selectedColorTexture)
        }
        if (loadedData.selectedView && ["Linear", "Classic", "Column"].includes(loadedData.selectedView)) {
          setSelectedView(loadedData.selectedView)
        }
      } catch (error) {
        alert("Error loading data: Invalid JSON format")
        console.error("Error parsing loaded data:", error)
      }
    }
    reader.readAsText(file)

    event.target.value = ""
  }

  const handleCleanAll = () => {
    if (window.confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
      setDateCells(new Map())
      setSelectedYear(new Date().getFullYear())
      setSelectedColorTexture("red")
      setSelectedView("Linear")

      localStorage.removeItem("calendar_data")
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "16px",
          marginTop: "30px",
          padding: "20px",
          borderTop: "1px solid #eee",
        }}
      >
        <button
          onClick={handleSaveData}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0056b3"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff"
          }}
        >
          Save Data...
        </button>

        <button
          onClick={handleLoadData}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1e7e34"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#28a745"
          }}
        >
          Load Data
        </button>

        <button
          onClick={handleCleanAll}
          style={{
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "bold",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#c82333"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc3545"
          }}
        >
          Clean All
        </button>

        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: "none" }} />
      </div>

      <div
        style={{
          color: "#666",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <p style={{ fontSize: "16px" }}>
          All changes on this page are saved locally in your browser. This page doesn't use any servers and works
          offline.
        </p>
        <p style={{ fontSize: "13px", paddingTop: "20px", paddingBottom: "100px" }}>
          However, some browsers may occasionally delete your local storage to "save space", so we strongly recommend
          saving them to your hard drive using the buttons above! (You can also save them to your hard drive manually
          using the buttons above.)
        </p>
      </div>
    </>
  )
}

export default SaveLoadData
