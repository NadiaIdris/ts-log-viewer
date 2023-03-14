import { LogLevel } from "./API/types";
import { TimeRange } from "./types";

export const formatDateTimeAMPM = (date: Date) => {
  // If the hours is 12, then it is 12 PM
  if (date.getHours() === 12) {
    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} PM`;
  }

  // If the hours is greater than 12, then it is PM
  if (date.getHours() > 12) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${
      date.getHours() - 12
    }:${date.getMinutes()}:${date.getSeconds()} PM`;
  }

  // If the hours is less than 12, then it is AM
  return `${date.getFullYear()}-${
    date.getMonth() + 1
  }-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} AM`;
};

export const colorForLevel = (level: LogLevel) => {
  if (level === LogLevel.Debug) {
    return "gray";
  } else if (level === LogLevel.Info) {
    return "blue";
  } else if (level === LogLevel.Warning) {
    return "orange";
  } else if (level === LogLevel.Error) {
    return "red";
  }
};

type TimeRangeInSeconds = number;

export const getTimeRangeInSec = (range: TimeRange): TimeRangeInSeconds => {
  const { LastMinute, Last5Minutes, LastHour, Last24Hours, Last7Days } =
    TimeRange;
  // Write a function that takes
  switch (range) {
    case LastMinute: {
      return 60; // 1*60
    }
    case Last5Minutes: {
      return 300; // 5*60
    }
    case LastHour: {
      return 3600; // 1*60*60
    }
    case Last24Hours: {
      return 86400; // 24*3600
    }
    case Last7Days: {
      return 604800; // 7*86400
    }
  }
};
