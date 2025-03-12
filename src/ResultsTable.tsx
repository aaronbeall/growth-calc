import { Table } from "react-bootstrap";

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
              <td key={cellIndex}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default ResultsTable;