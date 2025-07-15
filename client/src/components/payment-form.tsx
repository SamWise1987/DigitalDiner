import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  orderId: number | null;
}

export default function PaymentForm({ orderId }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation/${orderId}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate(`/confirmation/${orderId}`);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-black text-white py-3 rounded-lg"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
}