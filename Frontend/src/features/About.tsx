import { Link } from 'react-router-dom';
// import {Popover,PopoverContent,PopoverTrigger} from "@/components/ui/popover"


export default function About() {

    return (
        <div className="space-y-12 max-w-6xl mx-auto px-6 py-12">
        
        {/* SECTION 1: PROJECT OVERVIEW */}
        <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">
                Project Overview
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                System Architecture & Origins
            </p>
            </div>

            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed font-medium">
            <p>
                This project started as a way for me to learn <span className="text-blue-400">C# and backend development</span> by building a simple API. 
                After creating a small AI chatbot API and working with SQL data, I realised I enjoyed building data-driven backend services and wanted to expand the idea into something more realistic.
            </p>
            
            <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                <p>
                The result became the <span className="text-emerald-400">Community API Project</span>. 
                This API pulls player and group data from a <span className="text-foreground">SQL Database</span> and exposes it through endpoints so it can be viewed and managed programmatically.
                </p>
            </div>

            <p>
                I then built a <Link to="/jobs" className="text-blue-400 underline hover:text-blue-300">Background Worker</Link> to
                act as a job processor for long-running or automated tasks. This introduced job queues, status tracking, and background services into the system. 
                At this point I merged the API and worker into a single system and decided to host it properly to show the project running in a live environment.
            </p>

            <p>
                This is where I took a dive into <span className="text-foreground">Azure</span> deploying an App Service, configuring a custom domain, 
                and getting the system running in the cloud rather than just locally.
            </p>

            <p>
                The final stage was building a dashboard to interact with everything. I wanted to learn <span className="text-blue-400">React</span>, 
                so I built a dashboard for viewing player stats, logs, permissions, and background jobs. 
                This turned the project from just an API into a full <span className="text-foreground">full-stack system</span>.
            </p>
            </div>
            <Link to="/breakdown" className="text-[10px] font-black uppercase tracking-widest text-emerald-500 underline underline-offset-4 hover:text-emerald-400 transition-colors">
                View Feature Breakdown
            </Link>           
        </div>

        <section className="space-y-8">
            <div className="border-l-4 border-emerald-500 pl-4">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                Evolution & Experience
            </h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">
                12 Years of Technical Persistence
            </p>
            </div>
            <div className="space-y-6 text-muted-foreground leading-relaxed mt-8">
                <p>
                Hi, I'm <span className="text-foreground font-bold italic text-lg">Declan</span>. 
                I'm a self-taught developer who prefers building systems and solving problems hands-on rather than just reading about them. 
                I learn best by working with unfamiliar codebases, reverse engineering systems, and shipping functional, data-driven tools.
                </p>

                <div className="bg-white/5 border border-white/10 p-4 rounded-sm italic text-muted-foreground">
                    "I’ve always had a drive for engineering. Whether it's dismantling a McLaren door card in a hotel car park in Andorra 
                    to fix a failed window regulator or reverse-engineering a legacy SQL framework at 3 AM, I apply that same 
                    <span className="text-foreground"> 'strip it down to fix it' </span> approach to every system I work on."
                </div>

                <p>
                    My technical foundation comes from over a decade of maintaining live systems in gaming environments including 
                    <span className="text-emerald-500 font-mono text-[12px] uppercase tracking-widest font-bold"> Arma 3 (SQF)</span>, 
                    <span className="text-emerald-500 font-mono text-[12px] uppercase tracking-widest font-bold ml-2">FiveM (Lua/JS)</span>, 
                    and most recently, <span className="text-blue-400 font-mono text-[12px] uppercase tracking-widest font-bold ml-2">.NET (C#) & React</span>.
                </p>

                <p>
                    I'm a regular on <span className="text-foreground font-bold">European Road Trips</span>, having navigated thousands of miles through the 
                    <span className="text-foreground"> Arctic Circle</span>, the <span className="text-foreground">Pyrenees</span>, and across <span className="text-foreground">Western Europe</span>. 
                    I’ve also travelled further afield to <span className="text-foreground">Dubai</span> and <span className="text-foreground">Qatar</span> for the <span className="text-foreground">F1</span>. 
                </p>

                <p className="text-sm font-medium border-l-2 border-blue-600 pl-4 bg-blue-600/5 py-2">
                    I am now focused on expanding the <span className="text-foreground font-bold">DecsPage</span> project while transitioning my career into a <span className="text-blue-400 font-bold">Backend-focused Full Stack</span> position.
                </p>

                <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-4">
                    This timeline shows my progression from running game servers as a teenager to building backend systems, APIs, 
                    background services, and full-stack applications.
                </p>
            </div>




            <div className="relative ml-2 space-y-10 border-l border-border pb-4">
            {/* 2012: THE START */}
            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2012 - The Spark
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">SAMP Infrastructure & Framework Basics</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        My first introduction to the world of servers. I managed a local <span className="text-foreground">GTA SAMP environment</span> for friends, 
                        handling everything from <span className="text-foreground">Network Configuration (Port Forwarding)</span> to Server Deployment. 
                        This era was about learning how a backend framework dictates the player experience, 
                        marking my first steps into <span className="text-foreground">Custom Configuration</span> and Game-World Scripting.
                    </p>
                </div>
            </div>

            {/* 2013: Minecraft */}
            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                    2013 - Modded Dedicated Servers
                </span>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Minecraft Modding and Server Hosting</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    This was my first experience managing <span className="text-foreground font-bold">Modded Environments</span>. I built and maintained a highly modified server for a school-based community, handling the complex task of ensuring dozens of disparate mods worked together without conflict. 
                    I managed <span className="text-foreground font-bold text-xs uppercase tracking-widest">Administrative Permissions</span> and server stability, learning the basics of resource allocation and user management in a live multiplayer setting.
                </p>
                </div>
            </div>

            {/* 2014: GMOD */}
            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2014/15 - First Taste of Real Coding
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Garry's Mod & Dedicated Servers</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This was my introduction to backend development. Using an existing framework, I refactored disparate scripts to function as a 
                        <span className="text-foreground"> unified system</span>, building a successful custom <span className="text-foreground italic font-bold">DarkRP community</span> from the ground up.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        Being effectively "on-call" to handle live server issues taught me early lessons about 
                        <span className="text-foreground"> production uptime</span>, stability, and the importance of fixing issues quickly in live environments.
                    </p>          
{/*                     <Popover>
                        <PopoverTrigger asChild>
                        <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 underline underline-offset-4 hover:text-emerald-400 transition-colors">
                            [View Photos]
                        </button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" className="w-[90vw] md:w-250 bg-card border-border p-0 overflow-hidden shadow-2xl z-50">
                        <div className="grid grid-cols-2 gap-px bg-background">
                        <img src="https://media.discordapp.net/attachments/518523556280270848/518523983851814923/5906F544A73767BB964A9C053DAB5332CE34A69F.png?ex=69b66dd7&is=69b51c57&hm=6384e71c0a5911ad2a044a0216fdf83686c8772235dc3afda933b9199d89aeca&=&format=webp&quality=lossless" 
                            alt="Gmod New Year 2015" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity"/>
                            <img src="" 
                            alt="Gmod 2" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            <img src="" 
                            alt="Gmod 3" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            <img src="" 
                            alt="Gmod 4" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-3 bg-card">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">
                            Archive Retrieval: Gmod Life Production Environment (2014-2015)
                            </p>
                        </div>
                        </PopoverContent>
                    </Popover> */}
                </div>
            </div>

            {/* 2017: Arma 3 */}
            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2017/18 - Research & Adaptation
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Entry into Arma 3 & SQF</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        As I transitioned into Arma 3, I challenged myself to adapt my existing logic skills to a new language: <span className="text-foreground font-bold">SQF</span>. 
                        I began building custom features and scripts based on community feedback to master the syntax, eventually developing a unique iteration of the <span className="text-foreground italic">Altis Life Framework</span>.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                        While I didn't launch a public community at the time, this was a critical <span className="text-foreground uppercase tracking-widest text-[10px] font-bold">R&D Phase</span> where I learned to <span className="text-foreground">reverse-engineer</span> complex game architectures and rebuild them to fit a specific vision.
                    </p>
                </div>
            </div>          

            {/* 2021: FiveM */}
            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2021 - Systems Development
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">FiveM Development & System Logic</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        I would describe this as a major turning point in my <span className="text-foreground">technical confidence</span>. It was the first time I built complex systems from scratch, learning to trust my own logic and break down large-scale ideas into manageable, modular components.
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2 italic border-l-2 border-white/5 pl-4">
                        During this era, I architected several <span className="text-foreground">player-focused backends</span>, including a transactional <span className="text-emerald-400">banking system</span>, a business management suite, and a high-concurrency robbery framework.
                    </p>
                </div>
            </div>

            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2023/24 - Systems Architecture
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest italic">Arma 3 Framework & Middleware</h3>
                    
                    <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                        <p>
                            As the <span className="text-foreground font-bold">Sole Developer</span> for a large-scale <span className="text-foreground italic">Arma 3 project</span>, I moved beyond game scripting into full <span className="text-foreground">Systems Design</span>. 
                            I took complete control of the framework, implementing new features, updating existing features to fit the end goal and developed custom features including a
                            <span className="text-emerald-400">Faction Contract System</span> and integrating a full-scale <span className="text-emerald-400">Battlegrounds gamemode</span> into the core logic.
                        </p>
                        <p className="border-l-2 border-white/5 pl-4">
                            I also took responsibility for multiple Faction Google Sheets databases and architected a <span className="text-foreground underlin">middleware bridge</span> between <span className="text-foreground">Google Apps Script</span> and a <span className="text-foreground">MySQL backend</span> to automate player whitelisting and rank management. This included real-time synchronisation and automated failure alerts via <span className="text-blue-400 font-bold">Discord Webhooks</span>.
                        </p>
                    </div>
                </div>
            </div>
         
            <div className="relative pl-8 border-l border-border pb-5">
                {/* The Pulsing Dot shows you're still "Active" or "On-Call" */}
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2024 / Present - Lead Development
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest italic">Systems Oversight & Emergency Response</h3>
                    
                    <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                        <p>
                            I was <span className="text-foreground font-bold">recommended</span> to this community as a developer and quickly took ownership of the framework. 
                            I specialised in resolving critical issues caused by merged architectures and legacy technical debt, 
                            which involved reverse engineering complex logic, writing optimised SQL procedures, and restructuring database systems for long-term stability.
                        </p>
                        <p className="border-l-2 border-white/5 pl-4 italic">
                            I became the primary 'escalation' developer—handling everything from mentoring others to <span className="text-foreground">3am emergency patches</span> for live production issues. Balancing this with a full-time career taught me the reality of <span className="text-foreground">High-Availability</span>. While I still hold a Lead position, I have stepped back to focus on the professional <span className="text-blue-400 font-bold underline">C# & React pivot</span> seen on this dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Today C# */}
            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                    Present - The Professional Pivot
                </span>
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">Dotnet, C# and React</h3>
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                    <p>
                        After working on personal projects and reflecting on where my technical interests were heading, 
                        I decided to focus on <span className="text-blue-400 font-bold">C# and backend development</span>.
                        I quickly got comfortable with the language, and building the <span className="text-foreground font-bold italic underline decoration-white/20">Community API</span> introduced me to 
                        <Link to="/breakdown#security" className="text-blue-400 underline hover:text-blue-300 transition-all ml-1">JWT Security</Link>, 
                        <Link to="/breakdown#sql" className="text-blue-400 underline  hover:text-blue-300 transition-all ml-1">SQL Performance</Link>, 
                        and 
                        <Link to="/breakdown#azure" className="text-blue-400 underline hover:text-blue-300 transition-all ml-1">Cloud Deployment on Azure</Link>.
                    </p>
                    
                    <div className="border-l-2 border-emerald-500 pl-4 py-1 bg-emerald-500/5">
                        <p className="text-muted-foreground">
                            I plan to continue expanding the <span className="font-bold text-foreground tracking-tight">DecsPage</span> project while transitioning my career into a <span className="text-emerald-400 font-bold italic">Backend-focused Full Stack</span> position.
                        </p>
                    </div>
                </div>
                </div>
            </div>

            <div className="relative pl-8 border-l border-border pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-blue-400 uppercase tracking-tighter">
                    Next Step
                    </span>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                    Backend Engineering Career
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                    My current focus is moving into a professional backend engineering role, continuing to build systems using 
                    <span className="text-foreground"> C#, .NET, SQL, React, and Cloud Infrastructure</span>, and expanding the 
                    <span className="text-foreground"> DecsPage </span> project into a larger platform.
                    </p>
                </div>
            </div>

            </div>
        </section>
        </div>

    )
} 


{/* 2021: FiveM - Skill Grid Add-on */}
{/*                 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Complex State Management</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Relational SQL Databases</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Event-Driven Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Multi-System Integration</span>
                </div>
                </div> */}