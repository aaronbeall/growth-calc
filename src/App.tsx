import { useMemo, useState } from "react";
import ResultsTable from "./ResultsTable";
import { Form } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { HiChartBar, HiTable } from "react-icons/hi";
import usePersistedState from "./usePersistedState";

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
          [formatGrowth(growths[index])]: total,
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
  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const [startWith, setStartWith] = usePersistedState(2500, "start-with");
  const [growthInput, setGrowthInput] = usePersistedState("1, 2, 3, 5, -2-5, -5-8, -50-50", "growth-input");
  const [duration, setDuration] = usePersistedState(72, "duration");

  const growths = useMemo(
    () => parseGrowths(growthInput), 
    [growthInput]
  );

  const { tableData, chartData } = useMemo(
    () => generateData(startWith, growths, duration),
    [startWith, growths, duration]
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>💸 Growth Simulation</h1>
        <p className="subtitle">Analyze multiple growth scenarios over time</p>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-content">
            <h3 className="section-title">Configuration</h3>
            <Form>
              <Form.Group className="mb-4">
                <Form.Label>Starting Amount ($)</Form.Label>
                <Form.Control
                  type="number"
                  value={startWith}
                  onChange={(e) => setStartWith(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Growth Rates (%, comma separated)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={growthInput}
                  onChange={(e) => setGrowthInput(e.target.value)}
                  className="form-input"
                />
                <Form.Text className="text-muted">Example: 1, 2, 3, -2-5</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Days</Form.Label>
                <Form.Control
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                  className="form-input"
                />
              </Form.Group>
            </Form>
          </div>
        </aside>

        <main className="main-content">
          <section className="data-section">
            <div className="tab-header">
              <div className="tabs">
                <button 
                  className={`tab ${activeTab === 'chart' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chart')}
                >
                  <HiChartBar /> Chart
                </button>
                <button 
                  className={`tab ${activeTab === 'table' ? 'active' : ''}`}
                  onClick={() => setActiveTab('table')}
                >
                  <HiTable /> Table
                </button>
              </div>
            </div>

            {activeTab === 'chart' ? (
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" tick={false} />
                    <YAxis 
                      tickFormatter={formatUSD} 
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]} 
                    />
                    <Tooltip 
                      formatter={ value => formatUSD(value as number) }
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)',
                        color: 'rgba(255, 255, 255, 0.9)'
                      }}
                      labelStyle={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontWeight: 600,
                        marginBottom: '4px'
                      }}
                    />
                    <Legend />
                    {growths.map((growth, index) => (
                      <Line key={index} type="monotone" dataKey={formatGrowth(growth)} stroke={`hsl(${(index * 50) % 360}, 70%, 50%)`} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="table-container">
                <ResultsTable data={tableData} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;