import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: {
    menuItemId: number;
    name: string;
    price: number;
    quantity: number;
  };
  onUpdateQuantity: (menuItemId: number, quantity: number) => void;
  onRemove: (menuItemId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <Card style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl">🍜</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-gray-500 text-sm">£{item.price.toFixed(2)}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
              className="w-8 h-8 p-0 rounded-full apple-shadow apple-transition hover:scale-105"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="font-semibold">{item.quantity}</span>
            <Button
              size="sm"
              onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
              className="w-8 h-8 bg-black text-white p-0 rounded-full apple-transition hover:scale-105"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.menuItemId)}
            className="text-red-500 hover:text-red-700 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
