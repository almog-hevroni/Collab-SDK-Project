import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

export default function AnalyticsChart({ chartData }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h3 className="font-bold text-secondary mb-6 flex items-center gap-2">
        <Activity size={20} className="text-primary" /> Room Activity (Last 7
        Days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                color: "#fff",
                borderRadius: "8px",
                border: "none",
              }}
              itemStyle={{ color: "#fff" }}
              cursor={{ fill: "#F1F5F9" }}
            />
            <Bar
              dataKey="count"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              barSize={40}
              name="Rooms Created"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
