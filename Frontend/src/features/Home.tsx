
import { useState, useEffect } from 'react'
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
// import {Button } from "@/components/ui/button"
import changelogData from "@/features/changelog.json";
import { Link  } from "react-router-dom";

export default function Home() {
    const [stats, setStats] = useState<any>(null)
    const [recentJobs, setJobs] = useState<any>(null)

    const fetchStats = async () => {
        try {
            const res = await apiFetch("GET", `/stats/player`)
            if (!res.ok) {
                setStats("Not Found")
            };
            const data = await res.json();
            setStats(data)
            const jobRes = await apiFetch("GET", `/jobs?limit=4`);
            if(jobRes.ok) {
                const jobsData = await jobRes.json();
                setJobs(jobsData.data);
                console.log(jobsData.data)
            }
        } catch (error) {
            setStats("Not Found");
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

  <Card className="w-full bg-card border-border shadow-2xl shadow-blue-900/10 overflow-hidden relative backdrop-blur-md">
    <CardContent className="p-6 space-y-6">

      {/* Top Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Player Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">{stats?.player?.players}</p>
              <p className="text-xs uppercase text-muted-foreground">Total Players</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vehicles</span>
                <span className="text-foreground font-medium">50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Houses</span>
                <span className="text-foreground font-medium">50</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Group Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">3</p>
              <p className="text-xs uppercase text-muted-foreground">Total Groups</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Police</span>
                <span className="text-foreground font-medium">{stats?.player?.police}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medics</span>
                <span className="text-foreground font-medium">{stats?.player?.medics}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ion</span>
                <span className="text-foreground font-medium">{stats?.player?.ion}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-violet-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Account Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">8</p>
              <p className="text-xs uppercase text-muted-foreground">Total Accounts</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active</span>
                <span className="text-foreground font-medium">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Disabled</span>
                <span className="text-foreground font-medium">2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border group h-full">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-amber-500/70 to-transparent opacity-70 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Job Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-black tracking-tight text-foreground">3</p>
              <p className="text-xs uppercase text-muted-foreground">Pending Jobs</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Processing</span>
                <span className="text-foreground font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Failed</span>
                <span className="text-foreground font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Complete</span>
                <span className="text-foreground font-medium">128</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-blue-500/70 to-transparent opacity-70" />
            <CardHeader className="pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Faction Breakdown
            </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            {/* Police */}
            <div className="rounded-xl border border-border/50 bg-card/75 p-3 space-y-3">
                <div className="border-b border-border/50 pb-2">
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
            <div className="rounded-xl border border-border/50 bg-card/75 p-3 space-y-3">
                <div className="border-b border-border/50 pb-2">
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
            <div className="rounded-xl border border-border/50 bg-card/75 p-3 space-y-3">
                <div className="border-b border-border/50 pb-2">
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

        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-emerald-500/70 to-transparent opacity-70" />
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">API Status</span>
              <span className="text-emerald-500 font-medium">Online</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Jobs Active</span>
              <span className="text-foreground font-medium">1</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Exports Generated</span>
              <span className="text-foreground font-medium">16</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Recent Logins</span>
              <span className="text-foreground font-medium">4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audit Events</span>
              <span className="text-foreground font-medium">128</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-amber-500/70 to-transparent opacity-70" />
        
        <CardHeader className="pb-1">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Recent Jobs
            </CardTitle>
        </CardHeader>

        <CardContent className="space-y-1">
            {recentJobs?.map((job: any) => {
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
                className="block rounded-sm border-b border-border/50 px-2 py-1 transition-colors hover:bg-card"
                >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {job?.type}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Job ID {job?.id}
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

        <Card className="relative overflow-hidden bg-background/50 backdrop-blur-md border-border">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-linear-to-r from-violet-500/70 to-transparent opacity-70" />
        
        <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Recent Changes
            <span className="ml-2 text-[10px] font-medium text-muted-foreground/70">
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
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
                        : "border-purple-500/30 text-purple-500 bg-purple-500/5"
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
      {/* <Card className="relative overflow-hidden bg-background/40 backdrop-blur-md border-border">
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