import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from "@/lib/AuthContext"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import LoadingOverlay from "@/components/modals/Loading"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link  } from "react-router-dom"
import {unitNames, unitRankNames, useQueryParams} from "@/lib/constants"
import {Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { AuditLog } from "@/types/modals"



export default function ViewLogsModal({open, setOpen, player}: {open: boolean; setOpen: (val: boolean) => void; player: any;}) {
    if (!player) return null;
    const { searchParams, updateParams } = useQueryParams();
    const isViewLogsOpen = searchParams.get("viewlogs") === "true";
    const { user, perms } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [logs, setLogs] = useState<any>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalRows, setTotalRows] = useState(1);
    const [search, setSearch] = useState("")
    const hasAccess = !!user && (user.adminlevel > (perms?.admin?.USER_WHITELIST ?? 99));

    const itemPerPage = 50;
    const totalPages = Math.ceil(totalRows / itemPerPage);
    const offset = itemPerPage * currentPage;
    const selectedId = player.playerid;

    useEffect(() => {
        const fetchLogs = setTimeout(async () => {
        if (!open) return null;
        if (!hasAccess) return null;
            try {
                const res = await apiFetch("GET", `/logging/GetLogs?id=${player.playerid}&search=${search}&limit=${itemPerPage}&offset=${offset}&type=${activeTab}`);
                const data = await res.json();
                if (res.ok) {
                    setLogs(data.data);
                    setTotalRows(data.totalRows);
                } else {
                    toast.error("Failed to Fetch Logs", { description: data.message ?? "API Error" });
                }
            } catch (error : any){
                setIsLoading(false);
                toast.error("Error", { description: error.message ?? "Check API status." });
            };  
        }, search.trim() ? 500 : 0);
         return () => clearTimeout(fetchLogs);
    }, [activeTab, player, search, itemPerPage, offset, open, hasAccess]);

    useEffect(() => {
        if (!isViewLogsOpen) return;
        if (hasAccess) return;

        toast.error("You don't have permission to view logs.");
        updateParams({ viewlogs: null });
    }, [isViewLogsOpen, hasAccess, updateParams]);  

    if (!hasAccess) return null;


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



    const eventFormatters: Record<string, (log: AuditLog) => string> = {
        "Rank Update": (log) => {
            const [name, valueStr] = log.details.split(" - ");
            const value = Number(valueStr);
            const unitRanks = unitRankNames[name] || {}; 
            const rankName = unitRanks[value] ?? value;
            const unitName = unitNames[name] ?? name;

            return `${unitName} → ${rankName} (${name} → ${value})`;
        },
    };
    const PlayerLink = ({id, name, hideId}: {id: string; name: string; hideId?: boolean;}) => (
        <Link to={`/players/${id}`} className="hover:underline">
            {name}
            {!hideId && (
            <span className="text-muted-foreground"> ({id})</span>
            )}
        </Link>
    );
    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-popover/90 border-border text-foreground">
        <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
            Logs: {player.name} ({player.playerid})
            </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
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
        <Input
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-3 h-8"
        />


        <TabsContent value={activeTab} className="mt-4 min-h-18.75">        
        {logs.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No logs found.
        </div>
        ) : (
            <div className="h-112.5 overflow-y-auto pr-2 custom-scrollbar rounded-md border border-white/5 bg-cover">
            {logs.map((log : AuditLog) => {
            const isIncoming = log.playerId === player.playerid;
            const isSelf = log.playerId === log.performedBy;
            const eventText = eventFormatters[log.eventType]?.(log) ?? log.details;
            const performerIsSelected = log.performedBy === selectedId;
            const targetIsSelected = log.playerId === selectedId;

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
                <p className="text-xs font-semibold text-foreground">
                    {log.eventType}
                </p>

                <p className="text-[11px] text-muted-foreground">
                    <PlayerLink
                    id={log.performedBy}
                    name={log.performedByName}
                    hideId={performerIsSelected}
                    />
                    <span className="mx-1">→</span>
                    <PlayerLink
                    id={log.playerId}
                    name={log.targetName}
                    hideId={targetIsSelected}
                    />
                </p>

                {log.details && (
                    <p className="text-[10px] font-mono uppercase tracking-tight text-muted-foreground">
                    {eventText}
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
        )}
        </TabsContent>
        <div className="flex items-center justify-between px-4 border-t border-white/5">
            <div className="text-[10px] text-foreground uppercase font-bold tracking-widest">
                Showing {totalRows === 0 ? 0 : offset + 1} to {Math.min(offset + itemPerPage, totalRows)} of {totalRows} Logs
            </div>
            
            <div className="flex gap-1">
                <button 
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center px-4 text-xs font-mono">
                    {(currentPage + 1) > totalPages ? "1" : (currentPage + 1) } / {totalPages}
                </div>

                <button 
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
        </Tabs>

        </DialogContent>
        <LoadingOverlay isVisible={isLoading} />
    </Dialog>
    )
}