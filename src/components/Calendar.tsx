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
  const {
    selectedYear,
    coloredDays,
    setColoredDays,
    selectedColorTexture,
    customTexts,
    setCustomTexts,
    selectedView,
    setSelectedView,
  } = useCalendar()

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <CalendarTitle />
      <ColorPicker />
      <ViewSelector selectedView={selectedView} onViewChange={setSelectedView} />

      {selectedView === "Linear" ? (
        <LinearView
          selectedYear={selectedYear}
          coloredDays={coloredDays}
          setColoredDays={setColoredDays}
          selectedColorTexture={selectedColorTexture}
          customTexts={customTexts}
          setCustomTexts={setCustomTexts}
        />
      ) : selectedView === "Classic" ? (
        <ClassicView
          selectedYear={selectedYear}
          coloredDays={coloredDays}
          setColoredDays={setColoredDays}
          selectedColorTexture={selectedColorTexture}
          customTexts={customTexts}
          setCustomTexts={setCustomTexts}
        />
      ) : (
        <ColumnView
          selectedYear={selectedYear}
          coloredDays={coloredDays}
          setColoredDays={setColoredDays}
          selectedColorTexture={selectedColorTexture}
          customTexts={customTexts}
          setCustomTexts={setCustomTexts}
        />
      )}

      <SaveLoadData />
    </div>
  )
}

export default Calendar
