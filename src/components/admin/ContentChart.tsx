import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Apr", images: 1200, videos: 450, uploads: 320 },
  { month: "May", images: 1400, videos: 520, uploads: 380 },
  { month: "Jun", images: 1350, videos: 580, uploads: 420 },
  { month: "Jul", images: 1600, videos: 650, uploads: 480 },
  { month: "Aug", images: 1850, videos: 720, uploads: 550 },
  { month: "Sep", images: 2100, videos: 850, uploads: 620 },
  { month: "Oct", images: 2350, videos: 950, uploads: 710 },
  { month: "Nov", images: 2500, videos: 1080, uploads: 780 },
  { month: "Dec", images: 2800, videos: 1200, uploads: 850 },
  { month: "Jan", images: 3100, videos: 1350, uploads: 920 },
  { month: "Feb", images: 3400, videos: 1500, uploads: 1000 },
  { month: "Mar", images: 3800, videos: 1680, uploads: 1150 },
];

export function ContentChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">
          Generated Content
        </h3>
        <p className="text-sm text-muted-foreground">
          AI-generated images, videos, and user uploads
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-blue))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-blue))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVideos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-purple))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-purple))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-orange))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--chart-orange))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="images"
              stroke="hsl(var(--chart-blue))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorImages)"
            />
            <Area
              type="monotone"
              dataKey="videos"
              stroke="hsl(var(--chart-purple))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVideos)"
            />
            <Area
              type="monotone"
              dataKey="uploads"
              stroke="hsl(var(--chart-orange))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUploads)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
