import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { useAuth } from "@/lib/AuthContext"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import LoadingOverlay from "@/components/modals/Loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"



export default function ViewLogsModal({open, setOpen, player}: {open: boolean; setOpen: (val: boolean) => void; player: any;}) {
    if (!player) return null;
    // const { user, perms } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [logs, setLogs] = useState<any>([]);

    const formatLogDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const isToday =
            date.toDateString() === now.toDateString();

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const isYesterday =
            date.toDateString() === yesterday.toDateString();

        if (isToday) {
            return `Today ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }

        if (isYesterday) {
            return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        }

        return date.toLocaleDateString([], {
            day: "2-digit",
            month: "short",
        }) + " " +
        date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setIsLoading(true);
                const res = await apiFetch(`/logging/GetLogs?id=${player.playerid}`);
                const data = await res.json();
                if (res.ok) {
                    setLogs(data);
                    setIsLoading(false);
                } else {
                    toast.error("Failed to Fetch Logs", { description: data.message ?? "API Error" });
                    setIsLoading(false);
                }
            } catch (error : any){
                setIsLoading(false);
                toast.error("Error", { description: error.message ?? "Check API status." });
            };  
        };
        fetchLogs();
    }, [activeTab, player]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-popover/90 border-border text-foreground">
        <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
            Logs: {player.name} ({player.playerid})
            </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid w-full grid-cols-3 bg-popover border border-white/5 h-10 p-1">
            <TabsTrigger 
            value="incoming" 
            className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-cover data-[state=active]:text-blue-500"
            >
            Incoming
            </TabsTrigger>
            <TabsTrigger 
            value="all" 
            className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-cover data-[state=active]:text-white"
            >
            All
            </TabsTrigger>
            <TabsTrigger 
            value="outgoing" 
            className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-cover data-[state=active]:text-emerald-500"
            >
            Outgoing
            </TabsTrigger>
        </TabsList>


<TabsContent value={activeTab} className="mt-4 min-h-18.75">
  <div className="h-112.5 overflow-y-auto pr-2 custom-scrollbar rounded-md border border-white/5 bg-cover">
    {logs.map((log : any) => {
      const isIncoming = log.playerId === player.playerid;
      const isSelf = log.playerId === log.performedBy;

      const badgeStyle = isSelf
        ? "border-red-500/30 text-red-500 bg-red-500/5"
        : isIncoming
        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
        : "border-blue-500/30 text-blue-400 bg-blue-500/5";

      return (
        <div
        key={log.id}
        className="flex items-start gap-3 px-3 py-2 border-b border-white/5 hover:bg-white/3 transition-colors"
        >
        <span
            className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-black uppercase ${badgeStyle}`}
        >
            {isSelf ? "Self" : isIncoming ? "In" : "Out"}
        </span>

        <div className="min-w-0 flex-1">
            <p className="text-[11px] leading-tight text-foreground">
            <span className="font-bold text-foreground">{log.performedBy}</span>{" "}
            {log.eventType.toLowerCase()}{" "}
            <span className="font-bold text-foreground">{log.playerId}</span>
            </p>

            {log.details && (
            <p className="mt-0.5 truncate text-[9px] font-mono uppercase tracking-tight text-foreground">
                {log.details}
            </p>
            )}
        </div>

        <div className="shrink-0 text-[9px] font-medium tabular-nums text-foreground">
        {formatLogDate(log.createdAt)}
        </div>
        </div>
      );
    })}
  </div>
</TabsContent>
        </Tabs>

        </DialogContent>
        <LoadingOverlay isVisible={isLoading} />
    </Dialog>
    )
}