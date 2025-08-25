import "./App.css"
import Calendar from "./components/Calendar"
import { CalendarProvider } from "./contexts/CalendarContext"

function App() {
  return (
    <CalendarProvider>
      <div className="App">
        <Calendar />
      </div>
    </CalendarProvider>
  )
}

export default App
