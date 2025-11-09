import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BirthdayStat {
  month: string;
  monthNumber?: number;
  count: number;
}

interface BirthdayChartProps {
  data: BirthdayStat[];
}

const BirthdayChart = ({ data }: BirthdayChartProps) => {
  const currentMonth = new Date().getMonth() + 1; // Mês atual (1-12)

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
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
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Aniversariantes']}
          labelStyle={{ color: '#1d335b' }}
          contentStyle={{ color: '#1d335b' }}
        />
        <Bar 
          dataKey="count" 
          fill="#ffc9c0"
          radius={[4, 4, 0, 0]}
        >
          {data.map((entry, index) => {
            const isCurrentMonth = entry.monthNumber === currentMonth;
            return (
              <Cell 
                key={`cell-${index}`} 
                fill={isCurrentMonth ? '#c9504c' : '#ffc9c0'} 
              />
            );
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BirthdayChart;

