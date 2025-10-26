'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ChartData {
  name: string;
  asks: number;
  offers: number;
}

interface OpportunityGapChartProps {
  data: ChartData[];
}

const chartConfig = {
  asks: {
    label: 'Student Asks',
    color: 'hsl(var(--chart-1))',
  },
  offers: {
    label: 'Alumni Offers',
    color: 'hsl(var(--chart-2))',
  },
};

export default function OpportunityGapChart({ data }: OpportunityGapChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
          />
          <Bar
            dataKey="asks"
            fill="var(--color-asks)"
            radius={[4, 4, 0, 0]}
            name="Student Asks"
          />
          <Bar
            dataKey="offers"
            fill="var(--color-offers)"
            radius={[4, 4, 0, 0]}
            name="Alumni Offers"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
