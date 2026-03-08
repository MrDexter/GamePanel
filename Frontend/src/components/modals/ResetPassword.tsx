import { useState, useEffect } from 'react'

// Components
import { toast } from "sonner";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { apiFetchPost } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ResetPasswordModal({open, setOpen}: { open: boolean; setOpen: (val: boolean) => void;}) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setLoading(false); // Reset spinner
    }
  }, [open]);

  const handleResetPassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password == "" || confirmPassword == "") {
      return toast.error("You need to confirm the password!");
    };

    if (password != confirmPassword) {
      return toast.error("The passwords do not match!")
    };
    
    const res = await apiFetchPost("/auth/resetPassword", {
      body: JSON.stringify({
        Password: password,
        ConfirmPassword: confirmPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success("Password Change Successful");
      setOpen(false);
      localStorage.setItem("token", data.token); // Update Token to update ChangePassword Param
    } else {
      return toast.error("Password Change Failed", { description: data.message ?? "Authentication Error!" });
    };
  };
    return (
    <Dialog open={open} onOpenChange={(isOpen) => {
    if (user?.ChangePassword === "True" && !isOpen) return;
      setOpen(isOpen);
    }}>
      <DialogContent 
      className="sm:max-w-100 bg-zinc-950 border-zinc-800 shadow-2xl" 
      onPointerDownOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-white">
            Reset Password
          </DialogTitle>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Please enter a new password
          </p>
        </DialogHeader>

        <form onSubmit={handleResetPassword} className="space-y-6 pt-4">

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

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword" className="text-[10px] uppercase font-black text-zinc-500">
              Confirm Password
            </Label>
            <Input 
              id="confirmPassword" 
              name="confirmPassword"
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