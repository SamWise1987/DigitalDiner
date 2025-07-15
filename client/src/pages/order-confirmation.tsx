import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, BookOpen, FileText, Bell, Utensils } from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [, navigate] = useLocation();

  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleViewMenu = () => {
    navigate(`/menu/${order?.sessionId}`);
  };

  const handleViewReceipt = () => {
    // Implementation for viewing receipt
  };

  const handleCallWaiter = () => {
    // Implementation for calling waiter
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Check className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">Your payment was successful</p>
        </div>

        {/* Order Details */}
        <Card className="mb-6" style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">Order #{order?.id || 'ORD-1247'}</h2>
              <p className="text-gray-500 text-sm">Table {order?.tableId} • Bella Vista</p>
            </div>
            
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span>2x Pumpkin Soup</span>
                <span>£24.00</span>
              </div>
              <div className="flex justify-between">
                <span>1x Grilled Salmon</span>
                <span>£28.00</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Service charge</span>
                <span>£6.50</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-200 pt-3">
                <span>Total paid</span>
                <span>£{order?.total || '59.49'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Timeline */}
        <Card className="mb-6" style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Order confirmed</p>
                  <p className="text-gray-500 text-sm">Payment received</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                  <Utensils className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium">Preparing your order</p>
                  <p className="text-gray-500 text-sm">Estimated time: 15-20 minutes</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <Bell className="text-white w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-500">Ready for service</p>
                  <p className="text-gray-500 text-sm">We'll notify you</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Button
            onClick={handleViewMenu}
            className="w-full bg-primary text-white py-4 rounded-xl font-semibold apple-transition hover:bg-blue-600 active:scale-95"
          >
            Order More Items
          </Button>
          
          <Button
            onClick={handleViewReceipt}
            variant="outline"
            className="w-full py-4 rounded-xl font-semibold apple-transition hover:bg-gray-100 active:scale-95"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Receipt
          </Button>
          
          <Button
            onClick={handleCallWaiter}
            variant="outline"
            className="w-full py-4 rounded-xl font-semibold apple-transition hover:bg-gray-100 active:scale-95"
          >
            <Bell className="w-4 h-4 mr-2" />
            Call Waiter
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-2">Thank you for dining with us!</p>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Utensils className="text-white w-3 h-3" />
            </div>
            <span className="text-sm font-medium">Bella Vista Restaurant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
