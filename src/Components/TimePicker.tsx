import { ChangeEvent } from "react";
import { TimeRange } from "../types";

export type TimePickerProps = {
  value: TimeRange;
  setRange(newValue: TimeRange): void;
};

function getTimeRangeLabel(range: TimeRange): string {
  const { LastMinute, Last5Minutes, LastHour, Last24Hours, Last7Days } =
    TimeRange;
  switch (range) {
    case LastMinute:
      return "Last 1 minute";
    case Last5Minutes:
      return "Last 5 minutes";
    case LastHour:
      return "Last hour";
    case Last24Hours:
      return "Last 24 hours";
    case Last7Days:
      return "Last 7 days";
  }
}

function TimePicker({ value, setRange }: TimePickerProps) {
  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setRange(event.target.value as TimeRange);
  }
  return (
    <select
      style={{ display: "inline-block" }}
      value={value}
      onChange={handleChange}
    >
      {Object.values(TimeRange).map((range) => (
        <option value={range} key={range}>
          {getTimeRangeLabel(range)}
        </option>
      ))}
    </select>
  );
}

export default TimePicker;
