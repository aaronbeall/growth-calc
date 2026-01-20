import "./ResultsTable.css";

const ResultsTable = ({ data }: { data: string[][] }) => {
  if (!data.length) return null;

  const [header, ...rows] = data;

  return (
    <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
      <table className="results-table">
        <thead>
          <tr>
            {header.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  <span className={getClassName(cell, rows[Math.max(rowIndex - 1, 0)][cellIndex])}>
                    {cell}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getClassName = (cell: string, prevCell: string) => {
  if (cell === "--") {
    return "neutral";
  }
  if (cell.startsWith("$") && prevCell && prevCell.startsWith("$")) {
    const nonNumeric = /[\$,]/g;
    const num = cell.replace(nonNumeric, "");
    const prevNum = prevCell.replace(nonNumeric, "");
    return num >= prevNum ? "positive" : "negative";
  }
  return undefined;
}

export default ResultsTable;