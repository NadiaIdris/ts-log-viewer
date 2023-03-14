import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import fetchLogs from "../API/fetchLogs";
import { LogLine } from "../API/types";
import { TimeRange } from "../types";
import { colorForLevel, formatDateTimeAMPM, getTimeRangeInSec } from "../utils";
import { VariableSizeList as List } from "react-window";
// import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: LogLine[];
}

const Row = ({ index, style, data }: RowProps) => {
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

// TODO: use this hook to get the window size.
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({});
  useLayoutEffect(() => {
    function updateSize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return windowSize;
}

export default function LogViewer({ range }: LogViewerProps) {
  const currentTsInSec = new Date().getTime() / 1000; // We divide by 1000 to get the timestamp in seconds.
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [showNewLogsButton, setShowNewLogsButton] = useState<boolean>(false);
  let logsEndRef: MutableRefObject<null | HTMLDivElement> = useRef(null);
  const nowTsInSecRef: MutableRefObject<number> = useRef(currentTsInSec);
  type HiddenRef = HTMLDivElement | null;
  const hiddenRowRef: MutableRefObject<HiddenRef> = useRef(null);
  type ListRef = List<LogLine> | null;
  const listRef: MutableRefObject<ListRef> = useRef(null);

  function scrollToBottom() {
    logsEndRef?.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewLogsButton(false);
  }

  // Handle onScroll: https://bobbyhadz.com/blog/react-onscroll.
  function handleScroll(event: React.UIEvent<HTMLDivElement, UIEvent>) {
    const clientHeight = event.currentTarget.clientHeight;
    const scrollHeight = event.currentTarget.scrollHeight;
    // Note: don't track scrollTop in useState hook because it will return different values for scrollTop in different renders. Instead, use event.currentTarget.scrollTop.
    const scrollTop = event.currentTarget.scrollTop;
    const scrolledToBottom =
      Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
    if (scrolledToBottom) setShowNewLogsButton(false);
  }

  useEffect(() => {
    // TODO: write a function that checkes the client side cache first for the start and end timestamps.
    //  If the cache is empty, then fetch the requested data from the server. Store the fetched data in the cache.
    // Wrapped fetchLogs in an async function so that we can use await in it.
    const getLogs = async () => {
      const logs = await fetchLogs(
        nowTsInSecRef.current - getTimeRangeInSec(range),
        nowTsInSecRef.current
      );
      setLogs(logs);

      if (listRef.current !== null) listRef.current.resetAfterIndex(0, true);
      
      scrollToBottom();
    };
    getLogs();
    return () => {};
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
          if (logs[i].ts === timeStamp2MinAgo) {
            break;
          }
          updatedLogs.push(logs[i]);
        }
        updatedLogs.push(...last2MinLogs);
        setShowNewLogsButton(true);
        setLogs(updatedLogs);
      };
      // getLast2MinLogs();
      nowTsInSecRef.current = new Date().getTime() / 1000; // We divide by 1000 to get the timestamp in seconds.
    }, 5000);
    return () => clearInterval(timer);
  });

  const getItemSize = (logs: LogLine[], index: number) => {
    if (logs[index] === undefined) {
      return 30;
    }
    const { msg, ts} = logs[index];
    const formattedTs = formatDateTimeAMPM(new Date(ts * 1000));
    hiddenRowRef.current!["textContent"] = formattedTs + ": " + msg;
    const rowHeight = window
      .getComputedStyle(hiddenRowRef.current as Element)
      .getPropertyValue("height")
      .slice(0, -2);

    return Number(rowHeight);
  };

  return (
    <div className="logs" onScroll={handleScroll}>
      <AutoSizer>
        {({ height, width }) => {
          console.log("height", height);
          console.log("width", width);
          return (
            <List
              height={height}
              width={width}
              itemCount={logs.length}
              itemSize={(index) => getItemSize(logs, index)} // itemHeight in pixels
              itemData={logs}
              ref={listRef as any}
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
      <div ref={hiddenRowRef} style={{color: "rgba(255, 255, 255, 0)"}}></div>
    </div>
  );
}
