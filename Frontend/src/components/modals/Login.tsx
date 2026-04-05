import { useState, useEffect } from 'react'

// Components
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button'
import { apiFetch } from "@/lib/api"
import LoadingOverlay from "@/components/modals/Loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LoginModal({open, setOpen, setUser, setIsResetPassOpen, setPerms}: { open: boolean; setOpen: (val: boolean) => void; setUser: (user: any) => void; setIsResetPassOpen: (user: any) => void; setPerms: (perms: any) => void;}) {
  const [isLoading, setIsLoading] = useState(false);
  const DEMO_ACCOUNTS = {
    admin:          { user: "Sam",  pass: "Sp!cnawqLYvC" },
    policeCommand:  { user: "Lewis", pass: "VChQ@@x^iUsi" },
    police:         { user: "Frank", pass: "cULzPUPo4iDm" },
    medic:          { user: "Sydney",  pass: "RC$vpTqyWrrY" },
    ionCommand:     { user: "Mark",    pass: "g%Yq8t5U3@Kh" },
    ion:            { user: "Harry",    pass: "NJWhbY@we#JR" },
    nobody:         { user: "Chris",    pass: "2mJe!5nB&ACp" }
};

  useEffect(() => {
    if (open) {
      setIsLoading(false); // Reset spinner
    }
  }, [open]);

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    if (username == "" || password == "") {
      return toast.error("You need to enter a Username and/or Password!");
    };
    try {
      const res = await apiFetch("POST", "/auth/login", {
        body: JSON.stringify({
          Username: username,
          Password: password,
        }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (res.ok) {
        localStorage.setItem("token", data.token);
        var decodedToken = jwtDecode<any>(data.token);
        setUser(decodedToken);
        setPerms(data.permissions);
        toast.success("Login Successful");
        setOpen(false);
        if(decodedToken.ChangePassword == "True") {
          setIsResetPassOpen(true);
          toast.info("Security Action Required", { 
              description: "Please update your temporary password." 
          });
        };
      } else {
        return toast.error("Login Failed", { description: data.message ?? "Authentication Error!" });
      };
    } catch (error: any) {
      setIsLoading(false);
      toast.error("Error", { description: error.message ?? "Check API status." });
    };
  };

  const quickLogin = async (loginData: any) => {
    setIsLoading(true);
    const username = loginData.user;
    const password = loginData.pass;

    if (username == "" || password == "") {
      return toast.error("Error with data");
    };

    const res = await apiFetch("POST", "/auth/login", {
      body: JSON.stringify({
        Username: username,
        Password: password,
      }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (res.ok) {
      localStorage.setItem("token", data.token);
      var decodedToken = jwtDecode<any>(data.token);
      setUser(decodedToken);
      setPerms(data.permissions);
      toast.success("Login Successful");
      setOpen(false);
    } else {
      return toast.error("Login Failed", { description: data.message ?? "Authentication Error!" });
    };
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-100 bg-zinc-950 border-zinc-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-white">
            User Login
          </DialogTitle>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Please enter your username and password
          </p>
        </DialogHeader>
        <div className="mt-1 pt-1 border-t border-white/5 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Testing Quick-Access
            </label>
            <select 
                className="w-full bg-zinc-950 border border-zinc-800 text-xs p-2 rounded-sm outline-none focus:border-blue-600 transition-colors cursor-pointer"
                onChange={(e) => {
                    const account = DEMO_ACCOUNTS[e.target.value as keyof typeof DEMO_ACCOUNTS];
                    if (account) {
                        quickLogin(account); 
                    }
                }}>
                <option value="">Select a Demo Role...</option>
                <option value="admin">Staff Lead</option>
                <option value="policeCommand">Police Command</option>
                <option value="police">Police AR Lead</option>
                <option value="medic">Senior Medic</option>
                <option value="ionCommand">Ion Command</option>
                <option value="ion">Ion Member</option>
                <option value="nobody">Nobody</option>
            </select>
        </div>
        <form onSubmit={handleLogin} className="space-y-6 pt-4">

          <div className="grid gap-2">
            <Label htmlFor="username" className="text-[10px] uppercase font-black text-zinc-500">
              Username
            </Label>
            <Input 
              id="username" 
              name="username"
              placeholder="Username" 
              className="bg-zinc-900 border-zinc-800 font-mono focus-visible:ring-blue-600" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase font-black text-zinc-500">
              Password
            </Label>
            <Input 
              id="password" 
              name="password"
              type="password" 
              placeholder="••••••••" 
              className="bg-zinc-900 border-zinc-800 font-mono focus-visible:ring-blue-600" 
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-[11px] h-10">
            {isLoading ? "Verifying..." : "Login"}
          </Button>
        </form>
      </DialogContent>
      <LoadingOverlay isVisible={isLoading} />
    </Dialog>
  )
}




