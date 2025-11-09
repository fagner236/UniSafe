import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StateStat {
  name: string;
  count: number;
}

interface StateChartProps {
  data: StateStat[];
}

const StateChart = ({ data }: StateChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [value, 'Funcionários']} />
        <Bar dataKey="count" fill="#1d335b" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StateChart;

