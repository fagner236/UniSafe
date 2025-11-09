import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MembershipTimeStat {
  range: string;
  count: number;
}

interface MembershipTimeChartProps {
  data: MembershipTimeStat[];
}

const MembershipTimeChart = ({ data }: MembershipTimeChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" />
        <YAxis />
        <Tooltip formatter={(value) => [value, 'Funcionários']} />
        <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MembershipTimeChart;

