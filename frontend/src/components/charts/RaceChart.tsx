import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RaceStat {
  race: string;
  count: number;
}

interface RaceChartProps {
  data: RaceStat[];
}

const COLORS = ['#1d335b', '#c9504c', '#ffc9c0', '#8b5a5a', '#a67a7a', '#d1d5db'];

const RaceChart = ({ data }: RaceChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data as any}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(props: any) => {
            const { race, percent } = props;
            return `${race}: ${(percent * 100).toFixed(0)}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => value.toLocaleString('pt-BR')}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RaceChart;

