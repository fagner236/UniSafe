import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RaceStat {
  race: string;
  count: number;
}

interface RaceBarChartProps {
  data: RaceStat[];
}

const RaceBarChart = ({ data }: RaceBarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="race" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          tickFormatter={(value) => value.toLocaleString('pt-BR')}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Funcionários']}
          labelStyle={{ color: '#1d335b' }}
        />
        <Bar 
          dataKey="count" 
          fill="#1d335b"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RaceBarChart;

