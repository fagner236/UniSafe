import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GenderStat {
  gender: string;
  count: number;
}

interface GenderChartProps {
  data: GenderStat[];
}

const GenderChart = ({ data }: GenderChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="gender" 
          tick={{ fontSize: 12 }}
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
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.gender === 'Feminino' ? '#c9504c' : '#1d335b'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default GenderChart;

