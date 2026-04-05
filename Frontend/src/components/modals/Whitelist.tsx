import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from "@/lib/AuthContext"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"
import {unitNames, unitRankNames, FACTIONS, useQueryParams } from "@/lib/constants"
import { ChevronDown } from "lucide-react"
import LoadingOverlay from "@/components/modals/Loading"


export default function WhitelistingModal({open, setOpen, player, type, onSuccess}: {open: boolean; setOpen: (val: boolean) => void; player: any; type:any; onSuccess: any}) {
    const { searchParams, updateParams } = useQueryParams();
    const isViewWhitelistOpen = searchParams.get("whitelist") !== null;
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const { user, perms } = useAuth();
    const faction = FACTIONS.find((faction: any) => faction.id === type) ?? null;
    const userMainLevel = faction && user ? user[faction.levelKey] : null;
    const isAdminOverride = !!user && user.adminlevel > (perms?.admin?.USER_WHITELIST ?? 99);
    const isFactionCommand = !!faction && !!user && userMainLevel != null && userMainLevel >= faction.commandLevel;
    const isUnitCommand = !!faction && !!user && faction.units.some((unitKey) => unitKey && user[unitKey] != null);
    const hasAccess = !!faction && !!user && (isAdminOverride || isFactionCommand || isUnitCommand);

    const masterControl = isAdminOverride || isFactionCommand; // Used to bypass check if user is a higher rank / correct rank to whitelist.

    useEffect(() => {
        // Reset pending changes on close
        if (!open) {
            setIsLoading(false);
            setPendingChanges({});
        }
        if (!user && open) setOpen(false);
    }, [open, user]);

    useEffect(() => {
        if (!isViewWhitelistOpen) return;
        if (hasAccess) return;

        toast.error("You don't have permission to whitelist.");
        updateParams({ whitelist: null });
    }, [isViewWhitelistOpen, hasAccess, updateParams]);  

    if (!faction) return null;
    if (!hasAccess) return null;

    const playerMainLevel = player[faction.levelKey];
    function delay(ms: number) {return new Promise( resolve => setTimeout(resolve, ms) );};

    const handleWhitelist = async () => {
        try {
            const changeCount = Object.keys(pendingChanges).length;
            if (changeCount === 0) return toast("No changes were detected!");
            setIsLoading(true)
            const res = await apiFetch("POST", `/players/${player.playerid}/updateWhitelisting`, {
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
                        <div className="relative">
                        <select className={`w-full bg-popover border border-border text-xs pl-2 pr-8 py-2 rounded-sm outline-none focus:ring-1 appearance-none focus:${faction.colorBorder}`}
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
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-foreground">
                            <ChevronDown className="h-4 w-4" />
                        </div>
                    </div>
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
                            <div className="relative w-full mt-2">
                            <select className={`w-full bg-popover border border-border text-xs pl-2 pr-8 py-2 rounded-sm outline-none focus:ring-1 appearance-none focus:${faction.colorBorder}`}
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
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-foreground">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                            </div>
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