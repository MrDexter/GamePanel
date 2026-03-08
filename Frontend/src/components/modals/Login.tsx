import { useState, useEffect } from 'react'

// Components
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { apiFetchPost } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function LoginModal({open, setOpen, setUser, setIsResetPassOpen}: { open: boolean; setOpen: (val: boolean) => void; setUser: (user: any) => void; setIsResetPassOpen: (user: any) => void;}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(false); // Reset spinner
    }
  }, [open]);

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    if (username == "" || password == "") {
      return toast.error("You need to enter a Username and/or Password!");
    };
    
    const res = await apiFetchPost("/auth/login", {
      body: JSON.stringify({
        Username: username,
        Password: password,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      localStorage.setItem("token", data.token);
      var decodedToken = jwtDecode<any>(data.token);
      setUser(decodedToken);
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
            {loading ? "Verifying..." : "Login"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}