import { useState, useEffect } from 'react'
import {Input } from "@/components/ui/input"
import { toast } from "sonner"
// import {Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {formatDate} from "@/lib/constants"
import { useNavigate, Link } from "react-router-dom"
import { apiFetch, apiFetchPost } from "@/lib/api"
import LoadingOverlay from "@/components/modals/Loading"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { useAuth } from "@/lib/AuthContext"

export default function Stats() {
    const { user, perms } = useAuth();
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const totalPages = Math.ceil(totalRows / itemPerPage);
    const offset = itemPerPage * currentPage;
    const navigate = useNavigate();
    const [statuses, setStatuses] = useState("");

    const downloadJob = async (id : number) => {
        try {
            const res = await apiFetch(`/jobs/${id}/download?direct=false`);
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
            const res = await apiFetchPost(`/jobs/${id}/${type}`)
            if (res.ok) {
                const data = await res.json();
                if (type == "duplicate") {
                    toast.success("Background Job Queued", {
                        description: `ID: ${data.jobId} - Job Duplicated`,
                        action: {
                            label: "View Jobs",
                            onClick: () => navigate("/jobs")
                        }
                    });
                } else {
                    toast.success(data.message);
                    setStatuses("");
                }
            }
        } catch (error : any) {
            toast.success(error.message);
            console.error(error);
        
        }
    }



    useEffect(() => {
        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            try {
                const response = await apiFetch(`/jobs?search=${search}&limit=${itemPerPage}&offset=${offset}&statuses=${statuses}`);
                if (!response.ok) throw new Error("Fetch failed");
                const data = await response.json();
                setTotalRows(data.totalRows);
                setResults(data.data);
            } catch (error) {
                console.error("Search Failed", error);
                setResults([]); // Clear results on error
            } finally {
                setIsLoading(false);
            }
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, itemPerPage, offset]);
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
                <CardContent>
                <div className="flex w-full items-center space-x-2">
                    <Input 
                    placeholder="Enter Name, ID or Details..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-zinc-950 border-border text-white"
                    />
                </div>
                </CardContent>
            </Card>
        
            {/* 4. Display Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((data) => {
                const payload = JSON.parse(data?.payload ?? "{}");
                const statusClass = data.status === "Complete"? "text-emerald-500": data.status === "Failed"? "text-red-500": data.status === "Processing"? "text-blue-500": "text-zinc-400";

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
                        <Button variant="ghost" className="text-[12px] px-3 py-2 bg-blue-600 rounded border border-border-accent text-foreground">
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
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => changeJobStatus(data.id, "reset")}>
                            
                        Reset Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem disabled={(data.status !== "Incomplete" || data.status !== "Processing") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => changeJobStatus(data.id, "cancel")}>
                        Cancel Job
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem disabled={(data.status === "Processing") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => changeJobStatus(data.id, "duplicate")}>
                        Duplicate Job
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-background" />
                        
                        <DropdownMenuItem disabled={(data.status !== "Incomplete") || (user?.adminlevel || 0) < (perms?.admin?.JOB_MANAGEMENT ?? 99)} 
                        className="text-xs gap-2 cursor-pointer focus:bg-card focus:text-white" onClick={() => changeJobStatus(data.id, "priority")}>
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
                                                    className="text-foreground underline hover:text-blue-400"
                                                >
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
                            <span className="text-foreground hover:text-blue-400 underline cursor-pointer" onClick={() => downloadJob(data.id)}>
                                Download
                            </span>
                        </div>

                        {/* Dates right */}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                Dates
                            </span>
                            <span className="text-foreground">
                                Updated: {formatDate(data.updatedAt)}
                            </span>
                            <span className="text-foreground">
                                Created: {formatDate(data.createdAt)}
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
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="p-2 border border-border hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center px-4 text-xs font-mono">
                        {currentPage + 1} / {totalPages}
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
            <LoadingOverlay isVisible={isLoading} />
        </div>
    )
}