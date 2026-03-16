import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from "@/lib/AuthContext"
// import { toast } from "sonner"
import {unitNames, unitRankNames, FACTIONS } from "@/lib/constants"

export default function WhitelistingModal({open, setOpen, player, type}: {open: boolean; setOpen: (val: boolean) => void; player: any; type:any}) {
    const { user } = useAuth();
    const faction = FACTIONS.find((faction : any) => faction.id === type) || null;
    if (!faction) return null;
    const userMainLevel = user[faction.levelKey];
    const masterControl = user &&(userMainLevel >= faction.commandLevel || user.adminlevel > 4); // Faction command or Senior Staff
    const hasAccess = user && (masterControl || userMainLevel != null || faction.units.some(unitKey => user[unitKey ?? ""] != null));
    if (!hasAccess) return null;
    const playerMainLevel = player[faction.levelKey];
    const [pendingChanges, setPendingChanges] = useState<Record<string, string>>({});

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

                    {(userMainLevel != null || masterControl) &&(
                        <select className={`w-full bg-popover border border-border text-xs p-2 rounded-sm outline-none focus:ring-1 focus:${faction.colorBorder}`}
                        defaultValue={playerMainLevel}>
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

                    <button className={`w-full mt-3 ${faction.colorBg} hover:bg-card py-2 text-[10px] text-foreground font-black uppercase tracking-widest transition-all`}>
                        Update Whitelisting
                    </button>
                </div>
            </div>
            </DialogContent>
        </Dialog>
    )
};