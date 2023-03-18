import { MutableRefObject, useEffect, useRef, useState } from "react";
import fetchLogs from "../API/fetchLogs";
import { LogLine } from "../API/types";
import { TimeRange } from "../types";
import { colorForLevel, formatDateTimeAMPM, getTimeRangeInSec } from "../utils";
import { VariableSizeList as List } from "react-window";
// import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface RowProps {
  data: LogLine[];
  index: number;
  style: React.CSSProperties;
}
const Row = ({ data, index, style }: RowProps) => {
  const log = data[index];
  if (log === undefined) return null;
  const { msg, ts } = log;
  const formattedTs = formatDateTimeAMPM(new Date(ts * 1000));
  return (
    <div style={{ ...style, color: colorForLevel(log.level) }}>
      {formattedTs}: {msg}
    </div>
  );
};

export type LogViewerProps = {
  range: TimeRange;
};

export default function LogViewer({ range }: LogViewerProps) {
  const currentTsInSec = new Date().getTime() / 1000; // We divide by 1000 to get the timestamp in seconds.
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [showNewLogsButton, setShowNewLogsButton] = useState<boolean>(false);
  let logsEndRef: MutableRefObject<null | HTMLDivElement> = useRef(null);
  const nowTsInSecRef: MutableRefObject<number> = useRef(currentTsInSec);
  // HiddenRef helps to calculate the height of each row in the list.
  type HiddenRef = HTMLDivElement | null;
  type ListRef = List<LogLine> | null;
  const hiddenRowRef: MutableRefObject<HiddenRef> = useRef(null);
  const listRef: MutableRefObject<ListRef> = useRef(null);
  const rowHeightsRef = useRef<number[]>([]);

  // Function to get the height of each row in the list.
  function getItemHeight(logs: LogLine[], index: number) {
    if (logs[index] === undefined) return 30;
    const { msg, ts } = logs[index];
    const formattedTs = formatDateTimeAMPM(new Date(ts * 1000));
    hiddenRowRef.current!["textContent"] = formattedTs + ": " + msg;
    const rowHeight = window
      .getComputedStyle(hiddenRowRef.current as Element)
      .getPropertyValue("height")
      .slice(0, -2);
    rowHeightsRef.current.push(Number(rowHeight));
    return Number(rowHeight);
  }

  function scrollToBottom() {
    if (listRef.current !== null) listRef.current.scrollToItem(logs.length - 1);
    setShowNewLogsButton(false);
  }

  // Handle onScroll: https://bobbyhadz.com/blog/react-onscroll.
  function handleScroll({
    scrollOffset,
  }: {
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }) {
    const rowHeightsTotal = rowHeightsRef.current.reduce(
      (sum, value) => sum + value,
      0
    );
    const viewportHeight = Number(listRef.current?.props.height);
    const scrolledToBottom = scrollOffset + viewportHeight >= rowHeightsTotal;
    if (scrolledToBottom) {
      setShowNewLogsButton(false);
    }
  }

  useEffect(() => {
    const getLogs = async () => {
      const logs = await fetchLogs(
        nowTsInSecRef.current - getTimeRangeInSec(range),
        nowTsInSecRef.current
      );

      setLogs(logs);

      if (listRef.current !== null) {
        listRef.current.resetAfterIndex(0, true);
        rowHeightsRef.current = [];
      }
    };

    getLogs();
  }, [range]);

  // When LogViewer component mounts, start a interval timer to fetch for fresh data for the last 2 mins in every 30 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      const getLast2MinLogs = async () => {
        const timeStamp2MinAgo = nowTsInSecRef.current - 120;
        const last2MinLogs = await fetchLogs(
          timeStamp2MinAgo,
          nowTsInSecRef.current
        );

        const updatedLogs = [];
        for (let i = 0; i < logs.length; i++) {
          // Break the loop when we reach the now - 2 min timestamp.
          if (logs[i].ts === timeStamp2MinAgo) break;
          updatedLogs.push(logs[i]);
        }

        updatedLogs.push(...last2MinLogs);
        setShowNewLogsButton(true);
        setLogs(updatedLogs);
      };

      getLast2MinLogs();
      nowTsInSecRef.current = new Date().getTime() / 1000; // We divide by 1000 to get the timestamp in seconds.
    }, 30000);

    return () => clearInterval(timer);
  }, [logs]);

  return (
    <div className="logs">
      <AutoSizer
        onResize={({ height, width }) => {
          if (listRef.current !== null)
            listRef.current.resetAfterIndex(0, true);
        }}
      >
        {({ height, width }) => {
          return (
            <List
              height={height}
              width={width}
              itemCount={logs.length}
              itemSize={(index) => getItemHeight(logs, index)} // itemHeight in pixels
              itemData={logs}
              ref={listRef as any}
              onScroll={(args) => handleScroll(args)}
            >
              {Row}
            </List>
          );
        }}
      </AutoSizer>

      <div className="view-more-logs-button-container">
        {showNewLogsButton && (
          <button className="view-more-logs-button" onClick={scrollToBottom}>
            View new logs available
          </button>
        )}
      </div>
      <div ref={logsEndRef}></div>
      <div ref={hiddenRowRef} style={{ color: "rgba(255, 255, 255, 0)" }}></div>
    </div>
  );
}
