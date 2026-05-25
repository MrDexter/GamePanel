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
import ViewOrderModal from '@/components/modals/ViewOrder'
import { X, ArrowUp, ChevronRight, ChevronLeft } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import type { ShopProduct } from '@/types/modals'


export default function Orders() {
    const { user, perms } = useAuth();
    // const navigate = useNavigate();
    const { searchParams, updateParams } = useQueryParams();
    const search = searchParams.get("search") ?? "";
    const [searchInput, setSearchInput] = useState(search ?? "");
    const orderby = searchParams.get("orderby") ?? "id";
    const direction = searchParams.get("direction") ?? "desc";
    const [adminMode, setAdminMode] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(0);
    const isViewOrderOpen = searchParams.get("viewOrder") === "true";
    // const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const currentPage = Number(searchParams.get("page") ?? 1);
    const [totalRows, setTotalRows] = useState(1);
    const itemPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(totalRows / itemPerPage));
    const offset = Math.max(0, (itemPerPage * (currentPage - 1)));

    // Statuses
    const ALL_STATUSES = ["complete","failed"];
    const ALL_STATUSES_ADMIN = [...ALL_STATUSES, "incomplete"];
    const STATUSLIST = adminMode ? ALL_STATUSES_ADMIN : ALL_STATUSES;
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(ALL_STATUSES);
    const statusesFromUrl = searchParams.get("statuses");

    useEffect(() => {
        if (statusesFromUrl) {
            setSelectedStatuses(statusesFromUrl.split(",").map(s => s.toLowerCase()));
        } else {
            setSelectedStatuses(STATUSLIST);
        }
    }, [statusesFromUrl]);

    useEffect(() => {
      const timeout = setTimeout(() => {
          updateParams({ search: searchInput, page: null });
      }, 300);

      return () => clearTimeout(timeout);
    }, [searchInput]);

    const statuses = selectedStatuses.length === STATUSLIST.length ? "" : selectedStatuses.join(",");

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev => {
            let next;
            if (prev.includes(status)) {
                next = prev.filter(s => s !== status);
            } else {
                next = [...prev, status];
            }
            updateParams({
                statuses: next.length === STATUSLIST.length ? "" : next.join(","),
                page: null
            });
            return next;
        });
    };
    const resetStatuses = () => {
        setSelectedStatuses(ALL_STATUSES);
        updateParams({ statuses: "", page: null });
    };

    const ORDER_OPTIONS = [
        { value: "id", label: "ID" },
        { value: "price", label: "Price"},
        { value: "status", label: "Status"}
    ] as const;

    useEffect(() => {
      const timeout = setTimeout(() => {
          updateParams({ search: searchInput, page: null });
      }, 300);

      return () => clearTimeout(timeout);
    }, [searchInput]);

    const fetchOrders = async () => {
        try {
            // setIsLoading(true);
            const res = await apiFetch("GET", `/shop/orders?search=${search}&limit=${itemPerPage}&offset=${offset}&orderby=${orderby}&direction=${direction}&adminMode=${adminMode}&statuses=${statuses}`);
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
    }, [search, orderby, direction, currentPage, adminMode, statuses]);
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

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase text-muted-foreground min-w-15">
                  Include:
              </span>

              {STATUSLIST.map((status) => {
                  const active = selectedStatuses.includes(status);

                  return (
                  <Button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`h-7 px-2.5 text-xs rounded-sm uppercase transition-colors cursor-pointer
                      ${
                          active
                          ? "bg-emerald-700/40 text-foreground border-emerald-500 hover:bg-emerald-800/50"
                          : "bg-card text-muted-foreground border-border hover:bg-background hover:text-foreground"
                      }`}
                  >
                      {status}
                  </Button>
                  );
              })}

              {selectedStatuses.length < ALL_STATUSES.length && (
                  <Button
                  onClick={resetStatuses}
                  className="h-7 px-2.5 text-xs rounded-sm bg-card text-foreground border-border hover:bg-background hover:text-foreground flex items-center gap-1"
                  >
                  <X className="h-3.5 w-3.5" />
                  Reset
                  </Button>
              )}
              </div>
            </div>

            <div className="flex items-center gap-1 w-full md:w-96">
                {(user?.adminlevel ?? 0) >= (perms?.admin?.ORDER_MANAGEMENT ?? 99) &&(
                    
                <Button
                    onClick={() => {resetStatuses(); setAdminMode(!adminMode);}}
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

            const isGift = order?.basket?.some((item: ShopProduct) => item.isGift);
        
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
                    {order?.basket?.map((item : ShopProduct)=> (
                        item.name ? item.name + ", " : ""
                    ))}
                  </p>

                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Purchased {formatDate(order.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-end">
                    {isGift && (
                    <div className='justify-items-center min-w-24'>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Gift</p>
                      <p className="text-xs text-blue-500">
                        Yes
                      </p>
                    </div>
                    )}
                    {adminMode && (
                      <div className='justify-items-center min-w-24'>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Purchaser</p>
                          <p className="text-xs text-foreground">
                            {order.purchaserId}
                          </p>
                      </div>
                    )}
                  <div className='justify-items-center min-w-24'>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Amount</p>
                    <p className="font-bold text-foreground">
                      {formatMoney(order.amountPence / 100)}
                    </p>
                  </div>


                  <div className="flex self-end min-w-24">
                    <Button
                      size="sm"
                      onClick={() => {setSelectedOrder(order.id); updateParams({ viewOrder: true })}}
                      className="w-full bg-background text-foreground hover:bg-card hover:text-bold"
                    >
                      View
                    </Button>
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
          {Math.min(offset + itemPerPage, totalRows)} of {totalRows} orders
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
    <ViewOrderModal open={isViewOrderOpen} setOpen={(value) => updateParams({ viewOrder: value ? "true" : null })} selectedOrder ={selectedOrder}/>
  </div>
);
}