import { useState, useEffect } from 'react'
import {Input } from "@/components/ui/input"
// import {Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {copRanks, medicRanks, ionRanks, formatDate, formatMoney} from "@/lib/constants"
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";

export default function Stats() {
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {

/*         if (!search.trim()) {
            setResults([]);
            return;
        } */

        const delayedSearch = setTimeout(async () => {
            setIsLoading(true);
            try {
                const endpoint = search.trim() 
                ? `/players/search?search=${search}` 
                : `/players?limit=15`;

                const response = await apiFetch(endpoint);
                if (!response.ok) throw new Error("Fetch failed");
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Search Failed", error);
                setResults([]); // Clear results on error
            } finally {
                setIsLoading(false);
            }
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search]);
    return (
        <div className="max-w-4xl mx-auto py-10 space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Community Stats</h1>
                <p className="text-muted-foreground">Search for a Player</p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                <CardTitle className="text-sm font-medium uppercase text-foreground">Search Database</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="flex w-full items-center space-x-2">
                    <Input 
                    placeholder="Enter Name or ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-zinc-950 border-border text-white"
                    />
                    {isLoading && (
                    <div className="absolute right-4 top-3 text-white animate-spin">
                        {/* A simple loading spinner icon or text */}
                        ...
                    </div>
                    )}
                </div>
                </CardContent>
            </Card>
        
            {/* 4. Display Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((player) => (
                <div 
                    key={player.id} 
                    onClick={() => navigate(`/stats/${player.id}`)}
                    role="button" 
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/stats/${player.id}`)}
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
        </div>
    )
}