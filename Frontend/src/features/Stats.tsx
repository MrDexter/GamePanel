import React,  { useState, useEffect } from 'react'
import {Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {copRanks, medicRanks, ionRanks, formatDate, formatMoney, useQueryParams} from "@/lib/constants"
import { useLocation, useNavigate, Link   } from "react-router-dom"
import { apiFetch } from "@/lib/api"
import LoadingOverlay from "@/components/modals/Loading"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { GangMember } from "@/types/modals"

export default function Stats() {
    const { searchParams, updateParams } = useQueryParams();
    const search = searchParams.get("search") ?? "";
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const activeTab = searchParams.get("tab") ?? "Player";
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));
    const navigate = useNavigate();
    const location = useLocation();

    // Factions
    const groups = ["police", "ion", "nhs", "none"];   
    const [selectedFactions, setSelectedFactions] = useState<string[]>([]);
    const statusesFromUrl = searchParams.get("factions");

    useEffect(() => {
        if (statusesFromUrl) {
            setSelectedFactions(statusesFromUrl.split(",").map(s => s.toLowerCase()));
        } else {
            setSelectedFactions([]);
        }
    }, [statusesFromUrl]);

    const factions = selectedFactions.length === groups.length ? "" : selectedFactions.join(",");

    const toggleFactions = (status: string) => {
        setSelectedFactions(prev => {
            let next;
            if (prev.includes(status)) {
                next = prev.filter(s => s !== status);
            } else {
                next = [...prev, status];
            }
            updateParams({
                factions: next.length === groups.length ? "" : next.join(","),
                page: null
            });
            return next;
        });
    };
    const resetFactions = ()=> {
        setSelectedFactions([]),
        updateParams({ factions: null, page: null });
    };

    // End of Factions
    useEffect(() => {

/*         if (!search.trim()) {
            setResults([]);
            return;
        } */

        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            try {
                const endpoint = activeTab === 'Player' 
                ? `/players?limit=${itemPerPage}&offset=${offset}&search=${search}&factions=${factions}` 
                : `/groups?limit=${itemPerPage}&offset=${offset}&search=${search}`;

                const response = await apiFetch("GET", endpoint);
                if (!response.ok) throw new Error("Fetch failed");
                const data = await response.json();
                setTotalRows(data.totalRows);
                setResults(data.data);            
                const totalPages = Math.max(1, Math.ceil(data.totalRows / itemPerPage));
                const safePage = Math.min(Math.max(currentPage, 1), totalPages);
                if (safePage !== currentPage) {
                    updateParams({ page: safePage });
                }
            } catch (error) {
                console.error("Search Failed", error);
                setResults([]); // Clear results on error
            } finally {
                setIsLoading(false);
            }
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, currentPage, activeTab, factions]);
    return (
        <div className="max-w-4xl lg:max-w-7xl mx-auto py-10 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Community Search</h1>
                <p className="text-muted-foreground">Search for a {activeTab}</p>
            </div>
        <Tabs value={activeTab} className="w-full" onValueChange={(value) => updateParams({ tab: value, page: null, factions: null })}>
            <Card className="bg-card border-border">
                <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-foreground">Search Database</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex w-full items-center space-x-2 bg-background/50 ">
                    <Input 
                    placeholder="Enter Name or ID..." 
                    value={search}
                    onChange={(e) =>  updateParams({ search: e.target.value, page: 1})}
                    className="border border-border text-foreground"
                    />
                </div>
                <TabsList className="grid w-full grid-cols-2 bg-background border border-border">
                    <TabsTrigger 
                    value="Player" 
                    className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card!"
                    >
                    Players
                    </TabsTrigger>
                    <TabsTrigger 
                    value="Group" 
                    className="text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card!"
                    >
                    Groups
                    </TabsTrigger>
                </TabsList>
                {activeTab === "Player" &&(
                    <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold uppercase min-w-12">
                        Filter:
                    </span>
                    {groups.map(status => {
                        const active = selectedFactions.includes(status);
                        // const formatFaction = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

                        return (
                        <Button
                            key={status}
                            onClick={() => toggleFactions(status)}
                            className={`h-7 px-2.5 text-xs rounded-sm uppercase
                            ${active
                                ? "bg-emerald-700/40 text-foreground border-emerald-500 hover:bg-emerald-800/50"
                                : "bg-card text-muted-foreground border-border hover:bg-background hover:text-foreground"
                            }`}>
                            {status}
                        </Button>
                        );
                    })}
                    {selectedFactions.length > 0  &&(
                        <Button
                            onClick={() => resetFactions()}
                            className={`h-7 px-2.5 text-xs rounded-sm bg-card text-foreground border-border hover:bg-background hover:text-foreground`}>
                            <X className="h-3.5 w-3.5" /> RESET
                        </Button>
                    )}
                    </div>
                )}
                </CardContent>
            </Card>
            <TabsContent value={activeTab} className="mt-2 min-h-18.75"> 
            {activeTab === "Player" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((player) => (
                <div 
                    key={player.id} 
                    onClick={() => navigate(`/search/${player.id}`, {
                        state: {
                            from: location.pathname + location.search
                        }
                    })}
                    role="button" 
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/search/${player.id}`)}
                    className="p-4 bg-card border border-border rounded-lg hover:border-blue-500 transition-all cursor-pointer group">
                    {/* Header: Name and ID */}
                    <div className="flex justify-between items-start mb-4 border-b border-border pb-3">
                        <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-blue-400 leading-tight">
                            {player.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                            SteamID: {player.playerId}
                        </p>
                        </div>
                        <div className="text-[12px] px-3 py-2 bg-blue-600 rounded border border-border-accent text-foreground">
                        ID. {player.id ?? 1}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                        <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Cash</span>
                        <span className="text-foreground font-mono">{formatMoney(player.cash?.toLocaleString())}</span>
                        </div>
                        <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Bank</span>
                        <span className="text-foreground font-mono">{formatMoney(player.bankacc?.toLocaleString())}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Police</span>
                            <span className={"text-foreground"}>
                                {player.copLevel > 0 ? `${copRanks[player.copLevel]}` : "None"}
                            </span>
                            </div>
                            <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Medic</span>
                            <span className={"text-foreground"}>
                                {player.medicLevel > 0 ? `${medicRanks[player.medicLevel]}` : "None"}
                            </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Ion</span>
                            <span className={"text-foreground"}>
                                {player.ionLevel > 0 ? `${ionRanks[player.ionLevel]}` : "None"}
                            </span>
                            </div>
                            <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Staff</span>
                            <span className={"text-foreground"}>
                                {player.adminLevel > 0 ? "Yes" : "No"}
                            </span>
                            </div>
                        </div>
                        <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Last Seen</span>
                        <span className={"text-foreground"}>{formatDate(player.lastSeen)}</span>
                        </div>
                        <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Join Date</span>
                        <span className={"text-foreground"}>{formatDate(player.insertTime)}</span>
                        </div>
                    </div>
                </div>
                ))}
            </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((group) => (
                <div 
                    key={group.id} 
                    role="button" 
                    tabIndex={0}
                    className="p-4 bg-card border border-border rounded-lg hover:border-blue-500 transition-all cursor-pointer group">
                    {/* Header: Name and ID */}
                    <div className="flex justify-between items-start mb-4 border-b border-border pb-3">
                        <div>
                        <h3 className="font-bold text-lg text-foreground group-hover:text-blue-400 leading-tight">
                            {group.name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                            {group.tag != "" ? `Tag: ${group.tag}` : ""}
                        </p>
                        </div>
                        <div className="text-[12px] px-3 py-2 bg-blue-600 rounded border border-border-accent text-foreground">
                        ID. {group.id ?? 1}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-3 gap-x-6 text-sm">
                        <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                            <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Bank</span>
                            <span className="text-foreground font-mono">{formatMoney(group.bank?.toLocaleString())}</span>
                            </div>
                            {/* <div className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Leader</span>
                            <span className="text-foreground font-mono">{}</span>
                            </div> */}
                        </div>
                        {group?.members?.length > 0 ? (
                        <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Members</span>
                        <p className="text-[10px] text-muted-foreground flex flex-wrap gap-x-2">
                        {group.members.map((member : GangMember , index : number) => (
                            <React.Fragment key={member.id}>
                                <Link 
                                to={`/search/${member.id}`} 
                                className="text-[10px] font-mono text-foreground hover:text-muted-foreground hover:underline transition-colors">
                                <span>{member.rank > 4 ? member.name + "(Leader)" : member.name}{index < group.members.length - 1 && ","}</span>
                                </Link>
                            </React.Fragment>
                            ))}
                        </p>
                        </div>
                        ) : (
                        <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                            <Link 
                                to={`/search?factions=${group.name.toLowerCase()}`} 
                                className="hover:text-foreground hover:underline transition-colors">
                                View Members
                            </Link>
                        </span>
                        </div>
                        )}
                    </div>
                </div>
                ))}
            </div>
            )}
            </TabsContent>
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
                        {currentPage > totalPages ? "1" : currentPage } / {totalPages}
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
            </Tabs>
        </div>
    )
}