import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import QRCode from "qrcode";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize sample data
  app.post("/api/init", async (req, res) => {
    try {
      // Create sample tables
      for (let i = 1; i <= 8; i++) {
        try {
          await storage.createTable({ number: i, qrCode: `table-${i}`, status: "available" });
        } catch (error) {
          // Table might already exist
        }
      }

      // Create sample menu items
      const sampleItems = [
        {
          name: "Pumpkin Soup",
          description: "Blending roasted or boiled pumpkin with broth, cream, almonds, paprika, and spices",
          price: "12.50",
          category: "starters",
          imageUrl: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          tags: ["popular", "vegetarian"]
        },
        {
          name: "Burrata",
          description: "Fresh burrata with tomatoes and basil",
          price: "14.95",
          category: "starters", 
          imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          tags: ["fresh", "italian"]
        },
        {
          name: "Grilled Salmon",
          description: "Atlantic salmon with seasonal vegetables",
          price: "28.00",
          category: "mains",
          imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          tags: ["healthy", "gluten free"]
        },
        {
          name: "Truffle Pasta",
          description: "Handmade pasta with truffle and parmesan",
          price: "24.50",
          category: "mains",
          imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc893d5de?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          tags: ["signature", "vegetarian"]
        },
        {
          name: "Tiramisu",
          description: "Traditional Italian dessert with coffee and mascarpone",
          price: "8.50",
          category: "desserts",
          imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          tags: ["classic", "coffee"]
        },
        {
          name: "Prosecco",
          description: "Italian sparkling wine",
          price: "9.50",
          category: "drinks",
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
          tags: ["sparkling", "italian"]
        }
      ];

      for (const item of sampleItems) {
        try {
          await storage.createMenuItem(item);
        } catch (error) {
          // Item might already exist
        }
      }

      res.json({ message: "Sample data initialized" });
    } catch (error: any) {
      res.status(500).json({ message: "Error initializing data: " + error.message });
    }
  });
  // Tables
  app.get("/api/tables", async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching tables: " + error.message });
    }
  });

  app.post("/api/tables", async (req, res) => {
    try {
      const { number } = req.body;
      const qrCode = `table-${number}`;
      const table = await storage.createTable({ number, qrCode, status: "available" });
      res.json(table);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating table: " + error.message });
    }
  });

  app.post("/api/tables/:qrCode/session", async (req, res) => {
    try {
      const { qrCode } = req.params;
      const table = await storage.getTableByQrCode(qrCode);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      // Check if table has an active session
      if (table.status === "occupied" && table.sessionId) {
        // Return existing session if table is occupied
        const existingSession = await storage.getSession(table.sessionId);
        if (existingSession) {
          return res.json({ table, session: existingSession });
        }
      }

      // Create new session and lock table
      const session = await storage.createSession(table.id);
      await storage.updateTableStatus(table.id, "occupied", session.id);
      
      res.json({ table, session });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating session: " + error.message });
    }
  });

  app.post("/api/tables/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const table = await storage.updateTableStatus(parseInt(id), status);
      res.json(table);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating table status: " + error.message });
    }
  });

  // Sessions
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Get table details
      const table = await storage.getTable(session.tableId);
      
      res.json({ ...session, table });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching session: " + error.message });
    }
  });

  // Generate QR code
  app.get("/api/tables/:id/qr", async (req, res) => {
    try {
      const { id } = req.params;
      const table = await storage.getTable(parseInt(id));
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }

      const qrCodeDataUrl = await QRCode.toDataURL(table.qrCode);
      res.json({ qrCode: qrCodeDataUrl, tableNumber: table.number });
    } catch (error: any) {
      res.status(500).json({ message: "Error generating QR code: " + error.message });
    }
  });

  // Menu Items
  app.get("/api/menu", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching menu: " + error.message });
    }
  });

  app.post("/api/menu", async (req, res) => {
    try {
      const menuItem = await storage.createMenuItem(req.body);
      res.json(menuItem);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating menu item: " + error.message });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching orders: " + error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating order: " + error.message });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getOrderItems(parseInt(id));
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching order items: " + error.message });
    }
  });

  app.post("/api/orders/:id/items", async (req, res) => {
    try {
      const { id } = req.params;
      const itemData = insertOrderItemSchema.parse({
        ...req.body,
        orderId: parseInt(id),
      });
      const item = await storage.createOrderItem(itemData);
      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: "Error adding order item: " + error.message });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage.updateOrderStatus(parseInt(id), status);
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: "Error updating order status: " + error.message });
    }
  });

  // Sessions
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (!session.active || session.expiresAt < new Date()) {
        return res.status(401).json({ message: "Session expired" });
      }

      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching session: " + error.message });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deactivateSession(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error deactivating session: " + error.message });
    }
  });

  // Stripe payment
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderId } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "gbp",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: orderId.toString(),
        },
      });

      // Update order with payment intent ID
      if (orderId) {
        await storage.updateOrderPaymentIntent(orderId, paymentIntent.id);
      }

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Stripe webhook
  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret || !sig) {
        return res.status(400).send('Webhook signature verification failed');
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await storage.updateOrderStatus(parseInt(orderId), 'paid');
        }
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: "Webhook error: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
