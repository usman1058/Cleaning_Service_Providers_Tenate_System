'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useCurrency } from '@/components/providers/currency-provider'

interface OverviewChartProps {
  data: {
    name: string
    total: number
  }[]
  title: string
  description?: string
  color?: string
}

export function OverviewChart({ data, title, description, color = '#10b981' }: OverviewChartProps) {
  const { convert } = useCurrency()

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-xl">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">{payload[0].payload.name}</p>
                        <p className="text-sm font-bold text-emerald-600">
                          {convert(payload[0].value as number)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={color} 
                    fillOpacity={0.8}
                    className="hover:fill-opacity-100 transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
