import React from "react"
import { useCalendar } from "../contexts/CalendarContext"
import CalendarTitle from "./CalendarTitle"
import CalendarSharingControls from "./CalendarSharingControls"
import ColorPicker from "./ColorPicker"
import SaveLoadData from "./SaveLoadData"
import ClassicView from "./views/ClassicView"
import ColumnView from "./views/ColumnView"
import LinearView from "./views/LinearView"
import ViewSelector from "./ViewSelector"

const Calendar: React.FC = () => {
  const { monthRange, dateCells, setDateCells, selectedColorTexture, selectedView, setSelectedView } = useCalendar()

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <CalendarTitle />
      <div className="no-print">
        <CalendarSharingControls />
        <ColorPicker />
        <ViewSelector selectedView={selectedView} onViewChange={setSelectedView} />
      </div>

      {selectedView === "Linear" ? (
        <LinearView
          monthRange={monthRange}
          dateCells={dateCells}
          setDateCells={setDateCells}
          selectedColorTexture={selectedColorTexture}
        />
      ) : selectedView === "Classic" ? (
        <ClassicView
          monthRange={monthRange}
          dateCells={dateCells}
          setDateCells={setDateCells}
          selectedColorTexture={selectedColorTexture}
        />
      ) : (
        <ColumnView
          monthRange={monthRange}
          dateCells={dateCells}
          setDateCells={setDateCells}
          selectedColorTexture={selectedColorTexture}
        />
      )}

      <div className="no-print">
        <SaveLoadData />
      </div>
    </div>
  )
}

export default Calendar
