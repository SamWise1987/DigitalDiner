import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, BookOpen, CreditCard } from "lucide-react";

export default function QRLanding() {
  const { qrCode } = useParams();
  const [, navigate] = useLocation();

  const { data: sessionData, isLoading, error } = useQuery({
    queryKey: ["/api/tables", qrCode, "session"],
    enabled: !!qrCode,
    queryFn: async () => {
      const response = await fetch(`/api/tables/${qrCode}/session`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to create session');
      }
      return response.json();
    },
  });

  // Prefetch menu items so the menu page loads immediately
  useEffect(() => {
    if (sessionData) {
      queryClient.prefetchQuery({ queryKey: ["/api/menu"] });
    }
  }, [sessionData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h1 className="text-xl font-semibold mb-2">Invalid QR Code</h1>
            <p className="text-gray-500">This QR code is not valid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { table, session } = sessionData;

  const handleViewMenu = () => {
    navigate(`/menu/${session.id}`);
  };

  const handlePayBill = () => {
    navigate(`/payment/${session.id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Restaurant Header */}
        <div className="text-center mb-8">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
            alt="Restaurant Interior" 
            className="w-full h-48 object-cover rounded-xl mb-6 apple-shadow" 
          />
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Utensils className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bella Vista</h1>
          <p className="text-gray-500">Table {table.number}</p>
        </div>

        {/* Welcome Message */}
        <Card className="mb-6" style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Welcome to the fastest way to order</h2>
            <p className="text-gray-500">
              Scan completed! You can now browse our menu and place your order directly from your device.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <Button 
            onClick={handleViewMenu}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg apple-transition hover:scale-[0.98] active:scale-95"
            size="lg"
          >
            <BookOpen className="w-5 h-5 mr-3" />
            View Menu
          </Button>
          
          <Button 
            onClick={handlePayBill}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg apple-transition hover:scale-[0.98] active:scale-95"
            size="lg"
          >
            <CreditCard className="w-5 h-5 mr-3" />
            Pay the Bill
          </Button>
        </div>

        {/* Manual Entry */}
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-4">Don't have a QR code?</p>
          <button className="text-primary font-medium text-sm hover:underline">
            Enter table number manually
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Powered by</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Utensils className="text-white w-3 h-3" />
            </div>
            <span className="text-sm font-medium">RestaurantQR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
