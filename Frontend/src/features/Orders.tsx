import { useState, useEffect } from 'react'
// import { toast } from "sonner"
import {Input } from "@/components/ui/input"
import {Button } from "@/components/ui/button"
import {Badge } from "@/components/ui/badge"
import { Card, CardContent} from "@/components/ui/card"
import { formatMoney, formatDate, useQueryParams} from "@/lib/constants"
// import { useNavigate } from "react-router-dom"
import { apiFetch } from "@/lib/api"
// import LoadingOverlay from "@/components/modals/Loading"
import { X, ArrowUp, ChevronRight, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"


export default function Orders() {
    const { user, perms } = useAuth();
    // const navigate = useNavigate();
    const { searchParams, updateParams } = useQueryParams();
    const search = searchParams.get("search") ?? "";
    const [searchInput, setSearchInput] = useState(search ?? "");
    const orderby = searchParams.get("orderby") ?? "id";
    const direction = searchParams.get("direction") ?? "asc";
    const [adminMode, setAdminMode] = useState(false);
    // const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));

    const ORDER_OPTIONS = [
        { value: "id", label: "ID" },
        { value: "price", label: "Price"},
        { value: "status", label: "Status"}
    ] as const;

    useEffect(() => {
      const timeout = setTimeout(() => {
          updateParams({ search: searchInput, page: 1 });
      }, 300);

      return () => clearTimeout(timeout);
    }, [searchInput]);

    const fetchOrders = async () => {
        try {
            // setIsLoading(true);
            const res = await apiFetch("GET", `/shop/orders?search=${search}&limit=${itemPerPage}&offset=${offset}&orderby=${orderby}&direction=${direction}&adminMode=${adminMode}`)
            if (!res.ok) {
                setOrders([]);
            };
            const data = await res.json();
            setOrders(data.orders);
            setTotalRows(data.totalRows)
        } catch (error) {
            setOrders([]);
            console.error("Fetch Error", error);
        }
    };

    useEffect(() => {
        const delayedSearch = setTimeout(async () => {
            // setIsLoading(true);
            fetchOrders()
        }, search.trim() ? 500 : 0);
        return () => clearTimeout(delayedSearch)
    }, [search, orderby, direction, currentPage, adminMode]);
return (
  <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
    <div className="bg-card border border-border rounded-2xl p-5 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
            Account
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            View purchase history, payment status and fulfilment progress.
          </p>
        </div>
      </div>

      {/* Controls */}
      <Card className="bg-background/50 border-border/50">
        <CardContent className="px-3 py-0">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Order
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-7 px-2.5 text-[11px] uppercase text-foreground border-border hover:bg-card cursor-pointer"
                  >
                    {ORDER_OPTIONS.find((opt) => opt.value === orderby)?.label ?? orderby}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-40 bg-card border-border text-muted-foreground">
                  {ORDER_OPTIONS
                    .filter((opt) => opt.value !== orderby)
                    .map((opt) => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => updateParams({ orderby: opt.value, direction: null })}
                        className="text-xs cursor-pointer focus:bg-background focus:text-foreground"
                      >
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={() => updateParams({ direction: direction === "asc" ? "desc" : "asc" })}
                className="h-8 w-8 border-border text-muted-foreground hover:text-foreground hover:bg-card cursor-pointer"
              >
                <ArrowUp
                  className={`h-3.5 w-3.5 transition-transform ${
                    direction === "desc" ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </div>

            <div className="flex items-center gap-1 w-full md:w-96">
                {(user?.adminlevel ?? 0) >= (perms?.admin?.ORDER_MANAGEMENT ?? 99) &&(
                    
                <Button
                    onClick={() => setAdminMode(!adminMode)}
                    className={`h-6 px-2 text-[10px] rounded-md uppercase whitespace-nowrap transition-colors cursor-pointer ${
                    adminMode
                        ? "bg-emerald-700/40 text-foreground border border-emerald-500 hover:bg-emerald-800/50"
                        : "bg-card text-muted-foreground border border-border hover:bg-background hover:text-foreground"
                    }`}
                >
                    Admin
                </Button>
                )}

                <div className="relative flex-1 bg-card rounded-xl">
                    <Input
                    placeholder="Search Orders..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") setSearchInput("");
                    }}
                    className="h-7 pr-9"
                    />

                    <button
                    onClick={() => setSearchInput("")}
                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded transition-all ${
                        searchInput
                        ? "opacity-100 hover:bg-background text-muted-foreground hover:text-foreground"
                        : "opacity-0 pointer-events-none"
                    }`}
                    >
                    <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {orders.map((order) => {
        const statusStyle =
            order.status === "complete"
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                : order.status === "open"
                ? "border-red-500 text-red-500 bg-red-500/5"
                : order.status === "expired"
                    ? "border-amber-500 text-amber-500 bg-amber-500/5"
                    : "border-border text-muted-foreground bg-card";

            const paymentStyle =
                order.paymentStatus === "paid"
                    ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                    : "border-red-500 text-red-500 bg-red-500/5";
        
        return(
          <Card key={order.id} className="bg-background/75 border-border">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-foreground">
                      Order #{order.id}
                    </span>

                    <Badge variant="outline" className={`text-[10px] uppercase ${statusStyle}`}>
                    {order.status === "open" ? "Failed" : order.status}
                    </Badge>

                    <Badge variant="outline" className={`text-[10px] uppercase ${paymentStyle}`}>
                    {order.status === "open" ? "Declined" : order.paymentStatus}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {order?.basket?.map((item : any)=> (
                        item.productName ?? ""
                    ))}
                  </p>

                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Purchased {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Amount</p>
                    <p className="font-bold text-foreground">
                      {formatMoney(order.amountPence / 100)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Receiver</p>
                    <p className="font-mono text-xs text-foreground truncate">
                      {order.receiverId === user?.SteamID ? "You" : order.receiverId}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Updated</p>
                    <p className="text-xs text-foreground">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-end">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="w-full"
                    >
                      View
                    </Button> */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )})}
      </div>

      {/* Footer / Pagination */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-1 py-4 border-t border-border">
        <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
          Showing {totalRows === 0 ? 0 : offset + 1} to{" "}
          {Math.min(offset + itemPerPage, totalRows)} of {totalRows} products
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentPage <= 1}
            onClick={() => updateParams({ page: currentPage - 1 })}
            className="p-2 border border-border hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center px-4 text-xs font-mono text-foreground">
            {currentPage > totalPages ? "1" : currentPage} / {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => updateParams({ page: currentPage + 1 })}
            className="p-2 border border-border hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

    </div>
  </div>
);
}