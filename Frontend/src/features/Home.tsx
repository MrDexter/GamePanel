import { Link } from 'react-router-dom';
// import {Popover,PopoverContent,PopoverTrigger} from "@/components/ui/popover"


export default function Home() {

    return (
        <div className="space-y-12 max-w-6xl mx-auto px-6 py-12">
        
        {/* SECTION 1: PROJECT OVERVIEW */}
        <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-4">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">
                Project Overview
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
                System Architecture & Origins
            </p>
            </div>

            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed font-medium">
            <p>
                This project began as a deep dive into <span className="text-blue-400">C# and Backend development</span>. 
                After building a simple AI Chatbot API, I saw how much potential there was for handling data. 
                It also reminded me of an API system I had used years ago, so I decided to try and recreate it.
            </p>
            
            <div className="bg-white/5 border border-white/10 p-4 rounded-sm">
                <p>
                I quickly built the <span className="text-emerald-400">Community API Project</span>. 
                This pulls player and group data from an <span className="text-white">SQL Database </span> 
                to be viewed and managed through the API.
                </p>
            </div>

            <p>
                I then wanted to try something different, so I built a <Link to="/jobs" className="text-blue-400 underline hover:text-blue-300">Background Worker</Link> as a job processor. 
                I merged these two ideas together and decided to host them properly to show the code actually working. This is where I took a dive into <span className="text-white">Azure</span> I launched an App Service, configured a custom domain, and got the project live.
            </p>

            <p>
                My final step was to build a dashboard to view and test everything. I had seen <span className="text-blue-400">React</span> and 
                wanted to check it out; with the help of some AI for the initial design, the <Link to="/stats" className="text-blue-400 underline hover:text-blue-300">Stats Page</Link> was born.
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
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">
                12 Years of Technical Persistence
            </p>
            </div>
            <div className="space-y-6 text-zinc-300 leading-relaxed mt-8">
                <p>
                    Hi, I'm <span className="text-white font-bold italic text-lg">Declan</span>. I’m a 25-year-old self-taught developer who prefers 
                    getting stuck in and building over talking. I learn by getting hands-on with unfamiliar codebases and shipping 
                    functional, data-driven tools.
                </p>

                <div className="bg-white/5 border border-white/10 p-4 rounded-sm italic text-zinc-400">
                    "I’ve always had a drive for engineering. Whether it's dismantling a McLaren door card in an Andorra hotel car park 
                    to fix a failed window regulator or reverse-engineering a legacy SQL framework at 3 AM, I apply that same 
                    <span className="text-white"> 'strip it down to fix it' </span> approach to every system I touch."
                </div>

                <p>
                    My technical foundation comes from over a decade of maintaining live systems in gaming environments including 
                    <span className="text-emerald-500 font-mono text-[12px] uppercase tracking-widest font-bold"> Arma 3 (SQF)</span>, 
                    <span className="text-emerald-500 font-mono text-[12px] uppercase tracking-widest font-bold ml-2">FiveM (Lua/JS)</span>, 
                    and most recently, <span className="text-blue-400 font-mono text-[12px] uppercase tracking-widest font-bold ml-2">.NET (C#) & React</span>.
                </p>

                <p>
                    I'm a regular on <span className="text-white font-bold">European Road Trips</span>, having navigated thousands of miles through the 
                    <span className="text-white"> Arctic Circle</span>, the <span className="text-white">Pyrenees</span>, and across <span className="text-white">Western Europe</span>. 
                    I’ve also travelled further afield to <span className="text-white">Dubai</span> and <span className="text-white">Qatar</span> for the <span className="text-white">F1</span>. 
                </p>

                <p className="text-sm font-medium border-l-2 border-blue-600 pl-4 bg-blue-600/5 py-2">
                    I am now focused on expanding the <span className="text-white font-bold">DecsPage</span> project while transitioning my career into a <span className="text-blue-400 font-bold">Backend-focused Full Stack</span> position.
                </p>
            </div>




            <div className="relative ml-2 space-y-10 border-l border-zinc-800 pb-4">
            {/* 2012: THE START */}
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2012 - The Spark
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">SAMP Infrastructure & Framework Basics</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        My first introduction to the world of servers. I managed a local <span className="text-white">GTA SAMP environment</span> for friends, 
                        handling everything from <span className="text-white">Network Configuration (Port Forwarding)</span> to Server Deployment. 
                        This era was about learning how a backend framework dictates the player experience, 
                        marking my first steps into <span className="text-white">Custom Configuration</span> and Game-World Scripting.
                    </p>
                </div>
            </div>

            {/* 2013: Minecraft */}
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                    2013 - Modded Dedicated Servers
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Minecraft Modding and Server Hosting</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                    This was my first experience managing <span className="text-white font-bold">Modded Environments</span>. I built and maintained a highly modified server for a school-based community, handling the complex task of ensuring dozens of disparate mods worked together without conflict. 
                    I managed <span className="text-white font-bold text-xs uppercase tracking-widest">Administrative Permissions</span> and server stability, learning the basics of resource allocation and user management in a live multiplayer setting.
                </p>
                </div>
            </div>

            {/* 2014: GMOD */}
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2014/15 - First Taste of Real Coding
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Garry's Mod & Dedicated Servers</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        This was my introduction to backend development. Using an existing framework, I refactored disparate scripts to function as a 
                        <span className="text-white">unified system</span>, building a successful custom <span className="text-white italic font-bold">DarkRP community</span> from the ground up.
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                        Being "on-call" 24/7 to handle live server criticals taught me the reality of <span className="text-white">production uptime</span>. 
                        Everything was managed manually via <span className="text-white">FTP</span>—a far cry from the modern <span className="text-blue-400">CI/CD pipelines</span> I use today—but it formed the foundation of my technical discipline.
                    </p>          
{/*                     <Popover>
                        <PopoverTrigger asChild>
                        <button className="text-[10px] font-black uppercase tracking-widest text-emerald-500 underline underline-offset-4 hover:text-emerald-400 transition-colors">
                            [View Photos]
                        </button>
                        </PopoverTrigger>
                        <PopoverContent side="bottom" className="w-[90vw] md:w-250 bg-zinc-950 border-zinc-800 p-0 overflow-hidden shadow-2xl z-50">
                        <div className="grid grid-cols-2 gap-px bg-zinc-800">
                        <img src="https://media.discordapp.net/attachments/518523556280270848/518523983851814923/5906F544A73767BB964A9C053DAB5332CE34A69F.png?ex=69b66dd7&is=69b51c57&hm=6384e71c0a5911ad2a044a0216fdf83686c8772235dc3afda933b9199d89aeca&=&format=webp&quality=lossless" 
                            alt="Gmod New Year 2015" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity"/>
                            <img src="" 
                            alt="Gmod 2" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            <img src="" 
                            alt="Gmod 3" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity" />
                            <img src="" 
                            alt="Gmod 4" className="aspect-video object-cover opacity-80 hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-3 bg-zinc-950">
                            <p className="text-[9px] font-black uppercase tracking-tighter text-zinc-500">
                            Archive Retrieval: Gmod Life Production Environment (2014-2015)
                            </p>
                        </div>
                        </PopoverContent>
                    </Popover> */}
                </div>
            </div>

            {/* 2017: Arma 3 */}
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2017/18 - Research & Adaptation
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Entry into Arma 3 & SQF</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        As I transitioned into Arma 3, I challenged myself to adapt my existing logic skills to a new language: <span className="text-white font-bold">SQF</span>. 
                        I began building custom features and scripts based on community feedback to master the syntax, eventually developing a unique iteration of the <span className="text-white italic">Altis Life Framework</span>.
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed mt-2">
                        While I didn't launch a public community at the time, this was a critical <span className="text-white uppercase tracking-widest text-[10px] font-bold">R&D Phase</span> where I learned to <span className="text-white">reverse-engineer</span> complex game architectures and rebuild them to fit a specific vision.
                    </p>
                </div>
            </div>          

            {/* 2021: FiveM */}
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2021 - The Confidence
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">FiveM Development & System Logic</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        I would describe this as a major turning point in my <span className="text-white">technical confidence</span>. It was the first time I built complex systems from scratch, learning to trust my own logic and break down large-scale ideas into manageable, modular components.
                    </p>
                    <p className="text-sm text-zinc-400 leading-relaxed mt-2 italic border-l-2 border-white/5 pl-4">
                        During this era, I architected several <span className="text-white">player-focused backends</span>, including a transactional <span className="text-emerald-400">banking system</span>, a business management suite, and a high-concurrency robbery framework.
                    </p>
                </div>
            </div>

            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2023/24 - Systems Architecture
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest italic">Arma 3 Framework & Middleware</h3>
                    
                    <div className="text-sm text-zinc-400 leading-relaxed space-y-4">
                        <p>
                            As the <span className="text-white font-bold">Sole Developer</span> for a large-scale <span className="text-white italic">Arma 3 project</span>, I moved beyond game scripting into full <span className="text-white">Systems Design</span>. 
                            I took complete control of the framework, implementing new features, updating existing features to fit the end goal and developed custom features including a
                            <span className="text-emerald-400">Faction Contract System</span> and integrating a full-scale <span className="text-emerald-400">Battlegrounds gamemode</span> into the core logic.
                        </p>
                        <p className="border-l-2 border-white/5 pl-4">
                            I also took responsibility for multiple Faction Google Sheets databases and architected a <span className="text-white underlin">middleware bridge</span> between <span className="text-white">Google Apps Script</span> and a <span className="text-white">MySQL backend</span> to automate player whitelisting and rank management. This included real-time synchronisation and automated failure alerts via <span className="text-blue-400 font-bold">Discord Webhooks</span>.
                        </p>
                    </div>
                </div>
            </div>
         
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                {/* The Pulsing Dot shows you're still "Active" or "On-Call" */}
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                        2024 / Present - Lead Development
                    </span>
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest italic">Systems Oversight & Emergency Response</h3>
                    
                    <div className="text-sm text-zinc-400 leading-relaxed space-y-4">
                        <p>
                            I was <span className="text-white font-bold">recommended</span> to this community as a developer and quickly took ownership of the framework. I specialized in resolving critical issues caused by <span className="text-white">merged architectures</span> and legacy technical debt. This involved <span className="text-white">reverse engineering</span> complex logic to build optimized <span className="text-emerald-400">SQL Procedures</span> and refactoring database structures for long-term stability.
                        </p>
                        <p className="border-l-2 border-white/5 pl-4 italic">
                            I became the primary 'escalation' developer—handling everything from mentoring others to <span className="text-white">3am emergency patches</span> for live production issues. Balancing this with a full-time career taught me the reality of <span className="text-white">High-Availability</span>. While I still hold a Lead position, I have stepped back to focus on the professional <span className="text-blue-400 font-bold underline">C# & React pivot</span> seen on this dashboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Today C# */}
            <div className="relative pl-8 border-l border-zinc-800 pb-5">
                <div className="absolute -left-1.25 top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
                <div className="flex flex-col gap-1">
                <span className="text-xs font-mono font-black text-emerald-500 uppercase tracking-tighter">
                    Present - The Professional Pivot
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Dotnet, C# and React</h3>
                <div className="text-sm text-zinc-300 leading-relaxed space-y-4">
                    <p>
                        After working on personal projects and reflecting on my technical interests, I decided to dive into <span className="text-blue-400 font-bold">C#</span>. 
                        I quickly got comfortable with the language, and building the <span className="text-white font-bold italic underline decoration-white/20">Community API</span> introduced me to 
                        <Link to="/breakdown#security" className="text-blue-400 underline hover:text-blue-300 transition-all ml-1">JWT Security</Link>, 
                        <Link to="/breakdown#sql" className="text-blue-400 underline  hover:text-blue-300 transition-all ml-1">SQL Performance</Link>, 
                        and 
                        <Link to="/breakdown#azure" className="text-blue-400 underline hover:text-blue-300 transition-all ml-1">Cloud Deployment on Azure</Link>.
                    </p>
                    
                    <div className="border-l-2 border-emerald-500 pl-4 py-1 bg-emerald-500/5">
                        <p className="text-zinc-200">
                            I plan to continue expanding the <span className="font-bold text-white tracking-tight">DecsPage</span> project while transitioning my career into a <span className="text-emerald-400 font-bold italic">Backend-focused Full Stack</span> position.
                        </p>
                    </div>
                </div>
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
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Complex State Management</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Relational SQL Databases</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Event-Driven Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Multi-System Integration</span>
                </div>
                </div> */}