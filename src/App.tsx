import { useState } from "react";
import "./App.css";
import LogViewer from "./Components/LogViewer";
import TimePicker from "./Components/TimePicker";
import { TimeRange } from "./types";

export default function App() {
  const [range, setRange] = useState<TimeRange>(TimeRange.Last5Minutes);

  return (
    <div className="app">
      <div className="time-range-container">
        <h1>LogViewer</h1>
        <div className="select-timepicker">
          <TimePicker value={range} setRange={setRange} />
        </div>
      </div>
      <LogViewer range={range} />
    </div>
  );
}

