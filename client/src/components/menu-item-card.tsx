import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    description: string;
    price: string;
    imageUrl?: string;
    tags: string[];
  };
  onAddToCart: () => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const getTagVariant = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "popular":
        return "bg-green-100 text-green-800";
      case "vegan":
        return "bg-green-100 text-green-800";
      case "allergen":
        return "bg-orange-100 text-orange-800";
      case "healthy":
        return "bg-blue-100 text-blue-800";
      case "gluten free":
        return "bg-gray-100 text-gray-800";
      case "contains nuts":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card style={{ backgroundColor: 'hsl(240, 6%, 95%)' }}>
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <img 
            src={item.imageUrl || "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"} 
            alt={item.name} 
            className="w-20 h-20 object-cover rounded-lg" 
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <span className="text-lg font-bold">£{item.price}</span>
            </div>
            <p className="text-gray-500 text-sm mb-3">{item.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    className={`text-xs px-2 py-1 rounded-full ${getTagVariant(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                onClick={onAddToCart}
                size="sm"
                className="w-8 h-8 bg-black text-white rounded-full p-0 apple-transition hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
