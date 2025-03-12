import { useEffect, useMemo, useState } from "react";
import ResultsTable from "./ResultsTable";
import { Form, Container, Row, Col } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ChartData = any//{ date: string } & { [K in ChartGrowthKey]: number };

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const formatDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", { weekday: "short", month: "long", day: "numeric" }).format(d);

const formatPercent = (n: number) =>
  `${ ((n - 1) * 100).toFixed(0) }%`;

const formatGrowth = (g: number | [number, number]) =>
  Array.isArray(g) 
    ? `${formatPercent(g[0])} to ${formatPercent(g[1])}` 
    : `${formatPercent(g)}`


const generateData = (startWith: number, growths: (number | [number, number])[], duration: number) => {
  const totals = Array.from({ length: growths.length }, () => startWith);
  const start = new Date();
  const DAY = 1000 * 60 * 60 * 24;
  const interval = DAY;

  const tableData: string[][] = [["Date", ...growths.map(formatGrowth)]];
  const chartData: ChartData[] = [];

  for (let i = 0; i < duration; i++) {
    const date = new Date(start.getTime() + i * interval);
    if (interval === DAY && [0, 6].includes(date.getDay())) {
      tableData.push([formatDate(date), ...totals.map(() => "--")]);
      continue;
    }

    totals.forEach((_, t) => {
      totals[t] *= Array.isArray(growths[t]) 
      ? growths[t][0] + Math.random() * (growths[t][1] - growths[t][0]) 
      : growths[t];
    });

    tableData.push([formatDate(date), ...totals.map(formatUSD)]);

    chartData.push(
      totals.reduce(
        (obj, total, index) => ({
          ...obj,
          date: formatDate(date),
          [formatGrowth(growths[index])]: total.toFixed(0),
        }),
        {} as ChartData
      )
    );
  }

  return { tableData, chartData };
}

const parseGrowths = (input: string): (number | [number, number])[] => {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
       const rangeMatch = part.match(/^(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)$/);
       if (rangeMatch) {
         const min = parseFloat(rangeMatch[1]) / 100 + 1;
         const max = parseFloat(rangeMatch[2]) / 100 + 1;
         return [min, max] as [number, number];
       }
 
      return parseFloat(part) / 100 + 1;
    });
};

const App = () => {

  const [startWith, setStartWith] = useState(2500);
  const [growthInput, setGrowthInput] = useState("1, 2, 3, 5, -2-5, -5-8, -50-50");
  const [duration, setDuration] = useState(72);

  const growths = useMemo(
    () => parseGrowths(growthInput), 
    [growthInput]
  );

  const { tableData, chartData } = useMemo(
    () => generateData(startWith, growths, duration),
    [startWith, growths, duration]
  );

  return (
    <Container className="mt-4">
      <h2>Growth Simulation</h2>

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Starting Amount ($)</Form.Label>
          <Form.Control
            type="number"
            value={startWith}
            onChange={(e) => setStartWith(parseFloat(e.target.value) || 0)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Growth Rates (%, comma separated)</Form.Label>
          <Form.Control
            type="text"
            value={growthInput}
            onChange={(e) => setGrowthInput(e.target.value)}
          />
          <Form.Text className="text-muted">Example: 1, 2, 3, -2-5</Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Days</Form.Label>
          <Form.Control
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
          />
        </Form.Group>
      </Form>

      <h4>Growth Over Time</h4>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={false} />
          <YAxis tickFormatter={formatUSD} />
          <Tooltip formatter={ value => formatUSD(value as number) } />
          <Legend />
          {growths.map((growth, index) => (
            <Line key={index} type="monotone" dataKey={formatGrowth(growth)} stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>

      <h4>Data Table</h4>
      <ResultsTable data={tableData} />

    </Container>
  );
};

export default App;