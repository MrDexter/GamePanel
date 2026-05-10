import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { formatMoney, formatDate, useQueryParams, copyToClipboard} from "@/lib/constants"
import { apiFetch } from "@/lib/api"
import {Badge } from "@/components/ui/badge"
import { Button } from '../ui/button'
import { Copy } from "lucide-react"
import { useAuth } from '@/lib/AuthContext'
// import { toast } from "sonner"
// import LoadingOverlay from "@/components/modals/Loading"
import { useNavigate  } from "react-router-dom"
// import {Input } from "@/components/ui/input"
import type { OrderLong } from "@/types/modals"

export default function ViewOrderModal({open, setOpen, selectedOrder}: {open: any; setOpen: (val: boolean) => void; selectedOrder: number}) {
    if (!selectedOrder) return null;
    if (!open) return null;
    const { user, perms } = useAuth();
    const { searchParams, updateParams } = useQueryParams();
    // const selectedOrder = searchParams.get("viewOrder") ?? null;
    const [order, setOrder] = useState<OrderLong | null>(null);
    const navigate = useNavigate();

    const fetchOrder = async () => {
        try {
            // setIsLoading(true);
            const res = await apiFetch("GET", `/shop/order/${selectedOrder}`)
            if (!res.ok) {
                setOrder(null);
            };
            const data = await res.json();
            console.log(data);
            setOrder(data);
        } catch (error) {
            setOrder(null);
            console.error("Fetch Error", error);
        }
    };

    useEffect(() => {
        fetchOrder()
    }, []);

    const statusStyle = (status : string) => {
        return status === "complete"
            ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
            : status === "open"
            ? "border-red-500 text-red-500 bg-red-500/5"
            : status === "expired"
                ? "border-amber-500 text-amber-500 bg-amber-500/5"
                : "border-border text-muted-foreground bg-card";
    }

    const paymentStyle = (paymentStatus : string) => {
        return paymentStatus === "paid"
            ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
            : "border-red-500 text-red-500 bg-red-500/5";
    }

    const formatOrderStatus = (status : string) => {
        return status === "open" 
        ? "Failed" 
        : status
    }

    const formatPaymentStatus = (status : string, paymentStatus : string) => {
        return status === "open" 
        ? "Declined" 
        : paymentStatus
    }

    if (user?.steamId != order?.purchaserId) {
        if ((user?.adminlevel ?? 0) < (perms?.admin?.ORDER_MANAGEMENT ?? 99) ){
            updateParams({ viewOrder: null });
            return null;
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/15 hover:scrollbar-thumb-white/25 scrollbar-thumb-rounded-full">
                <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                    <div>
                    <DialogTitle className="text-2xl font-black tracking-tight">
                        Order #{order?.id}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Created {formatDate(order?.createdAt ?? "")}
                    </DialogDescription>
                    </div>

                    <div className="flex gap-2 py-3.75 uppercase">
                    <Badge variant="outline" className={statusStyle(order?.status ?? "")}>
                        {formatOrderStatus(order?.status ?? "")}
                    </Badge>
                    <Badge variant="outline" className={paymentStyle(order?.paymentStatus ?? "")}>
                        {formatPaymentStatus(order?.status ?? "", order?.paymentStatus ?? "")}
                    </Badge>
                    </div>
                </div>
                </DialogHeader>

                <div className="space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-border bg-background/75 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Amount
                    </p>
                    <p className="text-lg font-black">
                        {formatMoney(Number(order?.amountPence || 0) / 100)}
                    </p>
                    </div>

                    <div className="rounded-lg border border-border bg-background/75 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Purchaser
                    </p>
                    <p className="text-xs font-mono truncate">
                        {order?.purchaserId}
                    </p>
                    </div>

                    <div className="rounded-lg border border-border bg-background/75 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Receiver
                    </p>
                    <p className="text-xs font-mono truncate">
                        {order?.purchaserId === order?.receiverId ? "You" : order?.receiverId}
                    </p>
                    </div>

                    <div className="rounded-lg border border-border bg-background/75 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Updated
                    </p>
                    <p className="text-xs">
                        {formatDate(order?.updatedAt ?? "")}
                    </p>
                    </div>
                </div>

                {/* Basket */}
                <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Basket
                    </h3>

                    <div className="rounded-xl border border-border overflow-hidden">
                    {order?.basket.map((item: any, index: number) => (
                        <div
                        key={`${item.productId}-${index}`}
                        className="flex items-center justify-between gap-4 p-4 bg-background/75 border-b border-border last:border-b-0"
                        >
                        <div className="min-w-0">
                            <p className="font-bold text-foreground truncate">
                            {item.productName}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                            {item.productId}
                            </p>
                        </div>

                        <div className="text-right shrink-0">
                            <p className="text-sm font-black">
                            {formatMoney((Number(item.pricePence) || 0) / 100)}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Qty {item.quantity ?? 1}
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                </section>

                {/* Fulfilment */}
                <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Fulfilment
                    </h3>

                    <div className="rounded-xl border border-border bg-background/75 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                        <p className="text-sm font-bold text-foreground">
                            Type
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {"Automatic"}
                        </p>
                        </div>

                        {order?.job ? (
                        <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/5">
                            Job #{order?.job?.id}
                        </Badge>
                        ) : (
                        <Badge variant="outline" className="border-border text-muted-foreground">
                            No Job
                        </Badge>
                        )}
                    </div>

                    {order?.job && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground">Status</p>
                            <p className="text-sm font-bold">{order?.job.status}</p>
                        </div>

                        {/* <div>
                            <p className="text-[10px] uppercase text-muted-foreground">Type</p>
                            <p className="text-sm font-bold">{order?.job.type}</p>
                        </div> */}

                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground">Created</p>
                            <p className="text-sm">{formatDate(order?.job.createdAt)}</p>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase text-muted-foreground">Updated</p>
                            <p className="text-sm">{formatDate(order?.job.updatedAt)}</p>
                        </div>
                        </div>
                    )}
                    </div>
                </section>

                {/* Payment */}
                <section className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Payment Details
                    </h3>

                    <div className="rounded-xl border border-border bg-background/75 p-4 space-y-2">
                    <InfoRow label="Currency" value={order?.currency?.toUpperCase() ?? "Unknown"} />
                    <InfoRow label="Payment Method" value={order?.paymentMethod ?? "Unknown"} />
                    <InfoRow label="Stripe Session" value={order?.stripeCheckoutSessionId ?? "N/A"} mono copy/>
                    <InfoRow label="Payment Intent" value={order?.stripePaymentIntentId ?? "N/A"} mono  copy/>
                    </div>
                </section>

                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                    {order?.job?.id && (
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/jobs?search=${order?.job?.id}`)}
                    >
                        Open Job
                    </Button>
                    )}

                    <Button variant="outline" onClick={() => updateParams({ viewOrder: null }) }>
                    Close
                    </Button>
                </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}


function InfoRow({
  label,
  value,
  mono = false,
  copy = false
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
}) {

  const truncateMiddle = (value: string, max = 24) => {
    if (!value || value.length <= max) return value;

    return `${value.slice(0, 10)}...${value.slice(-8)}`;
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border last:border-b-0 py-2">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
        {label}
      </span>

      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`text-sm text-foreground min-w-0 truncate ${
            mono ? "font-mono text-xs" : "font-medium"
          }`}
          title={value}
        >
          {copy ? truncateMiddle(value) : value}
        </span>

        {copy && (
          <button
            onClick={() => copyToClipboard(value)}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Copy Value"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}