import { useState, useEffect } from 'react'
import { ClipboardCopy } from "lucide-react"; //ClipboardCheck
import { useParams, useNavigate  } from "react-router-dom";
// import {Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import {Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {formatDate } from "@/lib/constants" //copRanks, medicRanks, ionRanks, formatMoney

const parseInventory = (inv: string) => {
  if (!inv || inv === '"[[],0]"') return "Empty";
  // Quick clean of the escaped quotes and messy Arma array nesting
  const cleaned = inv.replace(/\\"/g, "").replace(/[\[\]]/g, "").split(",")[0];
  return cleaned || "Empty";
};

const sideColor: Record<string, string> = {
    "civ": "bg-purple-600",
    "syn": "bg-red-600",
    "cop": "bg-blue-600"
};

const typeColor: Record<string, string> = {
    "Car": "bg-green-600",
    "Air": "bg-red-600"
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  // Add popup or notif?
};

export default function StatsPlayer() {
    const { id } = useParams();
    const [player, setPlayer] = useState<any>(null)
    const navigate = useNavigate();
    const checkInventory = (inv: string) => inv && inv !== '"[[],0]"';
    const checkVirtualInventory = (inv: string) => inv && inv !== '"[[],0]"';

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await fetch(`https://api.decspage.com/players/${id}`)
                if (!res.ok) throw new Error("Player Not Found");
                const data = await res.json();
                setPlayer(data[0])
            } catch (error) {
                console.error("Fetch Error", error);
            }
        };
        if (id) fetchPlayer();
    }, [id]);

    if (!player) return <div className='p-10 text-zinc-500'>Loading Profile...</div>;
    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
        {/* Top Row: Back Button & Status */}
        <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white">
            ← Back to Search
            </Button>
            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Last Sync: {formatDate(player.lastSeen)}
            </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl shadow-blue-900/10">
        <CardHeader className="flex flex-row items-center gap-6 border-b border-zinc-800/50 pb-8">
            {/* Big Blue ID Icon */}
            <div className="h-20 w-20 rounded-2xl bg-blue-600 flex items-center justify-center text-4xl font-black text-white">
            {player.name?.[0]}
            </div>
            <div className="space-y-1">
            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter">
                {player.name}
            </CardTitle>
            <div className="flex gap-3 text-[10px] font-mono text-zinc-500 uppercase">
                <span>UUID: {player.playerid}</span>
                <span className="text-blue-500/50">|</span>
                <span>Joined: {formatDate(player.insertTime)}</span>
            </div>
            </div>
        </CardHeader>
        <CardContent className="pt-8">
            {/* Your 4-column Grid for Cash, Bank, Cop, Medic, etc. */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* ... existing stats logic ... */}
            </div>
        </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
  
        {/* Column 1: Vehicles */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-2">Registered Vehicles</h2>
            <div className="space-y-2">
            {player.vehicles?.length > 0 ? player.vehicles.map((v: any) => (
                <div key={v.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex justify-between items-center">
                <Badge variant="outline" className="border-zinc-700 bg-blue-600 text-zinc-200 uppercase">{v.id}</Badge>

                <div className="flex-1 px-6">
                    <p className="font-bold text-white text-m uppercase">{v.class} 
                    </p>
                    <div className="flex gap-4 mt-1 items-center">
                        <div className="flex flex-col">
                        <span className="text-[12px] text-zinc-400 uppercase">Plate</span>
                        <span className="text-[14px] text-zinc-300 font-mono tracking-tighter">{v.reg}</span>
                        </div>
                        
                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                            <span className="text-[12px] text-zinc-400 uppercase">Cargo</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold ${checkInventory(v.inventory) ? "text-amber-500" : "text-zinc-500"}`}>
                                {checkInventory(v.inventory) ? "YES" : "NO"}
                                </span>
                                
                                {checkInventory(v.inventory) && (
                                <button 
                                    onClick={() => copyToClipboard(parseInventory(v.inventory))}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                    title="Copy Raw Inventory">
                                    <ClipboardCopy className="h-3 w-3" />
                                </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                        <span className="text-[12px] text-zinc-400 uppercase">Registered</span>
                        <span className="text-[14px] text-zinc-300">{formatDate(v.insertTime)}</span>
                        </div>
                    </div>
                </div>


                <div className="grid grid-rows-2 gap-2">
                    <Badge variant="outline" className={`${typeColor[v.type] ?? 'bg-blue-600'} border-zinc-700 text-zinc-100`}>{v.type}</Badge>
                    <Badge variant="outline" className={`${sideColor[v.side] ?? 'bg-zinc-800'} border-zinc-700 text-zinc-100 uppercase`}>{v.side}</Badge>
                </div>
                </div>
            )) : <p className="text-zinc-600 italic px-2">No vehicles found.</p>}
            </div>
        </div>

        {/* Column 2: Housing */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500 px-2">Properties</h2>
            <div className="space-y-2">
            {player.housing?.length > 0 ? player.housing.map((v: any) => (
                <div key={v.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex justify-between items-center">
                <Badge variant="outline" className="border-zinc-700 bg-blue-600 text-zinc-200 uppercase">{v.id}</Badge>

                <div className="flex-1 px-6">
                    <p className="font-bold text-white text-m uppercase">{v.location }
                    </p>
                    <div className="flex gap-4 mt-1 items-center">
                        <div className="flex flex-col">
                        <span className="text-[12px] text-zinc-400 uppercase">Security</span>
                        <span className="text-[14px] text-zinc-300 font-mono tracking-tighter">{v.securityLevel}</span>
                        </div>
                        
                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                            <span className="text-[12px] text-zinc-400 uppercase">Virtual</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[14px] text-zinc-300 font-mono italic" ${checkVirtualInventory(v.virtualContents) ? "text-amber-500" : "text-zinc-500"}`}>
                                        {checkVirtualInventory(v.virtualContents) ? "YES" : "NO"}
                                </span>
                                        
                                {checkInventory(v.virtualContents) && (
                                <button 
                                    onClick={() => copyToClipboard(parseInventory(v.virtualContents))}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                    title="Copy Raw Inventory">
                                    <ClipboardCopy className="h-3 w-3" />
                                </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                            <span className="text-[12px] text-zinc-400 uppercase">Physical</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[14px] text-zinc-300 font-mono italic" ${checkVirtualInventory(v.Contents) ? "text-amber-500" : "text-zinc-500"}`}>
                                        {checkVirtualInventory(v.Contents) ? "YES" : "NO"}
                                </span>
                                        
                                {checkInventory(v.Contents) && (
                                <button 
                                    onClick={() => copyToClipboard(parseInventory(v.Contents))}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                    title="Copy Raw Inventory">
                                    <ClipboardCopy className="h-3 w-3" />
                                </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                        <span className="text-[12px] text-zinc-400 uppercase">Purchased</span>
                        <span className="text-[14px] text-zinc-300">{formatDate(v.timeBought)}</span>
                        </div>
                    </div>
                </div>
                {v.IsOrgHouse === 1 &&(
                <Badge variant="outline" className="bg-red-600 border-zinc-700 text-zinc-100">Gang</Badge>
                )}
                </div>
            )) : <p className="text-zinc-600 italic px-2">No Properties found.</p>}
            </div>
        </div>
        </div>

        </div>
    )
}