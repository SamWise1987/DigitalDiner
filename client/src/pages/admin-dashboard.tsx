import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import TableStatusCard from "@/components/table-status-card";
import QRCodeDisplay from "@/components/qr-code-display";
import { Utensils, Clock, PoundSterling, TrendingUp, Bell, QrCode, Plus, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [tableNumber, setTableNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const { toast } = useToast();
  
  const { data: tables = [], isLoading: tablesLoading } = useQuery({
    queryKey: ["/api/tables"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const createTableMutation = useMutation({
    mutationFn: async (number: number) => {
      const response = await apiRequest("POST", "/api/tables", { number });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setIsDialogOpen(false);
      setTableNumber("");
      toast({
        title: "Tavolo creato",
        description: "Il tavolo è stato creato con successo con QR code statico",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nella creazione del tavolo",
        variant: "destructive",
      });
    },
  });

  const handleCreateTable = () => {
    if (!tableNumber) return;
    createTableMutation.mutate(parseInt(tableNumber));
  };

  const stats = {
    activeTables: tables.filter((t: any) => t.status === "occupied").length,
    pendingOrders: orders.filter((o: any) => o.status === "pending" || o.status === "preparing").length,
    revenue: orders
      .filter((o: any) => o.status === "paid")
      .reduce((sum: number, o: any) => sum + parseFloat(o.total), 0),
    avgOrder: orders.length > 0 
      ? orders.reduce((sum: number, o: any) => sum + parseFloat(o.total), 0) / orders.length 
      : 0,
  };

  const liveOrders = orders
    .filter((o: any) => o.status !== "paid" && o.status !== "served")
    .slice(0, 3);

  if (tablesLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 apple-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center apple-shadow">
                <Utensils className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">RestaurantQR Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.open('/qr/GX_O_u9aOmcU', '_blank');
                }}
                className="text-sm"
              >
                Test Cliente
              </Button>
              <div className="relative">
                <Bell className="text-muted-foreground w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center apple-shadow">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Active Tables</p>
                  <p className="text-3xl font-semibold text-black">{stats.activeTables}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Utensils className="text-green-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending Orders</p>
                  <p className="text-3xl font-semibold text-black">{stats.pendingOrders}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-orange-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Today's Revenue</p>
                  <p className="text-3xl font-semibold text-black">£{stats.revenue.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PoundSterling className="text-blue-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="apple-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Avg Order Value</p>
                  <p className="text-3xl font-semibold text-black">£{stats.avgOrder.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600 w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Management & Live Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table Management */}
          <Card className="apple-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Gestione Tavoli</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 apple-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuovo Tavolo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="apple-card">
                    <DialogHeader>
                      <DialogTitle>Crea Nuovo Tavolo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Numero Tavolo</label>
                        <Input
                          type="number"
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          placeholder="Es. 1, 2, 3..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handleCreateTable}
                          disabled={!tableNumber || createTableMutation.isPending}
                          className="flex-1 bg-primary hover:bg-primary/90"
                        >
                          {createTableMutation.isPending ? "Creazione..." : "Crea Tavolo"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                          className="flex-1"
                        >
                          Annulla
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {tables.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nessun tavolo trovato. Crea il tuo primo tavolo per iniziare.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table: any) => (
                    <div key={table.id} className="bg-card border rounded-xl p-4 apple-shadow apple-transition hover:apple-shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-primary font-semibold">{table.number}</span>
                          </div>
                          <span className="font-medium">Tavolo {table.number}</span>
                        </div>
                        <Badge
                          variant={table.status === "available" ? "default" : table.status === "occupied" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {table.status === "available" ? "Libero" : 
                           table.status === "occupied" ? "Occupato" : 
                           "Pulizia"}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setSelectedTable(table);
                            setQrDialogOpen(true);
                          }}
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Code
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                const url = `/qr/${table.qrCode}`;
                                window.open(url, '_blank');
                              }}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Prova esperienza cliente</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Orders */}
          <Card className="apple-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Live Orders</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-500">Real-time</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {liveOrders.map((order: any) => (
                  <div key={order.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">Table {order.tableId}</Badge>
                        <span className="text-sm font-medium">#{order.id}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">£{order.total}</span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={order.status === "preparing" ? "default" : "secondary"}
                          className={order.status === "preparing" ? "bg-yellow-100 text-yellow-800" : ""}
                        >
                          {order.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-primary">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Display */}
        {selectedTable && (
          <QRCodeDisplay
            qrCode={selectedTable.qrCode}
            tableNumber={selectedTable.number}
            isOpen={qrDialogOpen}
            onClose={() => {
              setQrDialogOpen(false);
              setSelectedTable(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
