import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const demoTransactions = [
  { id: '1', merchant: 'Whole Foods Market', category: 'Groceries', amount: 86.42, type: 'expense', occurredAt: '2026-09-15T09:30:00.000Z' },
  { id: '2', merchant: 'Adobe Creative Cloud', category: 'Subscriptions', amount: 54.99, type: 'expense', occurredAt: '2026-09-14T14:10:00.000Z' },
  { id: '3', merchant: 'Stripe payout', category: 'Income', amount: 2400, type: 'income', occurredAt: '2026-09-13T10:00:00.000Z' },
  { id: '4', merchant: 'Blue Bottle Coffee', category: 'Dining', amount: 7.8, type: 'expense', occurredAt: '2026-09-12T08:20:00.000Z' },
  { id: '5', merchant: 'Uber', category: 'Transport', amount: 24.5, type: 'expense', occurredAt: '2026-09-11T18:25:00.000Z' },
];

const demoBudgets = [
  { category: 'Housing', amount: 1800, spent: 1420, color: '#7B61FF' },
  { category: 'Food & Dining', amount: 800, spent: 634, color: '#3CCB9D' },
  { category: 'Transport', amount: 420, spent: 286, color: '#F2B84B' },
  { category: 'Subscriptions', amount: 200, spent: 155, color: '#F477A8' },
];

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ source: 'demo', transactions: demoTransactions, budgets: demoBudgets });
  }
  try {
    const [transactions, budgets] = await Promise.all([
      prisma.transaction.findMany({ orderBy: { occurredAt: 'desc' }, take: 8 }),
      prisma.budget.findMany({ orderBy: { category: 'asc' } }),
    ]);
    const spentByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: { type: 'expense' },
      _sum: { amount: true },
    });
    const spent = new Map(spentByCategory.map((item) => [item.category, Number(item._sum.amount ?? 0)]));
    return NextResponse.json({ source: 'database', transactions, budgets: budgets.map((budget) => ({ ...budget, amount: Number(budget.amount), spent: spent.get(budget.category) ?? 0 })) });
  } catch {
    return NextResponse.json({ source: 'demo', transactions: demoTransactions, budgets: demoBudgets });
  }
}
