import { useParams, Link } from "react-router-dom";

export default function Future() {
const { name } = useParams();
return(
<div className="max-w-6xl mx-auto px-6 py-12">
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6">



    {/* Main Content */}
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">

      <p className="text-foreground leading-relaxed">
        Hi {name}, welcome to your future. Hopefully.
      </p>

      <p className="text-foreground leading-relaxed">
        First things first, I’m not crazy. This uses nerd magic for your name.
        It would be weird if I made this specifically for you… right?
      </p>

        <p className="text-foreground leading-relaxed">
        This is a hidden part of my “portfolio” because I’ve decided I want a
        cool corporate (ideally London) software developer job
        <span className="text-emerald-500 font-semibold ml-1">(Ambition)</span>.
        But I’d also love someone just as (probably slightly cooler) to cry to
        when I can’t work out how to fix something
        <span className="text-emerald-500 font-semibold ml-1">(Emotional Intelligence)</span>.
        </p>

      <p className="text-foreground leading-relaxed">
        Feel free to snoop. But I’d rather show you in person and accidentally
        get overexcited while you… catch feelings.
      </p>

      {/* Sections */}
      <section id="about" className="scroll-mt-20 space-y-2 pt-4 border-t border-border">
        <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">
        About Me
        </h2>

        <p className="text-sm text-foreground">
        The best way to start is to imagine your dream man... then throw that idea out the window because that’s unrealistic. Let’s be reasonable here.
        </p>

        <p className="text-sm text-foreground">
        I’m <span className="text-emerald-500 font-semibold">6'2</span> and I
        <span className="text-emerald-500 font-semibold ml-1">work out</span>.
        I know what you’re thinking “dream, how is he still <span className="text-emerald-500 font-semibold">single</span>?” Well {name} we are only getting started.
        </p>

        <p className="text-sm text-foreground">
        I also <span className="text-emerald-500 font-semibold">like to work </span>
        (I know, stay calm, you can do this) and have done since I was about 12,
        whether that was working school holidays or building my own projects, which you can read about{" "}
        <Link to="/about" className="underline text-blue-500">
            here
        </Link>. (Don't)
        </p>

        <p className="opacity-0">
            ---
        </p>

        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500">
        Travel Resume
        </h3>

        <p className="text-sm text-foreground">
        I love <span className="text-emerald-500 font-semibold">travelling</span> and would love <span className="text-emerald-500 font-semibold">someone to share that with</span>.
        I love road trips and have been across southern Germany, the Pyrenees, and France on multiple occasions.
        </p>

        <p className="text-sm text-foreground">
        My best one was Scandinavia, hitting Stockholm and travelling all the way up to the Arctic Circle, where I saw the northern lights.
        I also love a good city break and have done Dubai, Qatar (for the F1), and recently Budapest for the <span className="text-emerald-500 font-semibold">Christmas markets</span>, to name a few.
        </p>

        <p className="text-sm text-foreground">
        A few dream destinations are
        <span className="text-emerald-500 font-semibold ml-1">Italy, California, Nashville, Miami, Tokyo</span>,
        and maybe even
        <span className="text-emerald-500 font-semibold ml-1">Australia</span>.
        </p>

        <p className="opacity-0">
            ---
        </p>

        <p className="text-sm text-foreground italic">
        “Omg I think I found my husband.” Stopppp, I’m blushing.
        </p>

        <p className="opacity-0">
            ---
        </p>

        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500">
        Music Addiction
        </h3>

        <p className="text-sm text-foreground">
        I’m obsessed with <span className="text-emerald-500 font-semibold">music</span>.
        150k+ minutes last year, 1900+ artists.
        </p>

        <p className="text-sm text-foreground">
        <span className="text-emerald-500 font-semibold">Post Malone</span> has been #1 for 6 years,
        but I’ll listen to anything, current favourites; 
        <span className="text-emerald-500 font-semibold ml-1">
            Noah Kahan, Sam Fender, The 1975, Olivia Dean, Blackbear Morgan Wallen...
        </span>
        </p>

        <p className="text-sm text-foreground">
        <span className="text-emerald-500 font-semibold">Country, Pop, Folk, White girl</span> (Thats the official name right?).
        Emotional music. <span className="text-emerald-500 font-semibold">(More Emotional Intelligence)</span>
        </p>

        <p className="opacity-0">
            ---
        </p>
        
        <p className="text-sm text-foreground italic">
        “Our road trips are going to be so funnnn…” {name}, breathe I haven’t even planned the date yet
        </p>

        <p className="opacity-0">
            ---
        </p>

        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500">
        Cars Are Cool
        </h3>

        <p className="text-sm text-foreground">
        I do like <span className="text-emerald-500 font-semibold">cars</span>, and a lot of my travelling or event attendance tends to involve them.
        Fancy car events are a great excuse to <span className="text-emerald-500 font-semibold">dress up</span> and an even better reason for a <span className="text-emerald-500 font-semibold">weekend away</span>.
        </p>

        <p className="text-sm text-foreground">
        Don’t worry though, it’s not a requirement. But I would love to dress up with someone and head off to <span className="text-emerald-500 font-semibold">Festival of Speed, Concours of Elegance</span>, or one of the other nice events.
        </p>

        <p className="text-sm text-foreground">
        I’ve got a Golf R, nothing too crazy, I’m being <span className="text-emerald-500 font-semibold">financially responsible</span>.
        It is quite fast, does have... firm suspension, so apologies in advance.
        I may let you drive it for one singular <span className="text-emerald-500 font-semibold">kiss on the cheek</span>, but I’d want to see your car first.
        </p>

        <p className="text-sm text-foreground">
        I like modified cars, and mine is modified too, but it also has heated leather seats and upgraded audio for all the car karaoke sessions and road trips.
        </p>

        <p className="opacity-0">
            ---
        </p>
        
        <p className="text-sm text-foreground italic">
        “I’m gonna be the best passenger princess” I agree but at this point, maybe you should plan the date…
        </p>

        <p className="opacity-0">
            ---
        </p>

        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500">
        Personality Traits
        </h3>

        <p className="text-sm text-foreground">
        Very <span className="text-emerald-500 font-semibold">sarcastic</span>. 
        Very <span className="text-emerald-500 font-semibold">playful</span>. 
        Slightly annoying. 
        Quite <span className="text-emerald-500 font-semibold">affectionate</span> and <span className="text-emerald-500 font-semibold">touchy</span>.
        Definitely <span className="text-emerald-500 font-semibold">not nonchalant</span>.
        </p>

        <p className="text-sm text-foreground">
        I’m naturally an introvert, but I love events, dressing up, and people watching.
        You will probably have to help with outfits because that is definitely not my strong point.
        </p>

        <p className="text-sm text-foreground">
        Jokes aside, I do care a lot. I’m the type to 
        <span className="text-emerald-500 font-semibold">remember way too much about you</span>, 
        run every scenario through my head, and still somehow be unprepared, 
        panicking about the smallest things, but completely fine in the biggest moments.
        <span className="text-emerald-500 font-semibold ml-1">Airports? Easy.</span>
        </p>

        <p className="text-sm text-foreground">
        I’m not the best at organising. I like knowing what I’m doing and having a plan… 
        I just don’t put it in place until the last minute.
        For example, I hate that concerts have to be booked months in advance. 
        I’d rather decide a week before and just go.
        </p>

        <p className="opacity-0">
            ---
        </p>

        <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-500">
        What do I want?
        </h3>

        <p className="text-sm text-foreground">
        <span className="text-emerald-500 font-semibold">You? </span> 
        No… well, maybe. But seriously something <span className="text-emerald-500 font-semibold">long-term</span>, 
        something worth the time.
        </p>

        <p className="text-sm text-foreground">
        We can’t promise anything, but we can try. Just <span className="text-emerald-500 font-semibold">not a situationship </span> 
        that’s too much to explain to my Nan.
        </p>

        <p className="text-sm text-foreground">
        I want to make memories, build cool stories, have fun, make questionable decisions… 
        and maybe build something with the right person.
        </p>
        

      </section>

      <section id="green" className="scroll-mt-20 space-y-2 pt-4 border-t border-border">
        <h2 className="text-sm font-black uppercase tracking-widest text-emerald-500">
          Green Flags
        </h2>
        <ul className="text-sm text-foreground space-y-1">
        <li>• Can cook (an egg… unless it misses the pan)</li>
        <li>• Ambitious and hard working but not boring</li>
        <li>• Very handsy, fixing things, taking stuff apart, putting it back together (usually works)… I meant handy. Probably</li>
        <li>• Good listener (when I’m actually listening)</li>
        <li>• Always happy to drive</li>
        <li>• Unintentionally funny, will tease you (nicely, probably)</li>
        <li>• Effort, flowers, affection and reels = bare minimum (I’m more “I wanna go out, I’ll be there in 30 mins” than “let’s plan for next week”)</li>
        <li>• Love dogs so much, I would trade you for one (maybe two… you’re kinda cute)</li>
        <li>• Easily pleased. Cook me anything, pick me an outfit… feelings caught</li>
        <li>• Will hype you up for absolutely no reason "yesss queen, that outfit kills", "hit that solo, meow"</li>
        <li>• Will remember a lot of random things about you (but forget what you just said)</li>
        <li>• 6 belly, some arm muscles (can carry you… when your feet hurt from all the hot girl walking)</li>
        </ul>
      </section>

      <section id="red" className="scroll-mt-20 space-y-2 pt-4 border-t border-border">
        <h2 className="text-sm font-black uppercase tracking-widest text-red-500">
          Red Flags
        </h2>
        <ul className="text-sm text-foreground space-y-1">
        <li>• Will overanalyse and overthink everything</li>
        <li>• If you say you don’t like something, I suddenly really want to do it (within reason… think Crocs)</li>
        <li>• Might forget to listen (your eyes existed, then there was a fly)</li>
        <li>• Will ask weird questions (curiosity, not insanity)</li>
        <li>• Hate shopping, too many options, brain shuts down</li>
        <li>• You could wave a sign saying “kiss me” and I’d wonder where the sign came from</li>
        <li>• Terrible texter. I meant to reply, I planned to reply… I didn’t. Sorry. Call me out</li>
        <li>• Will bully you… in a loving way. I love your big forehead, less chance of eating hair</li>
        <li>• Should wear glasses for computer use… lost them in 2017 (can bring them back if that’s your thing)</li>
        </ul>
      </section>

        <section id="dates" className="scroll-mt-20 space-y-2 pt-4 border-t border-border">
        <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">
            Date Ideas
        </h2>

        <ul className="text-sm text-foreground space-y-1">
            <li>• Something spontaneous, no plan, just vibes</li>
            <li>• Coffee + walk (safe option)</li>
            <li>• Cooking together (you cook, I dance around you… mainly in the way, definitely annoying)</li>
            <li>• M&S picky bits and a picnic (beach, park, scenic spot)</li>
            <li>• Car karaoke and chicken (Wingstop?)</li>
            <li>• Late night drive, music too loud, deep conversations</li>
            <li>• Dress up, go somewhere nice. London… or McDonald’s</li>
            <li>• Natural History Museum and your best dinosaur impression</li>
            <li>• The zoo (*entering the hippo enclosure* “omg is that your mum”)</li>
            <li>• Coffee shop, you read, I code, your feet on my lap</li>
            <li>• Weekly date night trying a new food place (street, restaurant… bin)</li>
            <li>• Holiday / weekend away</li>
            <li>• Couples massage, but we pretend we’re a posh married couple</li>
            <li>• Skip the date, smooch, and watch my unintentional R2D2 impression</li>
            <li>• No date, friendzoned, buy a dog</li>
        </ul>
        </section>

    <section id="contact" className="scroll-mt-20 space-y-4 pt-4 border-t border-border">

    <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">
        Contact Info
    </h2>

    <p className="text-sm text-foreground">
        I know what you're thinking, how do I make this man mine?
        Well {name} the preferred method is something bold and direct… 
        “You’re taking me on a date.”
        I won’t tell the girls, might use it as leverage though.
        I do however, completely understand you have an image to maintain, so I’ll also accept:
    </p>

    <ul className="text-sm text-foreground space-y-1">
        <li>• 3–5 current favourite songs</li>
        <li>• Your favourite reel (funny, unhinged, or slightly flirty)</li>
        <li>• Your dream trip… and our first trip</li>
        <li>• Your ideal date (I’m not cheating, I’ll just improve it)</li>
    </ul>

    <p className="text-sm text-foreground">
        Feel free to pick more than one… I’m blushing already.
    </p>

    <h2 className="text-sm font-black uppercase tracking-widest text-blue-500 pt-4">
        Contact Details
    </h2>

    <ul className="text-sm text-muted-foreground space-y-1">
        <li>• Instagram: <a
            href="https://instagram.com/decpage_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
        > decpage_ </a></li>
        <li className="flex flex-wrap items-center gap-2">
        <span>• Email:</span>
        <a
            href="mailto:declanpage100@gmail.com?subject=We%20are%20going%20on%20a%20date&body=Hi%2C%20I%20have%20reviewed%20your%20impressive%20portfolio%20and%20would%20like%20to%20proceed%20to%20the%20dating%20stage"
            className="text-blue-500 hover:underline break-all"
        > declanpage100@gmail.com </a>
        <span className="text-xs text-muted-foreground w-full">
            (Click the Email for fun)
        </span>
        </li>
    </ul>

    </section>

    </div>

    {/* Side Nav */}
    <div className="hidden lg:block">
      <div className="sticky top-24 bg-card border border-border rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Contents
        </p>

        <a href="#about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          About Me
        </a>
        <a href="#green" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          Green Flags
        </a>
        <a href="#red" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          Red Flags
        </a>
        <a href="#dates" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          Date Ideas
        </a>
        <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
          Contact Info
        </a>
      </div>
    </div>

  </div>
</div>
)}