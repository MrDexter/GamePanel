import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from "@/lib/AuthContext"
import { toast } from "sonner"
import { apiFetchPost } from "@/lib/api"
import {unitNames, unitRankNames, FACTIONS } from "@/lib/constants"
import LoadingOverlay from "@/components/modals/Loading"


export default function WhitelistingModal({open, setOpen, player, type, onSuccess}: {open: boolean; setOpen: (val: boolean) => void; player: any; type:any; onSuccess: any}) {
    const { user, perms } = useAuth();
    if (!user) return null;
    const faction = FACTIONS.find((faction : any) => faction.id === type) || null;
    if (!faction) return null;
    const userMainLevel = user[faction.levelKey];
    const masterControl = user &&(userMainLevel >= faction.commandLevel || user.adminlevel > (perms?.admin?.USER_WHITELIST ?? 99)); // Faction command or Senior Staff
    const hasAccess = user && (masterControl || userMainLevel != null || faction.units.some(unitKey => user[unitKey ?? ""] != null));
    if (!hasAccess) return null;
    const playerMainLevel = player[faction.levelKey];
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    function delay(ms: number) {return new Promise( resolve => setTimeout(resolve, ms) );};

    const handleWhitelist = async () => {
        try {
            const changeCount = Object.keys(pendingChanges).length;
            if (changeCount === 0) return toast("No changes were detected!");
            setIsLoading(true)
            const res = await apiFetchPost(`/players/${player.playerid}/updateWhitelisting`, {
                body: JSON.stringify({
                    SteamId: player.playerid,
                    Updates: pendingChanges,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                onSuccess(); // Refresh player data to show updated whitelisting
                await delay(1000);
                toast.success("Rank Update Successful", {
                    description: `The Players Whitelisting has been updated!`
                });
                setPendingChanges({})
                setOpen(false)
                setIsLoading(false);
            } else {
                toast.error("Update Failed", { description: data.message ?? "API Error" });
                setIsLoading(false);
            }
        } catch (error : any){
            setIsLoading(false);
            toast.error("Error", { description: error.message ?? "Check API status." });
        };  
    };

    useEffect(() => {
        // Reset pending changes on close
        if (!open) {
            setIsLoading(false);
            setPendingChanges({});
        }
        if (!user && open) setOpen(false);
    }, [open, user]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl bg-popover/80 border-border text-foreground">
            <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
                {faction.label} Whitelisting: {player.name}
                </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-4">

                <div key={faction.label} className={`border border-border p-4 rounded-sm bg-card/75 hover:${faction.colorBorder} transition-colors`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest ${faction.colorText}`}>{faction.label}</h4>
                        </div>
                    </div>

                    {(userMainLevel != null && masterControl) &&(
                        <select className={`w-full bg-popover border border-border text-xs p-2 rounded-sm outline-none focus:ring-1 focus:${faction.colorBorder}`}
                            defaultValue={playerMainLevel}
                            onChange = {(e) => {
                                const newValue = e.target.value;

                                if (newValue !== playerMainLevel) {
                                    setPendingChanges(prev => ({ ...prev, [faction.levelKey]: newValue }));
                                } else {
                                    setPendingChanges(prev => {
                                        const next = { ...prev };
                                        delete next[faction.levelKey];
                                        return next;
                                    });
                                }
                            }}>
                            {Object.entries(faction.ranks).map(([level, name]) => {
                                if (level >= userMainLevel && !masterControl) return null;
                                return (
                                    <option key={level} value={level}>
                                        {level == playerMainLevel ? name + " - Current" : name}
                                    </option>   
                                )             
                            })}
                        </select>
                    )}
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] ${faction.colorText} mt-6 mb-2 border-b border-white/5 pb-1`}>
                        Specialist Units
                    </h4>
                    {faction.units.map((unitKey) => { 
                        if (unitKey == null) return null; // We use a null for Ion so Academy level sits on the bottom in each box. Better layout
                        if (user[unitKey] == null && !masterControl) return null;
                        if (user[unitKey] < player[unitKey] && !masterControl) return null;
                        const unitLevel = player[unitKey] ?? "";
                        return (
                            <div key={unitKey} className={`flex flex-col items-start text-left mt-2`}>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {unitNames[unitKey]}
                            </span>
                            <select className={`w-full bg-popover border border-border text-xs p-2 rounded-sm outline-none focus:ring-1 focus:${faction.colorBorder} mt-2`}
                                defaultValue={unitLevel}
                                onChange = {(e) => {
                                    const newValue = e.target.value;

                                    if (newValue !== unitLevel) {
                                        setPendingChanges(prev => ({ ...prev, [unitKey]: newValue }));
                                    } else {
                                        setPendingChanges(prev => {
                                            const next = { ...prev };
                                            delete next[unitKey];
                                            return next;
                                        });
                                    }
                                }}
                                >
                                {Object.entries(unitRankNames[unitKey]).map(([level, name]) => {
                                    if (level >= user[unitKey] && !masterControl) return null;
                                    return (
                                        <option key={level} value={level}>
                                            {level == unitLevel ? name + " - Current" : name}
                                        </option> 
                                    )                  
                                })}
                            </select>
                            </div>
                        );
                    })}

                    <button className={`w-full mt-3 ${faction.colorBg} hover:bg-card py-2 text-[10px] text-foreground font-black uppercase tracking-widest transition-all`}
                        onClick = { () => handleWhitelist()}>
                        Update Whitelisting
                    </button>
                </div>
                
            </div>
            </DialogContent>
            <LoadingOverlay isVisible={isLoading} />
        </Dialog>
    )
};