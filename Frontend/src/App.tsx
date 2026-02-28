import { useState } from 'react'
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Pages
const Home = () => <div className='p-8 text-white'><h1>About Me & Career Timeline</h1></div>;
// const Stats = () => <div className='p-8 text-white'><h1>Live Stats & Search</h1></div>;
const Jobs = () => <div className='p-8 text-white'><h1>Background Worker Queue</h1></div>;


export default function App() {
  
  const [health, setHealth] = useState<any>(null);
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("https://api.decspage.com/health");
        if (!res.ok) {
          setHealth({ status: "Offline" });
          return; 
        }
        const data = await res.json();
        setHealth(data);
      } catch {
        setHealth({ status: "Offline" });
      }
    };
    checkHealth()
  }, []);

  return (
  <BrowserRouter>
    <div className='min-h-screen bg-zinc-800 text-zinc-100 font-sans selection:bg-blue-500/30'>
      
      <nav className='w-full border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50'>
        <div className='px-8 h-16 flex items-center justify-between'>

          <div className='flex items-center gap-10 text-sm font-medium uppercase tracking-wider'>
            <Link to="/" className='text-zinc-400 hover:text-white transition-colors'>Home</Link>
            <Link to="/stats" className='text-zinc-400 hover:text-white transition-colors'>Stats</Link>
            <Link to="/jobs" className='text-zinc-400 hover:text-white transition-colors'>Jobs</Link>
          </div>
          
            {/* The Health Indicator */}
            <div className="group relative flex items-center gap-3 cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 group-hover:text-white transition-colors">
              Status: {
              {
                "Healthy": "Online",
                "Unhealthy": "Error",
                "Offline": "Offline"
              }[health?.status as string] ?? "Checking..."}
              </span>
              <div className={`h-2 w-2 rounded-full ${
                health?.status === "Healthy" ? "bg-green-500 animate-pulse" : 
                health?.status === "Unhealthy" ? "bg-amber-500" : "bg-red-500"
              }`} />
              
              
              {/* The Hover Details */}
              <div className="absolute top-10 right-0 hidden group-hover:block bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-2xl z-50 min-w-[140px]">
                <p className="text-[9px] text-zinc-500 mb-2 border-b border-zinc-800 pb-1">System Health</p>
                {health?.services?.length > 0 ? (
                  health.services.map((s: any) => (
                    <div key={s.name} className="flex justify-between text-[10px] uppercase py-0.5">
                      <span className="text-zinc-400">{s.name}</span>
                      <span className={s.status === "Healthy" ? "text-green-500" : "text-red-500"}>
                        {s.status === "Healthy" ? "OK" : "ERR"}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-red-400">API Unreachable</p>
                )}
            </div>
          </div>
        </div>
      </nav>

      <main className='px-8 py-10'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/jobs" element={<Jobs />} />
        </Routes>
      </main>
    </div>
  </BrowserRouter>
  );
};

function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
      {/* Card 1: API Status */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
          System Status
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-2xl font-bold text-white">API Online</span>
        </div>
      </div>

      {/* Card 2: Worker Status */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
          Background Worker
        </h3>
        <p className="mt-2 text-2xl font-bold text-white">Idle</p>
      </div>
    </div>
  );
}
