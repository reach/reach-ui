import * as React from "react";
import { useId } from "@reach/auto-id";
import cx from "clsx";

const TableContext = React.createContext({});
TableContext.displayName = "TableContext";

export function Table({
  "aria-labelledby": ariaLabelledBy,
  "aria-label": ariaLabel,
  ...props
}) {
  const generatedTableId = useId();
  const tableId = props.id || `table-${generatedTableId}`;
  const [captionId, setCaptionId] = React.useState(undefined);
  const boxRef = React.useRef(null);
  const hasAriaLabel = !!(ariaLabel || ariaLabelledBy);

  return (
    <TableContext.Provider value={{ tableId, setCaptionId, captionId }}>
      <div
        ref={boxRef}
        role="region"
        aria-label={ariaLabel}
        aria-labelledby={
          hasAriaLabel ? (ariaLabel ? undefined : ariaLabelledBy) : captionId
        }
        tabIndex={0}
        style={{
          maxWidth: "100%",
          overflow: "auto",
        }}
      >
        <table
          {...props}
          className={cx(props.className, "u-full-width")}
          id={tableId}
        />
      </div>
    </TableContext.Provider>
  );
}

export function Caption(props) {
  const {
    tableId,
    setCaptionId = () => {},
    captionId = props.id,
  } = React.useContext(TableContext);
  const generatedCaptionId = tableId ?? `caption-${tableId}`;
  React.useEffect(() => {
    setCaptionId(props.id || generatedCaptionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id, generatedCaptionId]);
  return <caption {...props} id={captionId} />;
}
