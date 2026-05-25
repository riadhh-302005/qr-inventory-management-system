import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  productId: text("product_id").notNull().unique(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  qrCode: text("qr_code").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  qrCode: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = insertProductSchema.partial().omit({ productId: true });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof productsTable.$inferSelect;
