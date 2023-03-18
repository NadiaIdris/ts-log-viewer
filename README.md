# TS log viewer

Log viewer sample app showcasing the use of `react-window` with `react-virtualized-auto-sizer` to render large logs.

## Logs are responsive

<img src="public/videos/responsive.gif" width="800" />

## Button to scroll to the bottom of the logs

<img src="public/videos/new-logs.gif" height="500" />

## VariableSizeList

I used `VariableSizeList` to render the logs, which means that each row can have a different height based on content. I created an empty div on the bottom of the `LogViewer` component and made the text fully transparent. Then I defined `getItemHeight` function where I formatted the text the same way it would be rendered in the `Row` component and then I got the height of the hidden div. I used this height to set the height of the row in the `VariableSizeList`.

```tsx
// This is how the hidden div looks like in LogViewer.tsx
<div ref={hiddenRowRef} style={{ color: "rgba(255, 255, 255, 0)" }}></div>
```

````tsx
// LogViewer.tsx
<AutoSizer
  onResize={() => {
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
```

```
// LogViewer.tsx
// Function to get the height of each row in the list.
function getItemHeight(logs: LogLine[], index: number) {
  if (logs[index] === undefined) return 30;
  const { msg, ts } = logs[index];
  const formattedTs = formatDateTimeAMPM(new Date(ts * 1000));
  hiddenRowRef.current!["textContent"] = formattedTs + ": " + msg;
  const hiddenRowHeight = window
    .getComputedStyle(hiddenRowRef.current as Element)
    .getPropertyValue("height")
    .slice(0, -2);
  rowHeightsRef.current.push(Number(hiddenRowHeight));
  return Number(hiddenRowHeight);
}
```


## Resources

- `react-window` - https://www.npmjs.com/package/react-window (don't forget to install types as well `@types/react-window`)
- `react-virtualized-auto-sizer` - https://www.npmjs.com/package/react-virtualized-auto-sizer (don't forget to install types as well `@types/react-virtualized-auto-sizer`)
````
