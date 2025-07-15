import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Tag, ChevronRight, Info, Apple } from "lucide-react";
import PaymentForm from "@/components/payment-form";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Payment() {
  const { orderId } = useParams();
  const [, navigate] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [orderAmount, setOrderAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("apple-pay");

  useEffect(() => {
    if (orderId) {
      // Get order details first
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(order => {
          setOrderAmount(parseFloat(order.total));
          
          // Create payment intent
          return fetch("/api/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              amount: parseFloat(order.total),
              orderId: parseInt(orderId)
            }),
          });
        })
        .then(res => res.json())
        .then(data => setClientSecret(data.clientSecret))
        .catch(err => console.error("Payment setup error:", err));
    }
  }, [orderId]);

  const handleGoBack = () => {
    navigate(`/cart/${orderId}`);
  };

  const orderData = {
    subtotal: 52.00,
    serviceCharge: 6.50,
    processingFee: 0.99,
    total: 59.49,
  };

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="w-10 h-10 p-0 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">Payment</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Security Message */}
        <Card className="mb-6" style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Shield className="text-green-600 w-6 h-6" />
              <div>
                <h3 className="font-semibold text-sm">Pay securely</h3>
                <p className="text-gray-500 text-xs">All transactions are private and encrypted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="space-y-4 mb-6">
          {/* Apple Pay */}
          <Card 
            className={`cursor-pointer apple-transition ${
              paymentMethod === "apple-pay" ? "border-primary" : "border-gray-200"
            }`}
            onClick={() => setPaymentMethod("apple-pay")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                    <Apple className="text-white w-5 h-5" />
                  </div>
                  <span className="font-medium">Apple Pay</span>
                </div>
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Card */}
          <Card 
            className={`cursor-pointer apple-transition ${
              paymentMethod === "card" ? "border-primary" : "border-gray-200"
            }`}
            onClick={() => setPaymentMethod("card")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium">Credit Card</span>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="text-blue-600">VISA</Badge>
                  <Badge variant="outline" className="text-red-500">MC</Badge>
                  <Badge variant="outline" className="text-blue-500">AMEX</Badge>
                </div>
              </div>
              
              {paymentMethod === "card" && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm orderId={orderId} />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Promo Code */}
        <Card className="mb-6" style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-3">
                <Tag className="text-orange-500 w-5 h-5" />
                <span className="font-medium">Add a promo code</span>
              </div>
              <ChevronRight className="text-gray-500 w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">£{orderData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Service charge (12.5%)</span>
            <span className="font-medium">£{orderData.serviceCharge.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center space-x-1">
              <span className="text-gray-500">Payment processing fee</span>
              <Info className="text-gray-500 w-3 h-3" />
            </div>
            <span className="font-medium">£{orderData.processingFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-gray-100 pt-3">
            <span>Total</span>
            <span>£{orderData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pay Button */}
        {paymentMethod === "apple-pay" && (
          <Button className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg mb-4 apple-transition hover:scale-[0.98] active:scale-95">
            <Apple className="w-5 h-5 mr-2" />
            Pay with Apple Pay
          </Button>
        )}

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mb-4">
          By continuing, I agree to the{" "}
          <button className="text-primary hover:underline">Terms of Service</button>{" "}
          and{" "}
          <button className="text-primary hover:underline">Privacy Policy</button>
        </p>

        {/* Powered by */}
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <Shield className="w-3 h-3" />
          <span>Secure payments with</span>
          <span className="text-purple-600 font-medium">Stripe</span>
        </div>
      </div>
    </div>
  );
}
