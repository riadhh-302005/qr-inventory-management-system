import { Router } from "express";
import { desc, lte, sql } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
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

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const [totals] = await db
    .select({
      totalProducts: sql<number>`count(*)::int`,
      totalValue: sql<number>`coalesce(sum(price::numeric * quantity), 0)::float`,
      lowStockCount: sql<number>`count(*) filter (where quantity <= 5)::int`,
    })
    .from(productsTable);

  const categoryRows = await db
    .select({
      category: productsTable.category,
      count: sql<number>`count(*)::int`,
      totalValue: sql<number>`coalesce(sum(price::numeric * quantity), 0)::float`,
    })
    .from(productsTable)
    .groupBy(productsTable.category)
    .orderBy(productsTable.category);

  res.json({
    totalProducts: totals?.totalProducts ?? 0,
    totalValue: totals?.totalValue ?? 0,
    lowStockCount: totals?.lowStockCount ?? 0,
    categoryCount: categoryRows.length,
    categoryBreakdown: categoryRows,
  });
});

router.get("/dashboard/low-stock", requireAuth, async (req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .where(lte(productsTable.quantity, 5))
    .orderBy(productsTable.quantity);

  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      productId: p.productId,
      category: p.category,
      quantity: p.quantity,
      price: Number(p.price),
      qrCode: p.qrCode,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  );
});

router.get("/dashboard/recent", requireAuth, async (req, res): Promise<void> => {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.updatedAt))
    .limit(10);

  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      productId: p.productId,
      category: p.category,
      quantity: p.quantity,
      price: Number(p.price),
      qrCode: p.qrCode,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  );
});

export default router;
