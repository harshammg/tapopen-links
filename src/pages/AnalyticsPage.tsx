import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { chartData, sampleLinks } from "@/lib/data";

const dateRanges = ["Last 7 days", "Last 30 days", "Last 90 days"];

const platformBreakdown = [
  { name: "Instagram", clicks: 1204, color: "#E1306C" },
  { name: "YouTube", clicks: 847, color: "#FF0000" },
  { name: "Spotify", clicks: 634, color: "#1DB954" },
  { name: "Twitter", clicks: 412, color: "#1DA1F2" },
  { name: "LinkedIn", clicks: 203, color: "#0A66C2" },
];

const deviceData = [
  { name: "iOS", value: 58, color: "hsl(253 96% 67%)" },
  { name: "Android", value: 31, color: "hsl(348 96% 67%)" },
  { name: "Desktop", value: 11, color: "hsl(240 20% 30%)" },
];

const AnalyticsPage = () => {
  const [range, setRange] = useState("Last 7 days");

  const stats = [
    { label: "Total Clicks", value: "3,847" },
    { label: "Unique Visitors", value: "2,910" },
    { label: "App Open Rate", value: "83.2%", highlight: true },
    { label: "Avg. per link", value: "769" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Analytics</h1>
        <div className="flex gap-2">
          {dateRanges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${range === r ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-2xl md:text-3xl font-display font-bold ${s.highlight ? "text-success" : ""}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Line Chart */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h3 className="font-display font-semibold mb-4">Daily Clicks</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="date" stroke="hsl(242 15% 48%)" tick={{ fontSize: 11 }} />
            <YAxis stroke="hsl(242 15% 48%)" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(240 33% 8%)", border: "1px solid hsl(240 20% 15%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(252 50% 96%)" }}
            />
            <Line type="monotone" dataKey="appOpens" stroke="hsl(253 96% 67%)" strokeWidth={2} dot={false} name="App Opens" />
            <Line type="monotone" dataKey="browserFallbacks" stroke="hsl(348 96% 67%)" strokeWidth={2} dot={false} name="Browser Fallbacks" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Platform breakdown */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-display font-semibold mb-4">Platform Breakdown</h3>
          <div className="space-y-4">
            {platformBreakdown.map((p) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>{p.name}</span>
                  <span className="text-muted-foreground">{p.clicks.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.clicks / 1204) * 100}%`, backgroundColor: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device split */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-display font-semibold mb-4">Device Split</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={deviceData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {deviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {deviceData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-muted-foreground">{d.name} {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top links table */}
      <div className="bg-card border border-border rounded-lg p-6 mt-6">
        <h3 className="font-display font-semibold mb-4">Top Performing Links</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left pb-3">#</th>
                <th className="text-left pb-3">Platform</th>
                <th className="text-left pb-3">Link</th>
                <th className="text-right pb-3">Clicks</th>
                <th className="text-right pb-3">App Rate</th>
              </tr>
            </thead>
            <tbody>
              {sampleLinks.map((link, i) => (
                <tr key={link.slug} className="border-b border-border/50">
                  <td className="py-3 text-muted-foreground">{i + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <link.icon className="h-4 w-4" style={{ color: link.color }} />
                      {link.platform}
                    </div>
                  </td>
                  <td className="py-3 font-mono text-xs text-muted-foreground">{link.slug}</td>
                  <td className="py-3 text-right">{link.clicks.toLocaleString()}</td>
                  <td className="py-3 text-right text-success">{link.appOpenRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
