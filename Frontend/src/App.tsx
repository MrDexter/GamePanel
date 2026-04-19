import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
// Pages
import Stats from "@/features/Stats"
import StatsPlayer from "@/features/StatsPlayer"
import Breakdown from "@/features/Breakdown"
import About from "@/features/About"
import Jobs from "@/features/Jobs"
import Home from "@/features/Home"
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
import { LogIn, FileJson, ArrowLeftRight, User, UserCircle } from "lucide-react"
import { apiFetch, setLogoutHandler } from "@/lib/api"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { useQueryParams } from "@/lib/constants"
import { applyTheme, getStoredTheme, setTheme } from "@/lib/theme"


export default function App() {
  applyTheme(getStoredTheme());
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
      if (jwtToken) {
        localStorage.setItem("token", jwtToken);
        updateParams({ token: null, login: null });
      }
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
      };
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
  const jwtToken = searchParams.get("token");
  const [isResetPasswordOpen, setisResetPasswordOpen] = useState(false);
  const [isChangePasswordOpen, setisChangePasswordOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  let currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";

  const handleThemeToggle = () => {
    currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme === "dark" ? "light" : "dark");
  };

  return (
 <AuthContext.Provider value={{ user, setUser, logout: handleLogout, perms, setPerms }}>
      <div className='min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30'>
        
        <nav className='w-full border-b border-border bg-card backdrop-blur-md sticky top-0 z-50'>
          <div className='px-8 h-16 flex items-center justify-between'>

            <div className='flex items-center gap-10 text-sm font-medium uppercase tracking-wider'>
              <Link to="/" className='text-muted-foreground hover:text-foreground transition-colors'>Home</Link>
              <Link to="/search" className='text-muted-foreground hover:text-foreground transition-colors'>Search</Link>
              <Link to="/jobs" className='text-muted-foreground hover:text-foreground transition-colors'>Jobs</Link>
              <Link to="/changelog" className='text-muted-foreground hover:text-foreground transition-colors'>Changelog</Link>
              <Link to="/about" className='text-muted-foreground hover:text-foreground transition-colors'>About</Link>
              <Link to="/breakdown" className='text-muted-foreground hover:text-foreground transition-colors'>Breakdown</Link>
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
                        className="text-[10px] font-black uppercase tracking-widest text-foreground bg-background hover:text-foreground hover:bg-card transition-all">
                        <User className="mr-2 h-3 w-3" />
                        {user.steamName ?? user.Name}
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        User Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer focus:bg-background focus:text-foreground" onClick={() => handleThemeToggle()}>
                        <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
                        Toggle Theme
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer focus:bg-background focus:text-foreground" onClick={() => setisChangePasswordOpen(true)}>
                        <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
                        Change Password
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem asChild>
                        <Link 
                          to={`/search/${user.SteamID}`} 
                          className="flex w-full items-center cursor-pointer">
                          <UserCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>View Profile</span>
                        </Link>
                      </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-400" onClick={() => setIsConfirmOpen(true)}>
                        <User className="h-3.5 w-3.5" />
                        Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              ) : (
                <div>
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-[10px] font-black uppercase tracking-widest text-foreground bg-background hover:text-foreground hover:bg-card transition-all">
                        <User className="mr-2 h-3 w-3" />
                        Menu
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="w-48 bg-card border-border text-foreground">
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer focus:bg-background focus:text-foreground" onClick={() => handleThemeToggle()}>
                        <ArrowLeftRight className="h-3.5 w-3.5" />
                        Toggle Theme
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem className="text-xs gap-2 cursor-pointer focus:bg-background focus:text-foreground" onClick={() => updateParams({ login: true })}>
                        <LogIn className="h-3.5 w-3.5" />
                        Login
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              )}
              {/* The Health Indicator */} 
                <div className='group relative gap-3 flex items-center border-l border-border pl-6'>
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-foreground group-hover:text-foreground transition-colors">
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
            <Route path="/search" element={<Stats />} />
            <Route path="/search/:id" element={<StatsPlayer />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/changelog" element={<Changelog />} />
            <Route path="/about" element={<About />} />
            <Route path="/breakdown" element={<Breakdown />} />
          </Routes>
        </main>
        <Toaster
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

