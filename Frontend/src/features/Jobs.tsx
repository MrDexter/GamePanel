import { useState, useEffect } from 'react'
import {Input } from "@/components/ui/input"
import { toast } from "sonner"
// import {Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {formatDate, useQueryParams} from "@/lib/constants"
import { useNavigate, Link } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import LoadingOverlay from "@/components/modals/Loading"
import { ChevronLeft, ChevronRight, ChevronDown, RefreshCw  } from "lucide-react"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { useAuth } from "@/lib/AuthContext"
import ConfirmModal from "@/components/modals/Confirm"
import type { Job } from "@/types/modals"

export default function Stats() {
    const navigate = useNavigate();
    const { user, perms } = useAuth();
    const { searchParams, updateParams } = useQueryParams();
    const [newResults, setNewResults] = useState(false);
    const [oldTotalRows, setOldTotalRows] = useState(0);
    const [maxId, setMaxId] = useState(0);
    const [pendingJobs, setPendingJobs] = useState(false);
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(1);
    const search = searchParams.get("search") ?? ""
    const currentPage = Number(searchParams.get("page") ?? 1);
    const itemPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));
    // Statuses
    const ALL_STATUSES = ["Pending","Processing","Complete","Failed","Cancelled"];
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(ALL_STATUSES);
    const statusesFromUrl = searchParams.get("statuses");

    useEffect(() => {
        if (statusesFromUrl) {
            setSelectedStatuses(statusesFromUrl.split(","));
        } else {
            setSelectedStatuses(ALL_STATUSES);
        }
    }, [statusesFromUrl]);

    const statuses = selectedStatuses.length === ALL_STATUSES.length ? "" : selectedStatuses.join(",");

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev => {
            const next = prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status];
            updateParams({
                statuses: next.length === ALL_STATUSES.length ? "" : next.join(","),
                page: 1
            });
            return next;
        });
    };
    // Confirm
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmTitle, setConfirmTitle] = useState("");
    const [confirmDescription, setConfirmDescription]= useState("");
    const [confirmFuncion, setConfirmFuncion] = useState<() => void>(() => {}); 
    const openConfirm = (title: string, description : string, action: () => void) => {
        setConfirmTitle(title);
        setConfirmDescription(description);
        setConfirmFuncion(() => action);
        setIsConfirmOpen(true);
    };

    const downloadJob = async (id : number) => {
        try {
            const res = await apiFetch("GET", `/jobs/${id}/download?direct=false`);
            if (res.ok) {
                const data = await res.json();
               window.location.href = data.url
            }
        } catch (error : any) {
            toast.error(error.message);
            console.error(error);
        }
    };

    const changeJobStatus = async (id : number, type : string) => {
        try {
            const res = await apiFetch("POST", `/jobs/${id}/${type}`)
            if (res.ok) {
                const data = await res.json();
                if (type == "duplicate") {
                    toast.success("Background Job Queued", {
                        description: `ID: ${data.jobId} - Job Duplicated`,
                        action: {
                            label: "View Jobs",
                            onClick: () => navigate("/jobs?search=" + data.jobId)
                        }
                    });
                } else {
                    toast.success(data.message);
                }
            }
        } catch (error : any) {
            toast.error(error.message);
            console.error(error);
        
        }
    }

    const fetchData = async () => {
        try {
            const response = await apiFetch("GET", `/jobs?search=${search}&limit=${itemPerPage}&offset=${offset}&statuses=${statuses}`);
            if (!response.ok) throw new Error("Fetch failed");
            const data = await response.json();
            setTotalRows(data.totalRows);
            if (oldTotalRows != 0 && data.totalRows > oldTotalRows) {
                setNewResults(true);
            };
            if (oldTotalRows === 0) {
                setOldTotalRows(data.totalRows);
            }
                const results = data.data;
            if (maxId === 0) {
                const calcMaxId = results.length > 0 ? results[0].id : 0;
                setMaxId(Number(calcMaxId));
            }
            const hasActiveJobs = results.some(
                (j: { status: string }) => j.status === "Pending" || j.status === "Processing"
            );
            setPendingJobs(hasActiveJobs);
            setResults(data.data);
            const totalPages = Math.max(1, Math.ceil(data.totalRows / itemPerPage));
            const safePage = Math.min(Math.max(currentPage, 1), totalPages);
            if (safePage !== currentPage) {
                updateParams({ page: safePage });
            }
        } catch (error) {
            console.error("Search Failed", error);
            setResults([]); // Clear results on error
            setNewResults(false);
            setTotalRows(0);
            setOldTotalRows(0);
            setMaxId(0);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            setNewResults(false);
            setMaxId(0);
            setOldTotalRows(0);
            fetchData()
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, currentPage, statuses, totalPages]);

    useEffect(() => {
        const interval = setInterval(async () => {
            fetchData();
        }, pendingJobs ? 2500 : 7500);
        return () => clearInterval(interval);
    }, [maxId, oldTotalRows, newResults, pendingJobs, search, currentPage, statuses]);
    
    
    return (
        <div className="max-w-4xl lg:max-w-7xl mx-auto py-10 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
                <p className="text-muted-foreground">Search for a job</p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-foreground">Search Database</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex w-full items-center space-x-2">
                    <Input 
                    placeholder="Enter Name, ID or Details..." 
                    value={search}
                    onChange={(e) =>  updateParams({ search: e.target.value, page: 1})}
                    className="bg-zinc-950 border-border text-white"
                    />
                </div>
{/*                 <div className="flex gap-4 items-center">
                <span className="text-xs font-bold uppercase min-w-16">
                    Include:
                </span>

                {ALL_STATUSES.map(status => (
                    <label key={status} className="flex items-center gap-1 text-xs">
                    <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => toggleStatus(status)}
                    />
                    {status}
                    </label>
                ))}
                </div> */}
                <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold uppercase min-w-16">
                    Include:
                </span>

                {ALL_STATUSES.map(status => {
                    const active = selectedStatuses.includes(status);

                    return (
                    <Button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`h-7 px-2.5 text-xs rounded-sm
                        ${active
                            ? "bg-emerald-700/40 text-foreground border-emerald-500 hover:bg-emerald-800/50"
                            : "bg-zinc-900 text-muted-foreground border-border hover:bg-zinc-800 hover:text-foreground"
                        }`}>
                        {status}
                    </Button>
                    );
                })}
                </div>
                </CardContent>
            </Card>
            {newResults == true &&(
                <Button onClick={() => {setMaxId(0); setNewResults(false); setOldTotalRows(totalRows);}}
                className="text-[9px] px-1 py-1 bg-blue-600 rounded border border-border-accent text-foreground hover:bg-blue-800">
                    Load new Results <RefreshCw className="h-4 w-4" />
                </Button>
            )}
            {/* 4. Display Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((data: Job) => {
                const payload = JSON.parse(data?.payload ?? "{}");
                const statusClass = data.status === "Complete"? "text-emerald-500": data.status === "Failed"? "text-red-500": data.status === "Processing"? "text-blue-500": "text-zinc-400";
                if (data.id > maxId && maxId != 0) {return null}
                return (
                <div
                    key={data.id}
                    role="button"
                    tabIndex={0}
                    className="p-4 bg-card border border-border rounded-lg hover:border-blue-500 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-4 border-b border-border pb-3">
                    <div>
                        <h3 className="font-bold text-lg uppercase text-foreground  leading-tight">
                        {data.type}
                        </h3>
                        <p className={`text-[10px] uppercase tracking-widest font-mono ${statusClass}`}>
                        Status: {data.status}
                        </p>
                    </div>

                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="text-[12px] px-3 py-2 bg-blue-600 rounded border border-border-accent text-foreground hover:bg-blue-800">
                            ID. {data.id} <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    
                    {/* {user?.adminlevel > 4 && ( */}
                    <DropdownMenuContent align="end" className="w-48 bg-zinc-950 border-border text-foreground">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Job Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-background" />

                        <DropdownMenuItem disabled={(data.status !== "Failed") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => openConfirm("Reset Job", "Are you sure you want to reset this job?", () => changeJobStatus(data.id, "reset"))}>
                            
                        Reset Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem disabled={(data.status !== "Pending" && data.status !== "Processing") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => openConfirm("Cancel Job", "Are you sure you want to cancel this job?", () => changeJobStatus(data.id, "cancel"))}>
                        Cancel Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem disabled={(data.status === "Processing") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => openConfirm("Duplicate Job", "Are you sure you want to duplicate this job?", () => changeJobStatus(data.id, "duplicate"))}>
                        Duplicate Job
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem disabled={(data.status !== "Pending") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => openConfirm("Toggle Priority", "Are you sure you want to toggle priority for this job?", () => changeJobStatus(data.id, "priority"))}>
                        Toggle Priority
                        </DropdownMenuItem>
                        
                    </DropdownMenuContent>
                    </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    
                        {/* Payload full width */}
                        <div className="col-span-2 flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                Payload
                            </span>

                            <div className="mt-1 flex flex-col gap-1">
                                {Object.entries(payload).map(([key, value]) => {
                                    const label = key.replace(/([A-Z])/g, " $1").toUpperCase();

                                    return (
                                        <span key={key} className="text-foreground font-mono uppercase">
                                            {label}:{" "}
                                            {key === "playerId" ? (
                                                <Link
                                                    to={`/stats/${value}`}
                                                    className="text-foreground underline hover:text-blue-400">
                                                    {String(value)}
                                                </Link>
                                            ) : (
                                                <span>{String(value)}</span>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Results left */}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                Results
                            </span>
                            <span className="text-foreground hover:text-blue-400 underline cursor-pointer opacity-0" >
                                View
                            </span>
                            <span className="text-foreground hover:text-blue-400 underline cursor-pointer" onClick={() => openConfirm("Download Job File", "Are you sure you want to download this job?", () => downloadJob(data.id))}>
                                Download
                            </span>
                        </div>

                        {/* Dates right */}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                Dates
                            </span>
                            <span className="text-foreground">
                                Updated: {formatDate(data.updatedAt, true)}
                            </span>
                            <span className="text-foreground">
                                Created: {formatDate(data.createdAt, true)}
                            </span>
                        </div>
                    </div>
                </div>
                );
            })}
            </div>
            <div className="flex items-center px-2 py-4 border-t border-white/5">
                <div className="text-[10px] text-foreground uppercase font-bold tracking-widest">
                    Showing {totalRows === 0 ? 0 : offset + 1} to {Math.min(offset + itemPerPage, totalRows)} of {totalRows} People
                </div>
                
                <div className="flex gap-1">
                    <button 
                        disabled={currentPage <= 1}
                        onClick={() => updateParams({ page: currentPage - 1})}
                        className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center px-4 text-xs font-mono">
                        {(currentPage) > totalPages ? "1" : (currentPage) } / {totalPages}
                    </div>

                    <button 
                        disabled={currentPage >= totalPages}
                        onClick={() =>  updateParams({ page: currentPage + 1 })}
                        className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <LoadingOverlay isVisible={isLoading} />
            <ConfirmModal open={isConfirmOpen} title={confirmTitle} description={confirmDescription} onConfirm={() => {confirmFuncion()}} onClose={() => setIsConfirmOpen(false)}/>
        </div>
    )
}