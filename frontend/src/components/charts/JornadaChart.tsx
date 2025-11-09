import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface JornadaStat {
  jornada: string;
  count: number;
}

interface JornadaChartProps {
  data: JornadaStat[];
  highlightedJornada: string | null;
  onJornadaHover: (jornada: string | null) => void;
}

const JornadaChart = ({ data, highlightedJornada, onJornadaHover }: JornadaChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="jornada" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={100}
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
          onMouseEnter={(data: any) => onJornadaHover(data.jornada)}
          onMouseLeave={() => onJornadaHover(null)}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={highlightedJornada === entry.jornada ? '#c9504c' : '#1d335b'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default JornadaChart;

