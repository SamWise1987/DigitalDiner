import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, queryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CartItem from "@/components/cart-item";
import { ArrowLeft, Plus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrderCart() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cart, setCart] = useState<Array<{ menuItemId: number; quantity: number; price: number; name: string }>>([]);

  useEffect(() => {
    // Get cart from navigation state or localStorage
    const cartData = localStorage.getItem(`cart_${sessionId}`);
    if (cartData) {
      setCart(JSON.parse(cartData));
    }
  }, [sessionId]);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: (order) => {
      navigate(`/payment/${sessionId}`, { state: { orderId: order.id } });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceCharge = subtotal * 0.125; // 12.5%
  const total = subtotal + serviceCharge;

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCart(prev => prev.map(item =>
        item.menuItemId === menuItemId ? { ...item, quantity } : item
      ));
    }
  };

  const removeItem = (menuItemId: number) => {
    setCart(prev => prev.filter(item => item.menuItemId !== menuItemId));
  };

  const handleGoBack = () => {
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart));
    navigate(`/menu/${sessionId}`);
  };

  const handleAddMoreItems = () => {
    localStorage.setItem(`cart_${sessionId}`, JSON.stringify(cart));
    navigate(`/menu/${sessionId}`);
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) return;

    // Create order
    const orderData = {
      sessionId,
      tableId: 1, // This should come from session data
      subtotal: subtotal.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
    };

    createOrderMutation.mutate(orderData);
  };

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
            <h1 className="font-semibold">Your Order</h1>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Order Items */}
        <div className="space-y-4 mb-6">
          {cart.map((item) => (
            <CartItem
              key={item.menuItemId}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {cart.length === 0 && (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mb-4">Add some delicious items to get started</p>
              <Button onClick={handleAddMoreItems} className="bg-primary">
                Browse Menu
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add More Items */}
        {cart.length > 0 && (
          <Button
            onClick={handleAddMoreItems}
            variant="outline"
            className="w-full py-4 rounded-xl font-medium mb-8 apple-transition hover:bg-gray-100 active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add more items
          </Button>
        )}

        {/* Popular with Your Order */}
        <div className="mb-8">
          <h3 className="font-semibold mb-2">Popular with your order</h3>
          <p className="text-gray-500 text-sm mb-4">Other customers also ordered these</p>
          
          <div className="grid grid-cols-2 gap-4">
            <Card style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
              <CardContent className="p-4 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                  alt="Tiramisu" 
                  className="w-full h-20 object-cover rounded-lg mb-3" 
                />
                <h4 className="font-medium mb-1">Tiramisu</h4>
                <p className="text-gray-500 text-sm mb-3">£5.95</p>
                <Button 
                  size="sm"
                  className="w-8 h-8 bg-black text-white rounded-full p-0 apple-transition hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
              <CardContent className="p-4 text-center">
                <img 
                  src="https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120" 
                  alt="Panna Cotta" 
                  className="w-full h-20 object-cover rounded-lg mb-3" 
                />
                <h4 className="font-medium mb-1">Panna Cotta</h4>
                <p className="text-gray-500 text-sm mb-3">£4.75</p>
                <Button 
                  size="sm"
                  className="w-8 h-8 bg-black text-white rounded-full p-0 apple-transition hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Order Summary Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <div className="max-w-md mx-auto">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Service charge (12.5%)</span>
                <span>£{serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-gray-100 pt-2">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleProceedToPayment}
              disabled={cart.length === 0 || createOrderMutation.isPending}
              className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg apple-transition hover:scale-[0.98] active:scale-95"
            >
              {createOrderMutation.isPending ? "Creating Order..." : "Order & Pay"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
