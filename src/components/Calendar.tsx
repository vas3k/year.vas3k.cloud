import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import CalendarTitle from "./CalendarTitle"
import ColorPicker from "./ColorPicker"
import SaveLoadData from "./SaveLoadData"
import ClassicView from "./views/ClassicView"
import ColumnView from "./views/ColumnView"
import LinearView from "./views/LinearView"
import ViewSelector from "./ViewSelector"

const Calendar: React.FC = () => {
  const { selectedYear, dateCells, setDateCells, selectedColorTexture, selectedView, setSelectedView } = useCalendar()

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <CalendarTitle />
      <ColorPicker />
      <ViewSelector selectedView={selectedView} onViewChange={setSelectedView} />

      {selectedView === "Linear" ? (
        <LinearView
          selectedYear={selectedYear}
          dateCells={dateCells}
          setDateCells={setDateCells}
          selectedColorTexture={selectedColorTexture}
        />
      ) : selectedView === "Classic" ? (
        <ClassicView
          selectedYear={selectedYear}
          dateCells={dateCells}
          setDateCells={setDateCells}
          selectedColorTexture={selectedColorTexture}
        />
      ) : (
        <ColumnView
          selectedYear={selectedYear}
          dateCells={dateCells}
          setDateCells={setDateCells}
          selectedColorTexture={selectedColorTexture}
        />
      )}

      <SaveLoadData />
    </div>
  )
}

export default Calendar
