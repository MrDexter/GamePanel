



export default function Breakdown() {

    return (
        <div className="space-y-12 max-w-6xl mx-auto px-6 py-12">

            <section id="stats" className="scroll-mt-20 space-y-6">
                <div className="border-l-4 border-blue-600 pl-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
                        The Stats Interface
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        High-Density Data Display & API Integration
                    </p>
                </div>

            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed font-medium">
            <p>
                The <span className="text-foreground font-bold">Stats Page</span> acts as the primary interface for the Community API. 
                It is designed for fast information retrieval, allowing operators to scan and search live player data, 
                update ranks, export data, and manage site credentials <span className="italic text-muted-foreground">(subject to permissions)</span>.
            </p>
            
            <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                <p>
                I implemented a <span className="text-foreground font-bold">multi-field search system</span> that allows users to 
                query the SQL-backed API via <span className="text-blue-400 font-bold uppercase text-[10px]">Name</span>, 
                <span className="text-blue-400 font-bold uppercase text-[10px] ml-2">Aliases</span>, 
                <span className="text-blue-400 font-bold uppercase text-[10px] ml-2">Internal ID</span>, or 
                <span className="text-blue-400 font-bold uppercase text-[10px] ml-2">SteamID</span>.
                </p>
            </div>

            <div className="bg-card border border-border p-5 rounded-sm space-y-3 border-l-blue-600 border-l-2">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                Administrative Control Layer
                </h4>
                <p className="text-sm text-muted-foreground">
                I integrated a <span className="text-foreground font-bold">hierarchical permissions system</span> directly into the player cards. 
                Administrative actions such as <span className="text-foreground font-bold">Rank Updates</span> and 
                <span className="text-foreground font-bold">Credential Resets</span> only render if the authenticated operator meets the required 
                clearance level.
                </p>
                <div className="flex gap-4 opacity-60">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Validation Logic: Active</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-bold uppercase text-muted-foreground">Backend Sync: Active</span>
                </div>
                </div>
            </div>

            <p>
                To maintain responsiveness, the initial view is limited to 15 players to reduce DOM load, 
                with a <span className="italic text-muted-foreground">custom pagination system</span> added to support larger result sets.
            </p>
            </div>
            </section>

            <section id="jobs" className="scroll-mt-20 space-y-6">
                <div className="border-l-4 border-emerald-500 pl-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
                        Asynchronous Job Management
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        Background Worker Orchestration & Monitoring
                    </p>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed font-medium">
                    <p>
                        The <span className="text-foreground font-bold">Jobs Page</span> is the planned management interface for the <span className="text-foreground font-bold">Azure Background Worker</span>. 
                        It will provide a real-time interface to monitor, cancel, or re-queue long-running tasks such as 
                        <span className="text-foreground font-bold italic"> CSV Exports</span>, <span className="text-foreground font-bold italic"> Bulk Rank Updates</span>, 
                        and <span className="text-foreground font-bold italic"> System Backups</span>.
                    </p>
                
                    <div className="bg-card border border-border p-5 rounded-sm space-y-3 border-l-emerald-500 border-l-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                            Task Authorization Layer
                        </h4>
                        <p className="text-sm text-muted-foreground">
                            Leveraging the <span className="text-foreground font-bold">Identity System</span>, users will have granular control over their own 
                            requested tasks, while administrative staff will have global oversight to manage the <span className="text-foreground font-bold">Job Queue</span> and 
                            ensure system resources are allocated efficiently.
                        </p>
                    </div>

                    <p className="text-[10px] uppercase font-bold text-muted-foreground italic">
                        Status: Initial Backend Logic Live / Frontend UI In-Design
                    </p>
                </div>
            </section>

            <section id="security" className="scroll-mt-20 space-y-8">
                <div className="border-l-4 border-indigo-500 pl-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
                        Identity & Security Architecture
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        Zero-Trust Session Management & RBAC
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 text-muted-foreground text-sm leading-relaxed font-medium">
                    
                    {/* THE VAULT: REFRESH TOKENS */}
                    <div className="bg-white/5 border border-white/10 p-5 rounded-sm">
                        <h4 className="text-xs font-black uppercase text-foreground mb-2 tracking-widest">
                            The "Dual-Token" Handshake
                        </h4>
                        <p>
                        To reduce session hijacking risk, I implemented a <span className="text-indigo-400">stateless JWT + stateful refresh token</span> system. 
                        The session GUID is stored in an <span className="text-foreground font-bold">HttpOnly, Secure, SameSite cookie</span>, 
                        preventing it from being directly accessed through browser-side JavaScript and reducing exposure to token theft through XSS-related attacks.
                        </p>
                        <p className="mt-2 text-[10px] text-muted-foreground font-mono">
                            [PROTOCOL]: GUID rotated on every valid request | 24h Expiry | Manual Revocation on Logout.
                        </p>
                    </div>

                    {/* CREDENTIAL LIFECYCLE */}
                    <div className="space-y-4">
                        <p>
                            I architected a <span className="text-foreground font-bold">Mandatory Credential Rotation</span> workflow. 
                            When an Admin provisions a new user or resets a lost password, the system generates a 
                            one-time plaintext key and flags the account for an <span className="text-indigo-400">Immediate Password Reset</span>.
                        </p>
                        <p>
                            The dashboard intercepts the session upon login, locking the interface until the user 
                            establishes new, hashed credentials via the <span className="text-foreground font-bold">BCrypt</span> hashing algorithm.
                        </p>
                    </div>

                    {/* DYNAMIC PERMISSIONS */}
                    <div className="bg-card border-l-2 border-indigo-500 p-5 rounded-sm">
                        <h4 className="text-xs font-black uppercase text-indigo-500 mb-2 tracking-widest">
                            Hierarchical Authorization (RBAC)
                        </h4>
                        <p>
                            Permissions are baked directly into the <span className="text-foreground font-bold">JWT Claims</span>. 
                            The backend performs a <span className="italic underline">Depth-Check</span> on every administrative request: 
                            an operator can only modify ranks that are strictly below their own clearance level. 
                            This ensures that even with a valid token, no user can "Rank Up" beyond their defined authority.
                        </p>
                    </div>
                </div>
            </section>

            <section id="azure" className="scroll-mt-20 space-y-8">
                <div className="border-l-4 border-sky-500 pl-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
                        Cloud Infrastructure & DevOps
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        Azure Managed Services & Automated Deployment
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 text-muted-foreground text-sm leading-relaxed font-medium">
                    
                    {/* THE STACK: APPS & STORAGE */}
                    <div className="bg-white/5 border border-white/10 p-5 rounded-sm">
                        <h4 className="text-xs font-black uppercase text-foreground mb-2 tracking-widest">
                            Distributed Cloud Ecosystem
                        </h4>
                        <p>
                            The dashboard is architected as a <span className="text-sky-400">multi-service architecture</span> within the Microsoft Azure ecosystem. 
                            I utilize <span className="text-foreground font-bold">Azure App Service</span> for the .NET Backend and <span className="text-foreground font-bold">Static Web Apps</span> for the React frontend, 
                            backed by an <span className="text-foreground font-bold">Azure SQL Server</span> and a <span className="text-foreground font-bold">Storage Account</span> for secure asset and export handling.
                        </p>
                    </div>

                    {/* CI/CD: GITHUB ACTIONS */}
                    <div className="space-y-4">
                        <p>
                            I implemented a <span className="text-foreground font-bold">Split-CI/CD Pipeline</span> via GitHub Actions. 
                            The system is designed for <span className="text-foreground font-bold">Incremental Deployment</span> detecting changes in specific directories so that frontend-only updates do not trigger full backend rebuilds.
                            ensuring that a frontend UI change doesn't trigger a full backend rebuild.
                        </p>
                        <p className="border-l-2 border-border pl-4 italic">
                            By utilizing a <span className="text-foreground font-bold underline decoration-sky-500/30">Main-Branch Deployment strategy</span>, 
                            I can maintain 100% uptime on the production environment while simultaneously 
                            iterating on complex features like <span className="text-foreground font-bold">Identity & Authentication</span> in isolated feature branches.
                        </p>
                    </div>

                    {/* NETWORKING: CLOUDFLARE */}
                    <div className="bg-card border-l-2 border-sky-500 p-5 rounded-sm">
                        <h4 className="text-xs font-black uppercase text-sky-500 mb-2 tracking-widest">
                            Network & Edge Security
                        </h4>
                        <p>
                            The frontend is protected by a <span className="text-foreground font-bold">Cloudflare Edge Proxy</span> with a custom domain. 
                            This provides an additional layer of security, including <span className="text-foreground font-bold">DDoS protection</span> and <span className="text-foreground font-bold">SSL/TLS termination </span> 
                            before requests even hit the Azure data centre.
                        </p>
                    </div>
                </div>
            </section>

            <section id="data" className="scroll-mt-20 space-y-6">
                <div className="border-l-4 border-amber-500 pl-4">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">
                        Data Architecture & Error Handling
                    </h2>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                        Exception-Driven Logic & SQL Integrity
                    </p>
                </div>

                <div className="space-y-4 text-muted-foreground text-sm leading-relaxed font-medium">
                    <p>
                        I’ve architected the backend to use <span className="text-foreground font-bold">structured exception handling</span>. 
                        Instead of relying on null returns or generic error responses, my methods are designed to 
                        <span className="text-foreground font-bold italic"> Throw Specific Exceptions </span> the moment data integrity is compromised.
                    </p>

                    <div className="bg-amber-500/5 border-l-2 border-amber-500 p-5 rounded-sm">
                        <h4 className="text-[10px] font-black uppercase text-amber-500 mb-2 tracking-widest">
                            Granular Debugging & Response Logic
                        </h4>
                        <p>
                            By catching these exceptions at the endpoint level, I can return <span className="text-foreground font-bold">accurate, dynamic error messages </span> 
                            directly to the frontend. This prevents "Silent Failures" and ensures that as a developer, I can 
                            instantly identify if a request failed due to a missing <span className="text-foreground font-bold">SteamID</span>, an invalid <span className="text-foreground font-bold">Session GUID</span>, 
                            or a <span className="text-foreground font-bold">Permission Mismatch</span>.
                        </p>
                    </div>

                    <p className="text-xs italic opacity-80">
                        "Moving the validation into the core methods ensures the API never proceeds with 'broken' data, 
                        providing a much more reliable foundation for the live production database."
                    </p>
                    <div className="flex items-center gap-4 mt-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-2 border border-amber-500/20 px-3 py-1 rounded-full bg-amber-500/5">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest italic">
                            Refactoring in Progress
                        </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground max-w-sm italic leading-tight">
                        Currently migrating legacy Community API endpoints to the new 
                        <span className="text-foreground font-bold"> Exception-Driven Model </span> 
                        deployed in the v0.8 Identity Suite.
                    </p>
                </div>
                </div>

            </section>

        </div>
    )
}