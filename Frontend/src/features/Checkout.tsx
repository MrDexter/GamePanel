import { toast } from "sonner"
import { useCallback, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {loadStripe} from '@stripe/stripe-js';
import {Button } from "@/components/ui/button"
import {EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useQueryParams } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
// This is your test publishable API key.
const Stripe_Publish = import.meta.env.VITE_STRIPE_PUBLISH;
const stripePromise = loadStripe(Stripe_Publish);

export const CheckoutForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { searchParams } = useQueryParams();
  const product = searchParams.get("product") ?? "";

  const fetchClientSecret = useCallback(() => {
    return apiFetch("POST", "/shop/create-checkout-session", {
      body: JSON.stringify({
        productId: product,
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

      return data.clientSecret;
    });
  }, []);

  const options = {fetchClientSecret};

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

export const Return = () => {
  const hasRun = useRef(false);
  const [status, setStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [metaData, setMetaData] = useState<any>([]);
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const { searchParams, updateParams } = useQueryParams();
  const sessionId = searchParams.get("session_id");
  const orderStatus = status === "complete" ? "Complete" : "Failed";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    apiFetch("GET", `/shop/session-status?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status);
        setMetaData(data.data);
        setPaymentStatus(data.paymentStatus);
        setOrderId(data.orderId);
        updateParams({ session_id: null });
      });
  }, []);

  if (status === 'open') {
  }

  if (status === "complete" && paymentStatus === "paid") {
  }
return (
  <Card className="bg-card border-border max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
        Payment {orderStatus}
      </CardTitle>

      {status === "complete" ? (
        <p className="text-sm text-muted-foreground">
          Thanks for your purchase. Your {metaData.productName ?? "purchase"} should be applied shortly.
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
              status === "complete" ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {orderStatus}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {status === "complete" ? "Delivery" : "Session"}
          </span>
          <span className="text-foreground font-medium">
            {status === "complete" ? "Instant" : "Not completed"}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Order ID
          </span>
          <span className="text-foreground font-medium">
            {orderId}
          </span>
        </div>
      </div>

      {status === "complete" ? (
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>In-game purchases should be available immediately, but may require a relog if you are currently in game.</p>
          <p>If items are missing after an hour, please contact a member of staff.</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
        </p>
      )}

      <div className="flex gap-2">
        {status === "complete" ? (
          <Button onClick={() => navigate("/profile")} className="cursor-pointer">
            View Profile
          </Button>
        ) : (
          <Button
            disabled={!metaData.productId}
            onClick={() => navigate(`/checkout?product=${metaData.productId}`)}
          >
            Retry
          </Button>
        )}

        <Button variant="outline" onClick={() => navigate("/shop")} className="cursor-pointer">
          Back to Shop
        </Button>
      </div>
    </CardContent>
  </Card>
);

  return null;
}