
import { useState, useEffect } from 'react'
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
// import {Button } from "@/components/ui/button"
import changelogData from "@/features/changelog.json";
import {formatDate, formatMoney, formatMoneyCompact, JOB_TYPE_LABELS } from "@/lib/constants"
import { Link  } from "react-router-dom";
import type { DashboardStats } from '@/types/modals';

export default function Home() {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    const fetchStats = async () => {
        try {
            const res = await apiFetch("GET", `/stats/dashboard`)
            if (res.ok) {
              const data = await res.json();
              setStats(data)
            };
        } catch (error) {
            setStats(null);
            console.error("Fetch Error", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);
  return (
<div className="max-w-6xl mx-auto py-10 px-6 space-y-8">
  <div className="text-center space-y-2">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      Welcome to DecsPage
    </h1>
    <p className="text-sm text-muted-foreground">
      System overview, live activity and quick insights
    </p>
  </div>

  <Card className="w-full bg-card border-border shadow-sm shadow-background overflow-hidden relative">
    <CardContent className="p-6 space-y-6">

      {/* Top Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-background/75 border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Player Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">{stats?.player?.total}</p>
              <p className="text-xs uppercase text-muted-foreground">Total Players</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicles</span>
                <span className="text-foreground font-medium">{stats?.vehicle?.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Houses</span>
                <span className="text-foreground font-medium">{stats?.housing?.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bank</span>
                <span className="text-foreground font-medium">{formatMoney(Number(stats?.player?.totalBank))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/75 border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Group Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">{stats?.group?.total}</p>
              <p className="text-xs uppercase text-muted-foreground">Total Groups</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active</span>
                <span className="text-foreground font-medium">{stats?.group?.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inactive</span>
                <span className="text-foreground font-medium">{stats?.group?.inactive}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bank</span>
                <span className="text-foreground font-medium">{formatMoney(Number(stats?.group?.totalBank))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/75 border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-amber-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Job Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">{stats?.job?.total}</p>
              <p className="text-xs uppercase text-muted-foreground">Total Jobs</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground"><Link
                    to={`/jobs?statuses=pending`}
                    className="truncate tracking-tight hover:text-foreground hover:underline"
                  >
                  Pending
                  </Link></span>
                <span className="text-foreground font-medium">{stats?.job?.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"><Link
                    to={`/jobs?statuses=incomplete`}
                    className="truncate tracking-tight hover:text-foreground hover:underline"
                  >
                  Incomplete
                  </Link></span>
                <span className="text-foreground font-medium">{Number(stats?.job?.failed) + Number(stats?.job?.cancelled)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground"><Link
                    to={`/jobs?statuses=complete`}
                    className="truncate tracking-tight hover:text-foreground hover:underline"
                  >
                  Complete
                  </Link></span>
                <span className="text-foreground font-medium">{stats?.job?.complete}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/75 border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-violet-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Account Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">{stats?.user?.total}</p>
              <p className="text-xs uppercase text-muted-foreground">Total Accounts</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active</span>
                <span className="text-foreground font-medium">{stats?.user?.active}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disabled</span>
                <span className="text-foreground font-medium">{stats?.user?.inactive}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden bg-background/75 border-border">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500/70 to-transparent opacity-70" />
            <CardHeader className="pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Faction Breakdown
            </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            {/* Police */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                <div className="border-b border-border pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                    Police
                </p>
                <p className="text-2xl font-black tracking-tight text-foreground">
                    {stats?.player?.police}
                </p>
                <p className="text-[10px] uppercase text-muted-foreground">
                    Total Members
                </p>
                </div>

                <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Command</span>
                    <span className="text-foreground font-medium">{stats?.player?.policeCommand}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">TFU</span>
                    <span className="text-foreground font-medium">{stats?.player?.tfu}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">NCA</span>
                    <span className="text-foreground font-medium">{stats?.player?.nca}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">NPAS</span>
                    <span className="text-foreground font-medium">{stats?.player?.npas}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">MPU</span>
                    <span className="text-foreground font-medium">{stats?.player?.mpu}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Academy</span>
                    <span className="text-foreground font-medium">{stats?.player?.polAcad}</span>
                </div>
                </div>
            </div>

            {/* Medics */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                <div className="border-b border-border pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Medics
                </p>
                <p className="text-2xl font-black tracking-tight text-foreground">
                    {stats?.player?.medics}
                </p>
                <p className="text-[10px] uppercase text-muted-foreground">
                    Total Members
                </p>
                </div>

                <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Command</span>
                    <span className="text-foreground font-medium">{stats?.player?.medicsCommand}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">HART</span>
                    <span className="text-foreground font-medium">{stats?.player?.hart}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">HEMS</span>
                    <span className="text-foreground font-medium">{stats?.player?.hems}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Academy</span>
                    <span className="text-foreground font-medium">{stats?.player?.medAcad}</span>
                </div>
                </div>
            </div>

            {/* Ion */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
                <div className="border-b border-border pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400">
                    Ion
                </p>
                <p className="text-2xl font-black tracking-tight text-foreground">
                    {stats?.player?.ion}
                </p>
                <p className="text-[10px] uppercase text-muted-foreground">
                    Total Members
                </p>
                </div>

                <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Command</span>
                    <span className="text-foreground font-medium">{stats?.player?.ionCommand}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Delta</span>
                    <span className="text-foreground font-medium">{stats?.player?.delta}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Air</span>
                    <span className="text-foreground font-medium">{stats?.player?.iaf}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">UM</span>
                    <span className="text-foreground font-medium">{stats?.player?.um}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Academy</span>
                    <span className="text-foreground font-medium">{stats?.player?.ionAcad}</span>
                </div>
                </div>
            </div>
            </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/75 border-border">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-green-500/70 to-transparent opacity-70" />
            <CardHeader className="pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Player Leaderboard
            </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
              <div className="border-b border-border pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">
                  Most Money
                </p>

                <p className="truncate text-2xl font-black tracking-tight text-foreground">
                  <Link
                    to={`/search/${stats?.top?.money?.playerId}`}
                    className="block truncate text-2xl font-black tracking-tight text-foreground hover:underline"
                  >
                    {stats?.top?.money?.name}
                  </Link>
                </p>

                <p className="text-xs font-semibold text-purple-400">
                  {formatMoney(Number(stats?.top?.money?.total))}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cash</span>
                  <span className="text-foreground font-medium">{formatMoney(Number(stats?.top?.money?.cash))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank</span>
                  <span className="text-foreground font-medium truncate">{formatMoneyCompact(Number(stats?.top?.money?.bank))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground"></span>
                  <span className="text-foreground font-medium"> </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground"></span>
                  <span className="text-foreground font-medium"></span>
                </div>
              </div>
            </div>


            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
              <div className="border-b border-border pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                  Most Assets
                </p>

                <p className="truncate text-2xl font-black tracking-tight text-foreground">
                  <Link
                    to={`/search/${stats?.top?.assets?.playerId}`}
                    className="block truncate text-2xl font-black tracking-tight text-foreground hover:underline"
                  >
                  {stats?.top?.assets?.name}
                  </Link>
                </p>

            <p className="text-xs font-semibold text-amber-400">
            {stats?.top?.assets?.total} Assets
            </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicles</span>
                  <span className="text-foreground font-medium">{stats?.top?.assets?.vehicles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ground</span>
                  <span className="text-foreground font-medium">{stats?.top?.assets?.ground}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Air</span>
                  <span className="text-foreground font-medium">{stats?.top?.assets?.air}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Houses</span>
                  <span className="text-foreground font-medium">{stats?.top?.assets?.houses}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-3 space-y-3">
              <div className="border-b border-border pb-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  Most Playtime
                </p>

                <p className="truncate text-2xl font-black tracking-tight text-foreground">
                  <Link
                    to={`/search/${stats?.top?.playtime?.playerId}`}
                    className="block truncate text-2xl font-black tracking-tight text-foreground hover:underline"
                  >
                    {stats?.top?.playtime?.name}
                  </Link>
                </p>

            <p className="text-xs font-semibold text-red-300">
              {Math.round(Number(stats?.top?.playtime?.total) / 60)} Hours
            </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Civilian</span>
                  <span className="text-foreground font-medium">{Math.round(Number(stats?.top?.playtime?.civilian) / 60)}H</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Police</span>
                  <span className="text-foreground font-medium">{Math.round(Number(stats?.top?.playtime?.police) / 60)}H</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Medic</span>
                  <span className="text-foreground font-medium">{Math.round(Number(stats?.top?.playtime?.medic) / 60)}H</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ion</span>
                  <span className="text-foreground font-medium">{Math.round(Number(stats?.top?.playtime?.ion) / 60)}H</span>
                </div>
              </div>
            </div>
            </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden bg-background/75 border-border">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-amber-500/70 to-transparent opacity-70" />
        
        <CardHeader className="pb-1">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Recent Jobs
            </CardTitle>
        </CardHeader>

        <CardContent className="space-y-1">
            {stats?.jobs?.data?.map((job: any) => {
            const statusClass =
                job?.status === "Complete"
                ? "text-emerald-500"
                : job?.status === "Processing"
                ? "text-blue-500"
                : job?.status === "Pending"
                ? "text-amber-500"
                : job?.status === "Failed"
                ? "text-red-500"
                : "text-muted-foreground";

            return (
                <Link
                    key={job.id}
                    to={`/jobs?search=${job.id}`}
                    className="block rounded-sm border-b border-border px-2 py-2 transition-colors hover:bg-card"
                    >
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {JOB_TYPE_LABELS[job?.type] ?? job?.type}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Job ID {job?.id} • {formatDate(job?.updatedAt, true)}
                        </p>
                        </div>
                        <span className={`shrink-0 text-xs font-bold uppercase ${statusClass}`}>
                        {job?.status}
                        </span>

                    </div>
                </Link>
            );
            })}

            <div className="pt-1">
            <Link
                to="/jobs"
                className="text-[10px] font-black uppercase tracking-widest text-amber-500 underline underline-offset-4 hover:text-amber-400 transition-colors"
            >
                View All Jobs
            </Link>
            </div>
        </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/75 border-border">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-violet-500/70 to-transparent opacity-70" />
        
        <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Recent Changes
            <span className="ml-2 text-[10px] font-medium text-muted-foreground">
                {changelogData[0].date}
            </span>
            </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
            <ul className="space-y-2">
            {changelogData[0].changes.slice(0, 5).map((change, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground leading-relaxed">
                <span
                    className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-black uppercase
                    ${
                        change.type === "backend"
                        ? "border-emerald-500/30 text-emerald-500"
                        : "border-purple-500/30 text-purple-500"
                    }`}
                >
                    {change.type[0]}
                </span>

                <span className="text-[13px] text-foreground">
                    {change.text}
                </span>
                </li>
            ))}
            </ul>

            {changelogData[0].changes.length > 5 && (
            <div className="pt-1">
                <Link
                to="/changelog"
                className="text-[10px] font-black uppercase tracking-widest text-emerald-500 underline underline-offset-4 hover:text-emerald-400 transition-colors"
                >
                View Full Changelog
                </Link>
            </div>
            )}
        </CardContent>
        </Card>
      </div>

      {/* Optional Quick Actions */}
      {/* <Card className="relative overflow-hidden bg-background/40 border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button className="text-xs">Search Players</Button>
            <Button className="text-xs" variant="outline">View Jobs</Button>
            <Button className="text-xs" variant="outline">View Logs</Button>
            <Button className="text-xs" variant="outline">Create Export</Button>
          </div>
        </CardContent>
      </Card> */}

    </CardContent>
  </Card>
</div>
  );
}