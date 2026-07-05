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
      <DialogContent hideClose className="sm:max-w-md bg-white border border-[#E5E7EB] shadow-xl rounded-2xl p-0 overflow-hidden">
        <div className="bg-[#F8FAFC] p-6 border-b border-[#E5E7EB]">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 text-left">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-lg font-bold text-[#111827]">Link Analytics</DialogTitle>
                <span className="bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">Last 7 Days</span>
              </div>
              <DialogDescription className="text-xs text-[#6B7280] font-medium truncate max-w-[200px]">
                tapopen.online/{link.slug}
              </DialogDescription>
            </div>
            <div className="bg-white border border-[#E5E7EB] px-4 py-2 rounded-xl text-center shadow-sm shrink-0">
              <div className="text-xl font-black text-[#111827] leading-none mb-1">{link.clicks || 0}</div>
              <div className="text-[8px] uppercase font-bold text-[#6B7280] tracking-widest">Total Clicks</div>
            </div>
          </DialogHeader>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">
              <span>Daily Engagement</span>
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
            </div>
            
            <div className="h-[200px] w-full bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: "#9CA3AF" }}
                    dy={10}
                  />
                  <YAxis hide domain={[0, 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#111827',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    cursor={{ stroke: '#2563EB', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#2563EB" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E5E7EB] flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#111827] mb-1">Traffic Summary</h5>
              <p className="text-[11px] text-[#6B7280] leading-relaxed font-medium">
                {hasTraffic 
                  ? "Link shows active engagement over the last 7 days. Promote it more to see higher spikes!"
                  : "No clicks recorded in the last 7 days. Share your link to start seeing live traffic data."}
              </p>
            </div>
          </div>

          <Button 
            className="w-full h-11 bg-[#111827] hover:bg-black text-white rounded-xl text-xs font-bold shadow-none" 
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
