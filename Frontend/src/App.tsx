import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
// Pages
import Stats from "@/features/Stats"
import StatsPlayer from "@/features/StatsPlayer"
import Breakdown from "@/features/Breakdown"
import Home from "@/features/Home"
import Jobs from "@/features/Jobs"
import changelogData from "@/features/changelog.json";
import LoginModal from "@/components/modals/Login"
import ChangePasswordModal from "@/components/modals/ChangePassword"
import ResetPasswordModal from "@/components/modals/ResetPassword"
import ConfirmModal from "@/components/modals/Confirm"
// Components
import { toast } from "sonner"
import { jwtDecode } from "jwt-decode"
import {Badge } from "@/components/ui/badge"
import { Button } from './components/ui/button'
import { Toaster } from "@/components/ui/sonner"
import { AuthContext } from "@/lib/AuthContext"
import { LogIn, FileJson, Trash2, User, UserCircle } from "lucide-react"
import { apiFetch, setLogoutHandler } from "@/lib/api"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { useQueryParams } from "@/lib/constants"


export default function App() {
  const [health, setHealth] = useState<any>(null);
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await apiFetch("GET", "/health");
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
    const timer = setInterval(checkHealth, 60000);
    return () => clearInterval(timer);
  }, []);

  const [user, setUser] = useState<any>(null);
  const [perms, setPerms] = useState<any>(null);
  useEffect(() => {
    const globalLogout = (silent = false) => {
      localStorage.removeItem("token");
      setUser(null);
      setPerms(null);
      if (!silent)
        toast.error("Session Expired - Please Log back in!");
    };
    setLogoutHandler(globalLogout);

    const LoginStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode<any>(token);
        setUser(decodedToken);
        try {
          var res = await apiFetch("POST", "/auth/refreshToken");
          if (!res.ok)throw new Error("Unauthorized");
          var data = await res.json();
          localStorage.setItem("token", data.token);
          const newDecodedToken = jwtDecode<any>(data.token);
          setUser(newDecodedToken);
          setPerms(data.permissions);
          if(newDecodedToken.ChangePassword == "True") {
            setisResetPasswordOpen(true);
            toast.info("Security Action Required", { 
                description: "Please update your temporary password." 
            });
          };
          console.log("Session restored via refresh token.");
        } catch (err) {
          globalLogout(true);
        };
      }
    };
    LoginStatus()
  }, []);

    const handleLogout = async (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e) e.preventDefault();
      try {
        await apiFetch("POST", "/auth/logout");
      } catch {
        console.error("Server Logout Failed clearing local session");
      } finally {
        localStorage.removeItem("token");
        setUser(null);
        setPerms(null);
        toast.success("Logout Successful");
    };
  };

  const { searchParams, updateParams } = useQueryParams();
  const isLoginOpen = searchParams.get("login") === "true";
  const [isResetPasswordOpen, setisResetPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setisChangePasswordOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
 <AuthContext.Provider value={{ user, setUser, logout: handleLogout, perms, setPerms }}>
      <div className='min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30'>
        
        <nav className='w-full border-b border-border bg-card backdrop-blur-md sticky top-0 z-50'>
          <div className='px-8 h-16 flex items-center justify-between'>

            <div className='flex items-center gap-10 text-sm font-medium uppercase tracking-wider'>
              <Link to="/" className='text-muted-foreground hover:text-white transition-colors'>Home</Link>
              <Link to="/stats" className='text-muted-foreground hover:text-white transition-colors'>Stats</Link>
              <Link to="/jobs" className='text-muted-foreground hover:text-white transition-colors'>Jobs</Link>
              <Link to="/changelog" className='text-muted-foreground hover:text-white transition-colors'>Changelog</Link>
              <Link to="/breakdown" className='text-muted-foreground hover:text-white transition-colors'>Breakdown</Link>
            </div>
            
              <div className="flex items-center gap-3 cursor-pointer">
              {/* Login Button */}
              {user ?  (
                <div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[10px] font-black uppercase tracking-widest text-foreground bg-background hover:text-white hover:bg-card transition-all">
                        <User className="mr-2 h-3 w-3" />
                        {user.Name}
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-border text-foreground">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        User Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => setisChangePasswordOpen(true)}>
                        <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
                        Change Password
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                        <Link 
                          to={`/stats/${user.SteamID}`} 
                          className="flex w-full items-center cursor-pointer">
                          <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>View Profile</span>
                        </Link>
                      </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-400" onClick={() => setIsConfirmOpen(true)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              ) : (
                <div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-[10px] font-black uppercase tracking-widest text-foreground bg-background hover:text-white hover:bg-card transition-all"
                    onClick={() => updateParams({ login: true })}>
                    <LogIn className="mr-2 h-3 w-3" />
                    Login
                  </Button>
                </div>
              )}
              {/* The Health Indicator */} 
                <div className='group relative gap-3 flex items-center border-l border-border pl-6'>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-foreground group-hover:text-white transition-colors">
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
                  <div className="absolute top-10 right-0 hidden group-hover:block bg-card border border-border p-3 rounded-lg shadow-2xl z-50 min-w-35">
                    <p className="text-[9px] text-foreground mb-2 border-b border-border pb-1">System Health</p>
                    {health?.services?.length > 0 ? (
                      health.services.map((s: any) => (
                        <div key={s.name} className="flex justify-between text-[10px] uppercase py-0.5">
                          <span className="text-foreground">{s.name}</span>
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
          </div>
        </nav>

        <main className='px-8 py-10'>
          <ChangePasswordModal open={isChangePasswordOpen} setOpen={setisChangePasswordOpen}/>
          <ResetPasswordModal open={isResetPasswordOpen} setOpen={setisResetPasswordOpen}/>
          <ConfirmModal open={isConfirmOpen} title="Logout" description="Are you sure you would like to logout?" onConfirm={() => handleLogout()} onClose={() => setIsConfirmOpen(false)}/>
          <LoginModal open={isLoginOpen} setOpen={(value) => updateParams({ login: value ? "true" : null })} setUser={setUser} setPerms={setPerms} setIsResetPassOpen={setisResetPasswordOpen}/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/stats/:id" element={<StatsPlayer />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/breakdown" element={<Breakdown />} />
          </Routes>
        </main>
        <Toaster
          theme = "dark"
          position = "top-center"
          toastOptions={{
            // className: '!bg-background !border-border !text-foreground !shadow-2xl !p-4',
            // descriptionClassName: '',
          }} 
        />
      </div>
  </AuthContext.Provider>
  );
}

// function Jobs() {
//   return (
//     <div>This page is coming soon and will host the controls and information around the background worker. Including, Pending, In Progress, Completed, Failed and Cancelled Job. 
//       With the ability to Download, Reset and Cencel Jobs. The API is ready and viewable at api.decspage.com. Have a look at Job Management</div>
//     // <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
//     //   {/* Card 1: API Status */}
//     //   <div className="bg-zinc-900 border border-border p-6 rounded-xl shadow-lg">
//     //     <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
//     //       System Status
//     //     </h3>
//     //     <div className="mt-2 flex items-center gap-2">
//     //       <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
//     //       <span className="text-2xl font-bold text-white">API Online</span>
//     //     </div>
//     //   </div>

//     //   {/* Card 2: Worker Status */}
//     //   <div className="bg-zinc-900 border border-border p-6 rounded-xl shadow-lg">
//     //     <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
//     //       Background Worker
//     //     </h3>
//     //     <p className="mt-2 text-2xl font-bold text-white">Idle</p>
//     //   </div>
//     // </div>
//   );
// }

function Changelog() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6"> {/* Added layout container */}
      <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-12">
        System Changelog
      </h1>
      
      <div className="relative"> {/* Container for the timeline line */}
        {changelogData.map((release) => (
          <div key={release.version} className="border-l-2 border-border pl-8 pb-12 last:pb-0 relative">
            {/* The Version Dot - use -left-[9px] to center it on a 2px border */}
            <div className="absolute -left-2.25 top-1 h-4 w-4 rounded-full bg-card border-2 border-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
            
            <div className="flex items-center gap-3 mb-2">
                <span className="text-[12px] font-mono text-foreground uppercase tracking-widest">{release.date}</span>
                {/* Category Badge */}
                <Badge className="bg-blue-600/10 text-blue-500 border-blue-500/20 text-[9px] h-4">
                    {release.category}
                </Badge>
            </div>

            <ul className="mt-4 space-y-3">
              {release.changes.map((change, i) => (
                <li key={i} className="text-[14px] text-foreground flex gap-3 items-start">
                  {/* Type Badge (Frontend/Backend) */}
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border uppercase mt-0.5 shrink-0
                    ${change.type === 'backend' ? 'border-emerald-500/30 text-emerald-500' : 'border-purple-500/30 text-purple-500'}`}>
                    {change.type[0]}
                  </span>
                  {change.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

