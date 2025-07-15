import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download, ExternalLink } from "lucide-react";

interface QRCodeDisplayProps {
  qrCode: string;
  tableNumber: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeDisplay({ qrCode, tableNumber, isOpen, onClose }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && qrCode) {
      generateQRCode();
    }
  }, [isOpen, qrCode]);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      // Import QRCode dynamically to avoid SSR issues
      const QRCode = (await import("qrcode")).default;
      const url = `${window.location.origin}/qr/${qrCode}`;
      
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement("a");
    link.download = `tavolo-${tableNumber}-qr.png`;
    link.href = qrCodeDataUrl;
    link.click();
  };

  const openCustomerApp = () => {
    const url = `${window.location.origin}/qr/${qrCode}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            QR Code Tavolo {tableNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            {isLoading ? (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : qrCodeDataUrl ? (
              <div className="p-4 bg-white rounded-lg border">
                <img 
                  src={qrCodeDataUrl} 
                  alt={`QR Code Tavolo ${tableNumber}`}
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Errore generazione QR</p>
              </div>
            )}
            
            {/* QR Code URL */}
            <div className="w-full p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">URL del QR Code:</p>
              <p className="text-sm font-mono break-all">
                {window.location.origin}/qr/{qrCode}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={downloadQRCode}
              disabled={!qrCodeDataUrl}
              variant="outline"
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Scarica PNG
            </Button>
            <Button 
              onClick={openCustomerApp}
              className="flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Testa Cliente
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Come usare:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stampa il QR code e posizionalo sul tavolo</li>
              <li>I clienti possono scansionarlo per accedere al menu</li>
              <li>Il tavolo si blocca automaticamente durante le sessioni attive</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}