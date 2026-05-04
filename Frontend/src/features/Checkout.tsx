import { toast } from "sonner"
import { useCallback, useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {loadStripe} from '@stripe/stripe-js';
import {Button } from "@/components/ui/button"
import {EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useQueryParams } from "@/lib/constants";
import { useAuth } from "@/lib/AuthContext";
  import LoadingOverlay from "@/components/modals/Loading"

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
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [metaData, setMetaData] = useState<any>([]);
  const [orderId, setOrderId] = useState(null);
  const [jobId, setJobId] = useState(null);
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
        setPaymentStatus(data.paymentStatus);
        setOrderId(data.orderId);
        setJobId(data.jobId);
        updateParams({ session_id: null });
      });
      setIsLoading(false);
  }, []);

  if (status === 'open') {
  }

  if (status === "complete" && paymentStatus === "paid") {
  }
return (
  <Card className="bg-card border-border max-w-2xl mx-auto">
    <CardHeader>
      <CardTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
        Order {orderStatus}
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
              status === "complete" ? "text-emerald-500" : status === "open" ? "text-red-500" : "text-foreground"
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
            #<Link
              to={`/jobs?search=${jobId}`}
              className="px-0.5 text-blue-400 underline cursor-pointer"
              >
              {jobId}
            </Link>
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
          <Button onClick={() => navigate(`/search/${user?.SteamID}`)} className="cursor-pointer bg-emerald-500 text-black">
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