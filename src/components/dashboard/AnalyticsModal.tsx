import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from "@/types";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link | null;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, link }) => {
  if (!link) return null;

  // Prepare 7-day historical data
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateKey = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    return {
      name: displayDate,
      clicks: (link.clicks_daily || {})[dateKey] || 0
    };
  });

  const hasTraffic = chartData.some(d => d.clicks > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
        <div className="bg-primary/5 p-6 border-b border-border">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-xl font-display font-bold">Link Analytics</DialogTitle>
                <span className="bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">Last 7 Days</span>
              </div>
              <DialogDescription className="text-xs font-mono truncate max-w-[200px]">
                /{link.slug}
              </DialogDescription>
            </div>
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl text-center shadow-lg shadow-primary/20 shrink-0">
              <div className="text-lg font-bold leading-none">{link.clicks || 0}</div>
              <div className="text-[8px] uppercase font-bold opacity-80 tracking-widest">Total Clicks</div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
              <span>Daily Engagement</span>
              <TrendingUp className="h-3 w-3 text-success" />
            </div>
            
            <div className="h-[200px] w-full bg-muted/20 rounded-2xl p-4 border border-border/50">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-primary">Traffic Summary</h5>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {hasTraffic 
                  ? `Your link is showing active engagement over the last 7 days. Promote it more to see higher spikes!`
                  : "No clicks recorded in the last 7 days. Share your link to start seeing live traffic data."}
              </p>
            </div>
          </div>

          <Button 
            className="w-full h-12 rounded-xl font-bold shadow-md shadow-primary/10" 
            onClick={onClose}
          >
            Close Analytics
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AnalyticsModal;
