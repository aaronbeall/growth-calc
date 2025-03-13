import { Table } from "react-bootstrap";
import "./ResultsTable.css";

const ResultsTable = ({ data }: { data: string[][] }) => {
  if (!data.length) return null;

  const [header, ...rows] = data;

  return (
    <Table striped bordered hover responsive>
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
              <td key={cellIndex}><span className={getClassName(cell, rows[Math.max(rowIndex - 1, 0)][cellIndex])}>{cell}</span></td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const getClassName = (cell: string, prevCell: string) => {
  if (cell.startsWith("$") && prevCell) {
    const nonNumeric = /[\$,]/g;
    const num = cell.replace(nonNumeric, "");
    const prevNum = prevCell.replace(nonNumeric, "");
    return num >= prevNum ? "positive" : "negative";
  }
  return undefined;
}

export default ResultsTable;