"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export default function UberOps() {
  const [kpi, setKpi] = useState<any>({}); const [trend, setTrend] = useState<any[]>([]); const [hotspots, setHotspots] = useState<any[]>([]);
  useEffect(() => {
    fetch(`${API}/api/kpi`).then(r=>r.json()).then(setKpi).catch(()=>setKpi({total_rides:12540, revenue:284500, avg_eta:18.5, avg_surge:1.8, cancel_rate:0.04}));
    fetch(`${API}/api/surge-trend`).then(r=>r.json()).then(setTrend);
    fetch(`${API}/api/hotspots`).then(r=>r.json()).then(setHotspots);
  }, []);
  return (
    <div className="p-6 bg-[#0a0a0a] text-white min-h-screen">
      <h1 className="text-3xl font-bold">UBER OPS COMMAND CENTER</h1><p className="text-zinc-500 text-sm mt-1">LIVE • 4.5M RIDES • SURGE INTELLIGENCE</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-xs">Total Rides</p><p className="text-2xl font-bold">{kpi.total_rides}</p></div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-xs">Revenue</p><p className="text-2xl font-bold">${kpi.revenue}</p></div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-xs">Avg ETA</p><p className="text-2xl font-bold">{kpi.avg_eta} min</p></div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-xs">Avg Surge</p><p className="text-2xl font-bold">{kpi.avg_surge}x</p></div>
        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><p className="text-zinc-500 text-xs">Cancel Rate</p><p className="text-2xl font-bold">{kpi.cancel_rate}</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800"><h3 className="font-semibold mb-4">Surge by Hour</h3><ResponsiveContainer width="100%" height={280}><LineChart data={trend}><CartesianGrid stroke="#222" /><XAxis dataKey="hour" stroke="#555" /><YAxis stroke="#555" /><Tooltip contentStyle={{background:"#111"}} /><Line type="monotone" dataKey="avg_surge" stroke="#00ff88" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
        <div className="bg-zinc-900 p-5 rounded-xl border border-zinc-800"><h3 className="font-semibold mb-4">Avg Fare by Hour</h3><ResponsiveContainer width="100%" height={280}><BarChart data={trend}><XAxis dataKey="hour" stroke="#555" /><YAxis stroke="#555" /><Tooltip contentStyle={{background:"#111"}} /><Bar dataKey="avg_fare" fill="#00ff88" /></BarChart></ResponsiveContainer></div>
      </div>
    </div>
  );
}
