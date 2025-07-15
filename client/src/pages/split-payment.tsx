import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { cartStorage, type CartItem } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Users, ArrowLeft, Check } from "lucide-react";

interface Session {
  id: string;
  tableId: number;
  table: {
    id: number;
    number: number;
  };
}

interface SplitGroup {
  id: string;
  name: string;
  items: (CartItem & { selected: boolean })[];
  total: number;
}

export default function SplitPayment() {
  const [match, params] = useRoute("/split-payment/:sessionId");
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [groups, setGroups] = useState<SplitGroup[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get session details
  const { data: session, isLoading: sessionLoading } = useQuery<Session>({
    queryKey: ["/api/sessions", params?.sessionId],
    enabled: !!params?.sessionId,
  });

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = cartStorage.getCart();
    if (savedCart.sessionId === params?.sessionId) {
      setCart(savedCart.items);
      // Initialize with one default group
      if (savedCart.items.length > 0) {
        setGroups([{
          id: "default",
          name: "Gruppo 1",
          items: savedCart.items.map(item => ({ ...item, selected: false })),
          total: 0
        }]);
      }
    }
  }, [params?.sessionId]);

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    
    const newGroup: SplitGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      items: cart.map(item => ({ ...item, selected: false })),
      total: 0
    };
    
    setGroups([...groups, newGroup]);
    setNewGroupName("");
  };

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
  };

  const toggleItemSelection = (groupId: string, menuItemId: number) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        const updatedItems = group.items.map(item => {
          if (item.menuItemId === menuItemId) {
            return { ...item, selected: !item.selected };
          }
          return item;
        });
        
        const total = updatedItems
          .filter(item => item.selected)
          .reduce((sum, item) => sum + (item.price * item.quantity), 0);
          
        return { ...group, items: updatedItems, total };
      }
      return group;
    }));
  };

  const createSplitOrdersMutation = useMutation({
    mutationFn: async () => {
      if (!params?.sessionId || groups.length === 0) {
        throw new Error("Session ID o gruppi mancanti");
      }

      const orders = [];
      
      for (const group of groups) {
        const selectedItems = group.items.filter(item => item.selected);
        if (selectedItems.length === 0) continue;

        const order = await apiRequest("POST", "/api/orders", {
          sessionId: params.sessionId,
          customerName: group.name,
          items: selectedItems.map(item => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price
          }))
        });

        orders.push(await order.json());
      }

      return orders;
    },
    onSuccess: (orders) => {
      cartStorage.clearCart();
      toast({
        title: "Ordini creati",
        description: `${orders.length} ordini separati creati con successo`,
      });
      // Redirect to first order payment
      if (orders.length > 0) {
        setLocation(`/payment/${orders[0].id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella creazione degli ordini",
        variant: "destructive",
      });
    },
  });

  if (!match) return null;

  if (sessionLoading) {
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

  const totalCart = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSplit = groups.reduce((sum, group) => sum + group.total, 0);
  const unassignedTotal = totalCart - totalSplit;

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
                onClick={() => setLocation(`/menu/${params?.sessionId}`)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Dividi Conto</h1>
                <p className="text-sm text-muted-foreground">
                  Tavolo {session.table.number}
                </p>
              </div>
            </div>
            <Badge variant={unassignedTotal === 0 ? "default" : "destructive"}>
              {unassignedTotal === 0 ? "Tutto assegnato" : `€${unassignedTotal.toFixed(2)} non assegnati`}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Riepilogo Divisione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">€{totalCart.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Totale Carrello</p>
              </div>
              <div>
                <p className="text-2xl font-bold">€{totalSplit.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Totale Assegnato</p>
              </div>
              <div>
                <p className="text-2xl font-bold">€{unassignedTotal.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Non Assegnato</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add New Group */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Aggiungi Gruppo</CardTitle>
            <CardDescription>
              Crea un gruppo per dividere il conto tra più persone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="groupName">Nome del gruppo</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="es. Marco, Giulia..."
                />
              </div>
              <Button onClick={addGroup} disabled={!newGroupName.trim()} className="mt-auto">
                Aggiungi
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Groups */}
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    <Badge variant="outline">€{group.total.toFixed(2)}</Badge>
                  </CardTitle>
                  {groups.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGroup(group.id)}
                    >
                      Rimuovi
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItemSelection(group.id, item.menuItemId)}
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            €{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        {groups.length > 0 && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button
                  onClick={() => createSplitOrdersMutation.mutate()}
                  disabled={createSplitOrdersMutation.isPending || unassignedTotal > 0}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {createSplitOrdersMutation.isPending ? "Creando..." : "Crea Ordini Separati"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/menu/${params?.sessionId}`)}
                >
                  Torna al Menu
                </Button>
              </div>
              {unassignedTotal > 0 && (
                <p className="text-sm text-muted-foreground mt-2 text-center">
                  Assegna tutti gli articoli prima di procedere
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}