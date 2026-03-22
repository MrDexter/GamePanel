export default function LoadingOverlay({ 
  isVisible, 
  message = "Loading..." 
}: { isVisible: boolean, message?: string }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-card/40 backdrop-blur-md transition-all duration-500">
      <div className="flex flex-col items-center gap-6 p-8 border border-white/5 bg-card/50 rounded-sm shadow-2xl">
        <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-600/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-600 animate-spin" />
        </div>
        
        <div className="text-center space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">
                {message}
            </p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-foreground">
                Your request is being processed...
            </p>
        </div>
      </div>
    </div>
  );
}
