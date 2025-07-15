import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MenuItemCard from "@/components/menu-item-card";
import { ArrowLeft, ShoppingCart } from "lucide-react";

export default function DigitalMenu() {
  const { sessionId } = useParams();
  const [, navigate] = useLocation();
  const [cart, setCart] = useState<Array<{ menuItemId: number; quantity: number; price: number }>>([]);
  const [selectedCategory, setSelectedCategory] = useState("starters");

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ["/api/menu"],
  });

  const categories = [
    { id: "starters", name: "Starters" },
    { id: "mains", name: "Mains" },
    { id: "desserts", name: "Desserts" },
    { id: "drinks", name: "Drinks" },
  ];

  const filteredItems = menuItems.filter((item: any) => 
    item.category.toLowerCase() === selectedCategory
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (menuItem: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.menuItemId === menuItem.id);
      if (existingItem) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItemId: menuItem.id, quantity: 1, price: parseFloat(menuItem.price) }];
    });
  };

  const handleGoBack = () => {
    navigate(`/qr/${session?.table?.qrCode || ''}`);
  };

  const handleViewCart = () => {
    navigate(`/cart/${sessionId}`, { state: { cart } });
  };

  if (sessionLoading || menuLoading) {
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
            <div className="text-center">
              <h1 className="font-semibold">Menu</h1>
              <p className="text-xs text-gray-500">Table {session?.table?.number}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewCart}
              className="relative w-10 h-10 p-0 rounded-lg hover:bg-gray-100"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-black hover:bg-gray-200"
              }`}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="space-y-4">
          {filteredItems.map((item: any) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={() => addToCart(item)}
            />
          ))}
        </div>
      </div>

      {/* Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 max-w-md mx-auto">
          <Button
            onClick={handleViewCart}
            className="w-full bg-black text-white py-4 rounded-xl font-semibold text-lg apple-shadow-lg apple-transition hover:scale-[0.98] active:scale-95"
          >
            <div className="flex items-center justify-center space-x-3">
              <ShoppingCart className="w-5 h-5" />
              <span>View Cart</span>
              <Badge className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                {cartItemCount} items
              </Badge>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
