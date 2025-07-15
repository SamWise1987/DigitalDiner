import { 
  tables, 
  menuItems, 
  orders, 
  orderItems, 
  sessions,
  type Table, 
  type InsertTable,
  type MenuItem,
  type InsertMenuItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Session,
  type InsertSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // Tables
  getTables(): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  getTableByQrCode(qrCode: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTableStatus(id: number, status: string, sessionId?: string): Promise<Table | undefined>;

  // Menu Items
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByTable(tableId: number): Promise<Order[]>;
  getOrdersBySession(sessionId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrderPaymentIntent(id: number, paymentIntentId: string): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Sessions
  createSession(tableId: number): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getActiveSession(tableId: number): Promise<Session | undefined>;
  deactivateSession(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Tables
  async getTables(): Promise<Table[]> {
    return await db.select().from(tables).orderBy(tables.number);
  }

  async getTable(id: number): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.id, id));
    return table || undefined;
  }

  async getTableByQrCode(qrCode: string): Promise<Table | undefined> {
    const [table] = await db.select().from(tables).where(eq(tables.qrCode, qrCode));
    return table || undefined;
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const qrCode = nanoid(12);
    const [table] = await db
      .insert(tables)
      .values({ ...insertTable, qrCode })
      .returning();
    return table;
  }

  async updateTableStatus(id: number, status: string, sessionId?: string): Promise<Table | undefined> {
    const [table] = await db
      .update(tables)
      .set({ status, sessionId })
      .where(eq(tables.id, id))
      .returning();
    return table || undefined;
  }

  // Menu Items
  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.available, true));
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return item || undefined;
  }

  async createMenuItem(insertItem: any): Promise<MenuItem> {
    const [item] = await db
      .insert(menuItems)
      .values({
        name: insertItem.name,
        description: insertItem.description,
        price: insertItem.price,
        category: insertItem.category,
        imageUrl: insertItem.imageUrl,
        tags: insertItem.tags || [],
        available: insertItem.available !== undefined ? insertItem.available : true
      })
      .returning();
    return item;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrdersByTable(tableId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.tableId, tableId));
  }

  async getOrdersBySession(sessionId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.sessionId, sessionId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async updateOrderPaymentIntent(id: number, paymentIntentId: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ stripePaymentIntentId: paymentIntentId })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db
      .insert(orderItems)
      .values(insertItem)
      .returning();
    return item;
  }

  // Sessions
  async createSession(tableId: number): Promise<Session> {
    const sessionId = nanoid(16);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [session] = await db
      .insert(sessions)
      .values({
        id: sessionId,
        tableId,
        expiresAt,
        active: true,
      })
      .returning();

    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session || undefined;
  }

  async getActiveSession(tableId: number): Promise<Session | undefined> {
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.tableId, tableId), eq(sessions.active, true)));
    return session || undefined;
  }

  async deactivateSession(id: string): Promise<void> {
    await db
      .update(sessions)
      .set({ active: false })
      .where(eq(sessions.id, id));
  }
}

export const storage = new DatabaseStorage();
