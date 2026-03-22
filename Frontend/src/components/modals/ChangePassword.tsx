import { useState, useEffect } from 'react'

// Components
import { toast } from "sonner";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from '@/components/ui/button';
import { apiFetchPost } from "@/lib/api";
import LoadingOverlay from "@/components/modals/Loading"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ChangePasswordModal({open, setOpen}: { open: boolean; setOpen: (val: boolean) => void;}) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(false); // Reset spinner
    }
  }, [open]);

  const handlePasswordChange = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const oldPassword = formData.get("oldPassword");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (oldPassword == "" || password == "" || confirmPassword == "") {
      return toast.error("You need to enter a Username and/or Password!");
    };
    setLoading(true);
    
    const res = await apiFetchPost("/auth/changePassword", {
      body: JSON.stringify({
        oldPassword: oldPassword,
        newPassword: password,
        confirmNewPassword: confirmPassword,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      toast.success("Password Change Successful");
      setOpen(false);
    } else {
      return toast.error("Password Change Failed", { description: data.message ?? "Authentication Error!" });
    };
  };
    return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-100 bg-zinc-950 border-zinc-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tighter italic text-white">
            Change Password
          </DialogTitle>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
            Please enter your old and new password
          </p>
        </DialogHeader>

        <form onSubmit={handlePasswordChange} className="space-y-6 pt-4">

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase font-black text-zinc-500">
              Old Password
            </Label>
            <Input 
              id="oldPassword" 
              name="oldPassword"
              type="password" 
              placeholder="••••••••" 
              className="bg-zinc-900 border-zinc-800 font-mono focus-visible:ring-blue-600" 
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-[10px] uppercase font-black text-zinc-500">
              New Password
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
            <Label htmlFor="password" className="text-[10px] uppercase font-black text-zinc-500">
              Confirm New Password
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
            {loading ? "Verifying..." : "Change Password"}
          </Button>
        </form>
      </DialogContent>
      <LoadingOverlay isVisible={loading} />
    </Dialog>
  )
}