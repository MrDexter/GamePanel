import React, { useState, useEffect } from 'react'
import { ClipboardCopy } from "lucide-react"; //ClipboardCheck
import { useParams, useNavigate, Link  } from "react-router-dom";
// import {Input } from "@/components/ui/input"
import { Pencil } from "lucide-react";
import {Button } from "@/components/ui/button"
import {Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {formatDate, copRanks, medicRanks, ionRanks, unitNames, formatMoney, unitRankNames } from "@/lib/constants"
import { apiFetch } from "@/lib/api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

const FACTIONS = [
  { id: 'cop', label: 'Police', color: 'text-blue-500', levelKey: 'coplevel', ranks: copRanks, units: ["tfuLevel", "ncaLevel", "npaslevel", "mpuLevel", "acadLevel",], login: 'cop_login', playtime: 'playtime_cop'},
  { id: 'med', label: 'Medics', color: 'text-green-500', levelKey: 'mediclevel', ranks: medicRanks, units: ["hemslevel", "hartlevel", "rpLevel"], login: 'nhs_login', playtime: 'playtime_nhs'},
  { id: 'admin', label: 'Ion', color: 'text-red-500', levelKey: 'ionlevel', ranks: ionRanks, units: ["deltalevel", "UmLevel", "iaflevel", "", "irulevel" ], login: 'van_login', playtime: 'playtime_opfor'},
];

export default function StatsPlayer() {
    const { id } = useParams();
    const [player, setPlayer] = useState<any>(null)
    const navigate = useNavigate();
    const checkInventory = (inv: string) => inv && inv !== '"[[],0]"';
    const checkVirtualInventory = (inv: string) => inv && inv !== '"[[],0]"';

    useEffect(() => {
        const fetchPlayer = async () => {
            try {
                const res = await apiFetch(`/players/${id}`)
                if (!res.ok) {
                    setPlayer("Not Found")
                };
                const data = await res.json();
                setPlayer(data[0])
                window.scrollTo(0, 0);
            } catch (error) {
                setPlayer("Not Found");
                console.error("Fetch Error", error);
                const timer = setTimeout(() => {
                    navigate(-1); // Redirect back to search
                }, 4000);
                return () => clearTimeout(timer);
            }
        };
        if (id) fetchPlayer();
    }, [id, navigate]);

    if (!player) {
        return(
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h2 className="text-2xl text-blue-500 animate-pulse font-mono">
                    Profile Loading...
                </h2>
            </div>  
        )
    };
    if (player === "Not Found") {
        return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h2 className="text-2xl font-bold text-red-500 uppercase tracking-tighter italic">
                Profile Not Found
            </h2>
            <p className="text-zinc-500 animate-pulse text-sm font-mono">
                Returning...
            </p>
        </div>   
        );
    }
    const gangRank = player.gang.members.find((member: any) => member.id === player.playerid);
    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
        {/* Top Row: Back Button & Status */}
        <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate(-1)} className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 hover:text-[16px]">
            ← Back to Search
            </Button>
            <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Last Seen: {formatDate(player.last_seen)}
            </div>
        </div>

        <Card className="w-full bg-zinc-900 border-zinc-800 shadow-2xl shadow-blue-900/10 mb-6 overflow-hidden relative backdrop-blur-md">
        <CardHeader className="flex flex-row items-center gap-6 border-b border-zinc-800/50 pb-8">
            <div className="space-y-1">
            <CardTitle className="text-4xl font-black uppercase tracking-tighter text-zinc-300">
                <div className="flex flex-col md:flex-row justify-betwee items-center w-full px-2 justify-between">
                
                {/* Group 1: Primary Identity */}
                <div className="flex items-center gap-6">
                    <div className="relative h-16 w-16 flex items-center justify-center rounded-2xl bg-zinc-950 border-2 border-blue-600/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]">
                    <span className="text-3xl font-black text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                        {player.name?.[0].toUpperCase()}
                    </span>
                    {/* Small "Active" dot in the corner */}
                    {/* <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-4 border-zinc-900" /> */}
                    </div>
                    <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                        {player.name}
                    </h1>
                    <div className="flex gap-3 items-center mt-1">
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 font-mono tracking-tighter">
                        UUID: {player.uid}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400 font-mono tracking-tighter">
                        ID: {player.playerid}
                        </Badge>
                        {player.adminlevel > 0 &&(
                            <Badge variant="outline" className="text-[10px] border-zinc-700 text-blue-500 font-mono tracking-tighter">
                            Staff
                            </Badge> 
                        )}
                        {player.donorlevel > 0 &&(
                            <div className='text-[10px] border-zinc-700 text-red-700 font-mono tracking-tighter'>
                                <TooltipProvider>
                                    <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="cursor-help"> {/* Makes the mouse a 'help' cursor */}
                                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-red-700 font-mono tracking-tighter bg-red-500/5">
                                            Donator
                                        </Badge>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-zinc-950 border-zinc-800 text-zinc-100 shadow-2xl">
                                        <div className="flex flex-col gap-1 p-1">
                                        <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Subscription Expiry</span>
                                        <span className="text-xs font-mono text-red-400 font-bold">
                                            {formatDate(player.donorExpiry)}
                                        </span>
                                        </div>
                                    </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        )}
                        {/* <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">
                        Joined {formatDate(player.insert_time)}
                        </span> */}
                    </div>
                    </div>
                </div>

                {/* Group 2: Quick Stats (Horizontal Row) */}
                {/*<div className="flex gap-12 border-l border-zinc-800/50 pl-12 h-12 items-center ml-auto">
                    <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Total Wealth</span>
                    <span className="text-xl font-mono text-emerald-500">
                        {formatMoney((player.cash || 0) + (player.bankacc || 0))}
                    </span>
                    </div>
                </div>
                     <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest">Steam ID</span>
                    <span className="text-xs font-mono text-zinc-300 tracking-tighter">
                        {player.playerid}
                    </span>
                    </div> */}

                </div>
            </CardTitle>
            {/* <div className="flex gap-3 text-[12px] font-mono text-zinc-400 uppercase">
                <span>Staff: {player.adminlevel > 0 ? "Yes" : "No"}</span>
                <span className="text-zinc-300">|</span>
                <span>Donator: {player.donorlevel > 0 ? "Yes" : "No"}</span>
                {player.donorlevel !== 0 &&(
                    <span>Expiry: {formatDate(player.donorExpiry)}</span>
                )}
            </div> */}
            </div>
        </CardHeader>
        <CardContent className="pt-1">
            <div className="grid grid-cols-1 md:grid-cols-1 grid-rows-1 gap-4">

            <div className="relative overflow-hidden bg-zinc-800/40 backdrop-blur-md border-zinc-800 rounded-xl p-6">
            {/* Row 1: Key Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col ">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Money</span>
                <span className="text-[14px] font-mono text-emerald-500">{formatMoney((player.cash || 0) + (player.bankacc || 0))}</span>
                </div>
                <div className="flex flex-col border-l border-zinc-700/25 pl-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Playtime</span>
                <span className="text-[14px] font-mono text-zinc-100">{Math.round((player.playtime_civ + player.playtime_cop + player.playtime_nhs + player.playtime_opfor) / 60) || "0"}H</span>
                </div>
                <div className="flex flex-col border-l border-zinc-700/25 md:pl-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Licenses</span>
                <span className="text-[14px] font-mono text-zinc-100">{player.civ_licenses?.length || 0}</span>
                </div>
                <div className="flex flex-col border-l border-zinc-700/25 pl-8">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">XP</span>
                <span className="text-[14px] font-mono text-orange-400">{player.playerXP?.toLocaleString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-6 border-t border-zinc-700/25 mt-6">
            {/* Left: Aliases (Takes up 1 col) */}
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Known Aliases</span>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                {player.aliases?.replace(/[\[\]"]/g, "").split(",").join(", ") || "None Recorded"}
                </p>
            </div>

            {/* Right: Total Playtime (Pushed to the edge) */}
            {/* <div className="flex flex-col items-end text-right">
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1"></span>
                <span className="text-xl font-mono text-zinc-100"></span>
                <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-tighter mt-1"></p>
            </div> */}
            </div>
            
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {FACTIONS.map((faction) => {
                    const mainLevel = player[faction.levelKey];
                    return(
                        <Card key={faction.id} className="relative overflow-hidden bg-zinc-800/40 backdrop-blur-md border-zinc-800 group h-full">
                        <div className={`absolute top-0 left-0 w-full h-[2px] bg-linear-to-r to-transparent opacity-70 group-hover:opacity-100 transition-opacity`} />
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className={`text-xs font-bold uppercase tracking-widest ${faction.color}`}>
                            {faction.label}
                            <div className="text-xs text-zinc-300 uppercase leading-none">
                            Rank: {faction.ranks[mainLevel] ?? "None"}
                            </div>
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-zinc-800/40">
                            <Pencil className={`h-3 w-3 ${faction.color} hover:text-white hover:scale-110 transition-all cursor-pointer`} />
                            </Button>                       
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 space-y-2 justify-between items-center">
                                {faction.units.map((unitKey, index) => { 
                                        const level = player[unitKey] ?? "";
                                        const unitRanks = unitRankNames[unitKey] || {}; 
                                        const rankName = unitRanks[level] ?? `${level}`;
                                        const isEvenColumn = index % 2 !== 0;
                                        return (
                                            <div key={unitKey} className={`flex flex-col ${isEvenColumn ? "items-end text-right" : "items-start text-left"}`}>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                {unitNames[unitKey]}
                                            </span>
                                            <span className="text-[14px] font-mono text-zinc-100"> {rankName}</span>
                                            </div>
                                        );
                                })}
                            </div>
                        </CardContent>
                          {/* The Faction Footer */}
                            <div className="mt-auto border-t border-zinc-800/50 bg-zinc-650/30 px-6 py-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Last Active</span>
                                        <span className="text-[10px] font-mono text-zinc-100">
                                        {player[faction.login] ? formatDate(player[faction.login]) : "NEVER"}
                                        </span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Playtime</span>
                                        <span className="text-[10px] font-mono text-zinc-100">
                                        {Math.round(player[faction.playtime] / 60) || 0}H
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
                    <Card className="bg-zinc-800/40 backdrop-blur-md border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className={`text-xs font-bold uppercase tracking-widest text-purple-500`}>
                        {player.gang.name}
                        <div className="text-xs text-zinc-300 uppercase leading-none">
                        <span>Rank: {gangRank.Rank > 4 ? gangRank.rank : "Leader"}</span>
                        </div>
                        </CardTitle>
                        <Badge variant="outline" className="border-zinc-700 bg-purple-600 text-zinc-200 uppercase">{player.gang.id}</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 space-y-2">
                            <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                TAG
                            </span>
                            <span className="text-[14px] font-mono text-zinc-100">{player.gang.tag}</span>
                            </div>
                            <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                BANK
                            </span>
                            <span className="text-[14px] font-mono text-zinc-100">{formatMoney(player.gang.bank)}</span>
                            </div>
                            <div className="border-t border-zinc-800/30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-2">
                                Members
                            </span>
                            <p className="text-[10px] text-zinc-400 leading-relaxed">
                                {player.gang.members.map((member : any , index : any) => (
                                <React.Fragment key={member.id}>
                                    <Link 
                                    to={`/stats/${member.id}`} 
                                    className="text-[10px] font-mono text-zinc-100 hover:text-zinc-400 hover:underline transition-colors">
                                    <span>{member.rank > 4 ? member.name + "(Leader)" : member.name}</span>
                                    </Link>
                                    {index < player.gang.members.length - 1 && <span className="text-zinc-100">, </span>}
                                </React.Fragment>
                                ))}
                            </p>
                            </div>
                        </div>
                    </CardContent>
                        {/* The Faction Footer */}
                        <div className="mt-auto border-t border-zinc-800/50 bg-zinc-650/30 px-6 py-3">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Join Date</span>
                                    <span className="text-[10px] font-mono text-zinc-100">
                                    {player.insert_time ? formatDate(player.insert_time) : "NEVER"}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Playtime</span>
                                    <span className="text-[10px] font-mono text-zinc-100">
                                    {Math.round(player.playtime_civ / 60) || 0}H
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
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
                <div className="grid grid-col-1 items-center gap-1.5 shrink-0 w-fit">
                    <Badge variant="outline" className="border-zinc-700 bg-blue-600 text-zinc-200 uppercase">{v.id}</Badge>
                    <Badge variant="outline" className={`${typeColor[v.type] ?? 'bg-blue-600'} border-zinc-700 text-zinc-100 md:hidden`}>{v.type}</Badge>
                    <Badge variant="outline" className={`${sideColor[v.side] ?? 'bg-zinc-800'} border-zinc-700 text-zinc-100 uppercase md:hidden`}>{v.side}</Badge>
                </div>

                <div className="flex-1 px-6">
                    <p className="font-bold text-white text-xs md:text-m uppercase">{v.class} 
                    </p>
                    <div className="flex gap-2 md:gap-4 mt-1 items-center">
                        <div className="flex flex-col">
                        <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Plate</span>
                        <span className="text-[12px] md:text-[14px] text-zinc-300 font-mono tracking-tighter">{v.reg}</span>
                        </div>
                        
                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                            <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Cargo</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[12px] md:text-[14px] font-bold ${checkInventory(v.inventory) ? "text-amber-500" : "text-zinc-500"}`}>
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
                        <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Registered</span>
                        <span className="text-[12px] md:text-[14px] text-zinc-300">{formatDate(v.insertTime)}</span>
                        </div>
                    </div>
                </div>


                <div className="grid grid-rows-2 gap-2 invisible md:visible">
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
                <div className="grid grid-col-1 items-center gap-1.5 shrink-0 w-fit">
                    <Badge variant="outline" className="border-zinc-700 bg-blue-600 text-zinc-200 uppercase">{v.id}</Badge>
                    {v.isOrgHouse == 1 &&(
                    <Badge variant="outline" className="bg-red-600 border-zinc-700 text-zinc-100 md:invisible">Gang</Badge>
                    )}
                </div>

                <div className="flex-1 px-6">
                    <p className="font-bold text-white text-xs md:text-m uppercase">{v.location.replaceAll('"', "") }
                    </p>
                    <div className="flex gap-4 mt-1 items-center">
                        <div className="flex flex-col">
                        <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Security</span>
                        <span className="text-[12px] md:text-[14px] text-zinc-300 font-mono tracking-tighter">{v.securityLevel}</span>
                        </div>
                        
                        <div className="flex flex-col border-l border-zinc-800 pl-4">
                            <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Virtual</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[12px] md:text-[14px] text-zinc-300 font-mono italic" ${checkVirtualInventory(v.virtualContents) ? "text-amber-500" : "text-zinc-500"}`}>
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
                            <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Physical</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[12px] md:text-[14px] text-zinc-300 font-mono italic" ${checkVirtualInventory(v.Contents) ? "text-amber-500" : "text-zinc-500"}`}>
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
                        <span className="text-[10px] md:text-[12px] text-zinc-400 uppercase">Purchased</span>
                        <span className="text-[12px] md:text-[14px] text-zinc-300">{formatDate(v.timeBought)}</span>
                        </div>
                    </div>
                </div>
                {v.isOrgHouse == 1 &&(
                <Badge variant="outline" className="bg-red-600 border-zinc-700 text-zinc-100 invisible md:visible">Gang</Badge>
                )}
                </div>
            )) : <p className="text-zinc-600 italic px-2">No Properties found.</p>}
            </div>
        </div>
        </div>

        </div>
    )
}