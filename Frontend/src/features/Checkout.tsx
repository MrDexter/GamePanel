import { toast } from "sonner"
import { useCallback, useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {loadStripe} from '@stripe/stripe-js';
import {Button } from "@/components/ui/button"
// import {EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { CheckoutForm } from "@/features/CheckoutForm"
import {CheckoutElementsProvider} from '@stripe/react-stripe-js/checkout';
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useQueryParams, formatMoney } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";
  import LoadingOverlay from "@/components/modals/Loading"

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test publishable API key.
const Stripe_Publish = import.meta.env.VITE_STRIPE_PUBLISH;
const stripePromise = loadStripe(Stripe_Publish);

export const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // const { searchParams } = useQueryParams();
  const basket = JSON.parse(localStorage.getItem("basket") ?? "[]");

  const fetchClientSecret = useCallback(() => {
    return apiFetch("POST", "/shop/create-checkout-session", {
      body: JSON.stringify({
        basket: basket,
        purchaserId: user?.SteamID ?? "",
        ReceiverId: user?.SteamID ?? "" // Setup for Gifting later
      }),
    })
    .then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message ?? "Something went wrong");
        navigate("/shop");
        throw new Error(data.message);
      }
      localStorage.setItem("basket", "[]");
      window.dispatchEvent(new Event("basketUpdated"));
      return data.clientSecret;
    });
  }, []);

const appearance = {
  theme: "night" as const,
  inputs: 'spaced'as const,
  labels: 'auto' as const,
  layout: 'tabs' as const,


  variables: {
    colorPrimary: "#10b981",
    colorBackground: "#18181b",
    colorText: "#f4f4f5",
    colorTextSecondary: "#a1a1aa",
    colorDanger: "#ef4444",
    colorLine: "#27272a",
    fontFamily: "system-ui, sans-serif",
    borderRadius: "10px",
    spacingUnit: "4px",
  },

  rules: {
    ".Input": {
      backgroundColor: "#09090b",
      border: "1px solid #27272a",
      color: "#f4f4f5",
    },
    ".Input:focus": {
      borderColor: "#10b981",
      boxShadow: "0 0 0 1px #10b981",
    },
    ".Label": {
      color: "#a1a1aa",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    },
    ".Tab": {
      backgroundColor: "#09090b",
      border: "1px solid #27272a",
      color: "#a1a1aa",
    },
    ".Tab--selected": {
      backgroundColor: "#18181b",
      borderColor: "#10b981",
      color: "#f4f4f5",
    },
  },
};
const clientSecret = useMemo(() => fetchClientSecret(), []);

return (
  <CheckoutElementsProvider stripe={stripePromise} options={{clientSecret, elementsOptions: {appearance}}}>
    <CheckoutForm />
  </CheckoutElementsProvider>
);
}

export const Return = () => {
  const hasRun = useRef(false);
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  // const [paymentStatus, setPaymentStatus] = useState(null);
  const [metaData, setMetaData] = useState<any>([]);
  const [orderId, setOrderId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [basket, setBasket] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { searchParams, updateParams } = useQueryParams();
  const sessionId = searchParams.get("session_id");
  const orderStatus = status === "complete" ? "Complete" : status === "Open" ? "Failed" : "Unknown";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    setIsLoading(true)
    apiFetch("GET", `/shop/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setMetaData(data.data);
        // setPaymentStatus(data.paymentStatus);
        setOrderId(data.orderId);
        setJobId(data.jobId);
        setBasket(data.basket);
        updateParams({ session_id: null });
      });
      setIsLoading(false);
  }, []);

return (
  <Card className="bg-card border-border max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
        Order {orderStatus}
      </CardTitle>

      {status === "complete" ? (
        <p className="text-sm text-muted-foreground">
          Thanks for your purchase. Your items should be applied shortly.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Your payment was not completed. No purchase has been applied.
        </p>
      )}
    </CardHeader>

    <CardContent className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span
            className={`font-medium ${
              status === "complete" ? "text-emerald-500" : status === "open" ? "text-red-500" : "text-foreground"
            }`}
          >
            {orderStatus}
          </span>
        </div>

        {/* <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {status === "complete" ? "Delivery" : "Session"}
          </span>
          <span className="text-foreground font-medium">
            {status === "complete" ? "Instant" : "Not completed"}
          </span>
        </div> */}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Order ID
          </span>
          <span className="text-foreground font-medium">
            #<Link
              to={`/orders?search=${orderId}`}
              className="px-0.5 text-blue-400 underline cursor-pointer"
              >
              {orderId}
            </Link>
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Job ID
          </span>
          <span className="text-foreground font-medium">
            {jobId !== 0 && jobId !== null ? (
              <div>
            #<Link
              to={`/jobs?search=${jobId}`}
              className="px-0.5 text-blue-400 underline cursor-pointer"
              >
              {jobId}
            </Link>
            </div>
          ) : (
            "None"
          )}
          </span>
        </div>
      </div>

      {basket?.length > 0 && (
        <div className="rounded-lg border border-border bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Order Summary
            </span>

            <span className="text-xs text-muted-foreground">
              {basket.length} item{basket.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="space-y-2">
            {basket.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-t border-border pt-2 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {item.name}
                  </p>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Qty {item.quantity}
                    </span>

                    <span
                      className={`text-[10px] uppercase tracking-widest ${
                        item.fulfilmentMode === "Auto"
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      Fulfillment: {item.fulfilmentMode ?? "Manual"}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-black text-foreground shrink-0">
                  {formatMoney((item.pricePence * item.quantity) / 100)}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-black text-foreground">
              {formatMoney(
                basket.reduce(
                  (sum: number, item: any) => sum + item.pricePence * item.quantity,
                  0
                ) / 100
              )}
            </span>
          </div>
        </div>
      )}

      {status === "complete" ? (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Order with Auto fulfillment should be available immediately, Ingame items may require a relog.</p>
          <p>If items are missing after an hour, please contact a member of staff.</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
        </p>
      )}

      <div className="flex gap-2">
        {status === "complete" ? (
          <Button onClick={() => navigate(`/search/${user?.SteamID}`)} className="cursor-pointer bg-emerald-500 text-black">
            View Profile
          </Button>
        ) : (
          <Button
            disabled={!metaData.productId}
            onClick={() => {localStorage.setItem("basket", JSON.stringify(basket)); window.dispatchEvent(new Event("basketUpdated")); navigate(`/checkout`)}}
          >
            Retry
          </Button>
        )}

        <Button onClick={() => navigate("/orders")} className="cursor-pointer bg-blue-500 text-black">
          View Orders
        </Button>

        <Button onClick={() => navigate("/shop")} className="cursor-pointer bg-red-600 text-white">
          Back to Shop
        </Button>
      </div>
    </CardContent>
  <LoadingOverlay isVisible={isLoading} />
  </Card>
);
}