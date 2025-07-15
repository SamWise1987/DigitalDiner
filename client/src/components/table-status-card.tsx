import { Card, CardContent } from "@/components/ui/card";
import { Check, Users, Fan } from "lucide-react";

interface TableStatusCardProps {
  table: {
    id: number;
    number: number;
    status: string;
  };
}

export default function TableStatusCard({ table }: TableStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "border-green-500 bg-gray-50";
      case "cleaning":
        return "border-orange-500 bg-gray-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "occupied":
        return <Check className="text-white w-4 h-4" />;
      case "cleaning":
        return <Fan className="text-white w-4 h-4" />;
      default:
        return <Users className="text-white w-4 h-4" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "occupied":
        return "bg-green-500";
      case "cleaning":
        return "bg-orange-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Occupied";
      case "cleaning":
        return "Cleaning";
      default:
        return "Available";
    }
  };

  return (
    <Card 
      className={`apple-transition hover:scale-105 cursor-pointer border-2 ${getStatusColor(table.status)}`}
    >
      <CardContent className="p-4 text-center">
        <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${getStatusBgColor(table.status)}`}>
          {getStatusIcon(table.status)}
        </div>
        <p className="text-sm font-medium">Table {table.number}</p>
        <p className="text-xs text-gray-500">{getStatusText(table.status)}</p>
      </CardContent>
    </Card>
  );
}
