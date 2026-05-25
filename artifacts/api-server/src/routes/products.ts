import { Router } from "express";
import { eq, ilike, or, sql } from "drizzle-orm";
import QRCode from "qrcode";
import { db, productsTable } from "@workspace/db";
import {
  CreateProductBody,
  UpdateProductBody,
  ListProductsQueryParams,
  GetProductParams,
  UpdateProductParams,
  DeleteProductParams,
  GetProductByProductIdParams,
} from "@workspace/api-zod";
import { getAuth } from "@clerk/express";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

function generateProductId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "PRD-";
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

router.get("/products", requireAuth, async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { search, category } = parsed.data;

  let query = db.select().from(productsTable);

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${search}%`),
        ilike(productsTable.productId, `%${search}%`),
        ilike(productsTable.category, `%${search}%`),
      ),
    );
  }
  if (category) {
    conditions.push(eq(productsTable.category, category));
  }

  let products;
  if (conditions.length > 0) {
    products = await (query as any).where(
      conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`,
    );
  } else {
    products = await query;
  }

  res.json(products.map(formatProduct));
});

router.post("/products", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, category, quantity, price, productId: customProductId } = parsed.data;
  const productId = customProductId ?? generateProductId();

  const qrCode = await QRCode.toDataURL(productId);

  const [product] = await db
    .insert(productsTable)
    .values({
      name,
      productId,
      category,
      quantity,
      price: String(price),
      qrCode,
    })
    .returning();

  res.status(201).json(formatProduct(product));
});

router.get("/products/categories", requireAuth, async (req, res): Promise<void> => {
  const rows = await db
    .selectDistinct({ category: productsTable.category })
    .from(productsTable)
    .orderBy(productsTable.category);

  res.json(rows.map((r) => r.category));
});

router.get("/products/by-product-id/:productId", requireAuth, async (req, res): Promise<void> => {
  const parsed = GetProductByProductIdParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.productId, parsed.data.productId));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.get("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const parsed = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.put("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const paramsParsed = UpdateProductParams.safeParse({ id: Number(req.params.id) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const bodyParsed = UpdateProductBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  const { name, category, quantity, price } = bodyParsed.data;
  if (name !== undefined) updates.name = name;
  if (category !== undefined) updates.category = category;
  if (quantity !== undefined) updates.quantity = quantity;
  if (price !== undefined) updates.price = String(price);

  const [product] = await db
    .update(productsTable)
    .set(updates)
    .where(eq(productsTable.id, paramsParsed.data.id))
    .returning();

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json(formatProduct(product));
});

router.delete("/products/:id", requireAuth, async (req, res): Promise<void> => {
  const parsed = DeleteProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [deleted] = await db
    .delete(productsTable)
    .where(eq(productsTable.id, parsed.data.id))
    .returning({ id: productsTable.id });

  if (!deleted) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.status(204).send();
});

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    productId: p.productId,
    category: p.category,
    quantity: p.quantity,
    price: Number(p.price),
    qrCode: p.qrCode,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export default router;
