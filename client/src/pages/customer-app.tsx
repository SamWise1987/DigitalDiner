import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { cartStorage, type CartItem } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Users } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  available: boolean;
  imageUrl?: string;
  tags: string[];
}

interface Session {
  id: string;
  tableId: number;
  table: {
    id: number;
    number: number;
  };
}

export default function CustomerApp() {
  const [match, params] = useRoute("/menu/:sessionId");
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get session details
  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", params?.sessionId],
    enabled: !!params?.sessionId,
  });

  // Get menu items
  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = cartStorage.getCart();
    if (savedCart.sessionId === params?.sessionId) {
      setCart(savedCart.items);
    } else if (params?.sessionId && session) {
      // New session, clear cart and set session
      cartStorage.setSession(params.sessionId, session.table.id);
      setCart([]);
    }
  }, [params?.sessionId, session]);

  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const addToCart = (item: MenuItem) => {
    const cartItem = {
      menuItemId: item.id,
      name: item.name,
      price: parseFloat(item.price),
    };
    
    cartStorage.addItem(cartItem);
    const updatedCart = cartStorage.getCart();
    setCart(updatedCart.items);
    
    toast({
      title: "Aggiunto al carrello",
      description: `${item.name} aggiunto al carrello`,
    });
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    cartStorage.updateQuantity(menuItemId, quantity);
    const updatedCart = cartStorage.getCart();
    setCart(updatedCart.items);
  };

  const removeFromCart = (menuItemId: number) => {
    cartStorage.removeItem(menuItemId);
    const updatedCart = cartStorage.getCart();
    setCart(updatedCart.items);
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!params?.sessionId || cart.length === 0) {
        throw new Error("Session ID o carrello mancante");
      }

      // Get session to find table
      const sessionRes = await apiRequest("GET", `/api/sessions/${params.sessionId}`);
      const sessionData = await sessionRes.json();

      // Create order using new format
      const order = await apiRequest("POST", "/api/orders", {
        tableId: sessionData.tableId,
        sessionId: params.sessionId,
        subtotal: totalPrice,
        serviceCharge: totalPrice * 0.125,
        total: totalPrice * 1.125
      });

      const orderData = await order.json();

      // Add order items
      for (const item of cart) {
        await apiRequest("POST", `/api/orders/${orderData.id}/items`, {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        });
      }

      return orderData;
    },
    onSuccess: (order) => {
      cartStorage.clearCart();
      setCart([]);
      setLocation(`/payment/${order.id}`);
      toast({
        title: "Ordine creato",
        description: "Procedi al pagamento",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella creazione dell'ordine",
        variant: "destructive",
      });
    },
  });

  if (!match) return null;

  if (sessionLoading || menuLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Sessione non trovata</CardTitle>
            <CardDescription>
              La sessione del tavolo non è valida o è scaduta
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm("Vuoi uscire dal menu? Il carrello verrà salvato.")) {
                    setLocation("/");
                  }
                }}
              >
                <Utensils className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Menu Digitale</h1>
                <p className="text-sm text-muted-foreground">
                  Tavolo {session.table.number}
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCart(!showCart)}
              className="relative"
              variant={showCart ? "default" : "outline"}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Carrello
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu */}
          <div className="lg:col-span-2">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h2 className="text-lg font-medium mb-4 text-foreground">
                  {category}
                </h2>
                <div className="grid gap-4">
                  {items.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="font-medium text-primary">
                                €{item.price}
                              </span>
                              {item.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                            size="sm"
                            className="ml-4"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Aggiungi
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Il tuo ordine
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Il carrello è vuoto
                    </p>
                  ) : (
                    <>
                      <ScrollArea className="max-h-64 mb-4">
                        {cart.map((item) => (
                          <div key={item.menuItemId} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.name}</p>
                              <p className="text-xs text-muted-foreground">
                                €{item.price.toFixed(2)} each
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                className="h-6 w-6 p-0"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="h-6 w-6 p-0 ml-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                      
                      <Separator className="my-4" />
                      
                      <div className="space-y-3">
                        <div className="flex justify-between font-medium">
                          <span>Totale</span>
                          <span>€{totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            onClick={() => createOrderMutation.mutate()}
                            disabled={createOrderMutation.isPending}
                            className="w-full"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {createOrderMutation.isPending ? "Creando..." : "Paga tutto"}
                          </Button>
                          
                          <Button
                            onClick={() => setLocation(`/split-payment/${params?.sessionId}`)}
                            variant="outline"
                            className="w-full"
                          >
                            <Users className="w-4 h-4 mr-2" />
                            Dividi conto
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}