import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface AgeGroupStat {
  range: string;
  count: number;
}

interface AgeGroupChartProps {
  data: AgeGroupStat[];
}

const COLORS = ['#1d335b', '#c9504c', '#4f46e5', '#059669', '#dc2626', '#ea580c'];

const AgeGroupChart = ({ data }: AgeGroupChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data as any}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, 'Funcionários']} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AgeGroupChart;

