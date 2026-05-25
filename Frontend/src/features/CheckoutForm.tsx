import { useState } from 'react'
import { toast } from "sonner"
import {
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js/checkout";
import {Button } from "@/components/ui/button"
import {Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import type { BasketItem } from '@/types/modals';



export function CheckoutForm() {
  const localBasket : BasketItem[] = JSON.parse(localStorage.getItem("basket") ?? "[]");
  const checkoutState = useCheckout();
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);

  if (checkoutState.type === "loading") {
    return <p className="text-muted-foreground">Loading checkout...</p>;
  }

  if (checkoutState.type === "error") {
    return <p className="text-red-500">{checkoutState.error.message}</p>;
  }

  const checkout = checkoutState.checkout;

  const basket = checkout.lineItems;

  const total = checkout.total.total.amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const result = await checkout.confirm({
      email,
    });

    if (result.type === "error") {
      setProcessing(false);
      toast.error(result.error.message ?? "Payment failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">
              Checkout
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Complete your payment securely using Stripe.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                />
              </div>

              <div className="rounded-xl border border-border bg-background/75 p-4">
                <PaymentElement />
              </div>

              <Button
                type="submit"
                disabled={processing || !email}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {processing ? "Processing..." : `Pay ${total}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border h-fit">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest">
              Order Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {basket.map((item) => {
                const localItem = localBasket?.find(x => x.name === item.name);
                return (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-border pb-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Qty {item.quantity}
                    </p>
                    <p className="text-[10px] tracking-widest text-muted-foreground">
                      {item.description}
                    </p>
                    {localItem?.isGift && (
                      <p className="text-[10px] tracking-widest text-blue-500">
                        Gift: {localItem?.receiverName} ({localItem?.receiverId})
                      </p>
                    )}
                  </div>

                  <p className="text-sm font-black shrink-0">
                    {item.total.amount}
                  </p>
                </div>
              )})}
            </div>

            <div className="flex justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-lg font-black text-foreground">
                {total}
              </span>
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Payments are processed securely by Stripe. In-game purchases are applied after successful payment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}