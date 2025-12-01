import React from "react";

interface CSVRowProps {
  row: string[];
  roundCounter: number;
  noHeader: boolean;
  roundCount: number;
  roundFinalCount: number;
}

const CSVRow: React.FC<CSVRowProps> = ({ row, roundCounter, noHeader, roundCount, roundFinalCount }) => {
  let rowBackgroundColor = "bg-secondary-500";
  let rowTextColor = "text-foreground";
  const roundOffSet = noHeader ? -1 : 0;

  if (roundCounter === 0 && !noHeader) {
    rowTextColor = "text-secondary-900";
  } else if (roundCounter - 1 < roundCount + roundOffSet) {
    rowBackgroundColor = "bg-success-200";
  } else if (roundCounter - 1 < roundCount + roundFinalCount + roundOffSet) {
    rowBackgroundColor = "bg-primary-200";
  } else {
    rowTextColor = "text-secondary-900";
  }

  return (
    <div
      key={`csvloader-round-${roundCounter}`}
      id={`csvRow${roundCounter}`}
      className="grid grid-flow-col divide-x divide-dashed divide-secondary-900"
    >
      {row.map((col, colidx) => {
        if (col.length === 0) return null;

        return (
          <div
            id={`csvRow${roundCounter}Col${colidx}`}
            key={`csvloader-round-${roundCounter}-${colidx}`}
            className={`w-96 p-4 font-bold ${rowBackgroundColor} ${rowTextColor} border-y border-dashed border-secondary-900`}
          >
            <p className="truncate">{col}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CSVRow;
