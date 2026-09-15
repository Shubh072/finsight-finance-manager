'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Bell, ChevronDown, CreditCard, DollarSign, LayoutDashboard, List, Plus, Settings, ShoppingBag, SlidersHorizontal, Target, TrendingUp, Utensils, Wallet, Zap } from 'lucide-react';

type Transaction = { id:string; merchant:string; category:string; amount:number; type:string; occurredAt:string };
type Budget = { category:string; amount:number; spent:number; color:string };
type DashboardData = { source:string; transactions:Transaction[]; budgets:Budget[] };

const iconFor = (category: string) => category === 'Dining' ? Utensils : category === 'Subscriptions' ? Zap : category === 'Transport' ? CreditCard : ShoppingBag;
const money = (n:number) => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 }).format(n);

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  useEffect(() => { fetch('/api/dashboard').then((r) => r.json()).then(setData); }, []);
  const transactions = data?.transactions ?? [];
  const budgets = data?.budgets ?? [];
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum,t) => sum + Number(t.amount), 0);
  const income = transactions.filter((t) => t.type === 'income').reduce((sum,t) => sum + Number(t.amount), 0);
  return <div className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">⌁</div><span>finsight</span></div>
      <nav className="nav">
        <button className="active"><LayoutDashboard/><span>Overview</span></button>
        <button><List/><span>Transactions</span></button>
        <button><Target/><span>Budgets</span></button>
        <button><TrendingUp/><span>Insights</span></button>
      </nav>
      <div className="sidebar-bottom">Your money should work as hard as you do.<div className="profile"><div className="avatar">JD</div><div><strong style={{color:'#1f322a'}}>Jordan Davis</strong><br/>Personal account</div></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">Tuesday, September 15, 2026</div><h1>Good morning, Jordan<span style={{color:'#a7c6b7'}}>.</span></h1></div><div className="top-actions"><button className="icon-btn"><Bell size={16}/></button><button className="icon-btn"><Settings size={16}/></button><button className="add-btn"><Plus size={15}/> Add transaction</button></div></header>
      <section className="stats">
        <div className="card stat"><span className="stat-label">Available balance</span><strong className="stat-value">$8,420.68</strong><span className="stat-meta good"><ArrowUpRight size={13}/> 12.4% from last month</span></div>
        <div className="card stat"><span className="stat-label">Spent this month</span><strong className="stat-value">{money(expenses || 948.71)}</strong><span className="stat-meta warn"><ArrowDownRight size={13}/> 4.8% more than usual</span></div>
        <div className="card stat"><span className="stat-label">Total income</span><strong className="stat-value">{money(income || 2400)}</strong><span className="stat-meta good"><ArrowUpRight size={13}/> 8.2% from last month</span></div>
        <div className="card stat"><span className="stat-label">Savings rate</span><strong className="stat-value">34.8%</strong><span className="stat-meta good"><ArrowUpRight size={13}/> On track for your goal</span></div>
      </section>
      <section className="grid">
        <div className="card chart-card"><div className="card-head"><span className="card-title">Cash flow</span><div style={{display:'flex',gap:18,alignItems:'center'}}><div className="legend"><span><i className="dot" style={{background:'#7b61ff'}}/>Income</span><span><i className="dot" style={{background:'#a7dec1'}}/>Expenses</span></div><button className="icon-btn" style={{width:30,height:30}}><ChevronDown size={14}/></button></div></div><div className="chart"><svg viewBox="0 0 680 195" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#7b61ff" stopOpacity=".2"/><stop offset="1" stopColor="#7b61ff" stopOpacity="0"/></linearGradient></defs><path d="M0 145 C45 130,55 158,100 122 S170 80,210 101 S265 146,310 110 S370 38,410 72 S460 109,500 80 S560 27,600 55 S650 18,680 37 L680 195 L0 195Z" fill="url(#fill)"/><path d="M0 145 C45 130,55 158,100 122 S170 80,210 101 S265 146,310 110 S370 38,410 72 S460 109,500 80 S560 27,600 55 S650 18,680 37" fill="none" stroke="#7b61ff" strokeWidth="3"/><path d="M0 168 C50 160,62 171,100 153 S165 133,210 151 S270 161,310 140 S370 105,410 130 S465 145,500 120 S560 105,600 115 S650 96,680 104" fill="none" stroke="#9bd8ba" strokeWidth="3" strokeDasharray="5 6"/></svg></div><div className="chart-labels"><span>Aug 15</span><span>Aug 22</span><span>Aug 29</span><span>Sep 05</span><span>Sep 12</span></div></div>
        <div className="card budget-card"><div className="card-head"><span className="card-title">Budget overview</span><button className="card-link">Manage budgets</button></div>{budgets.map((b) => <div className="budget" key={b.category}><div className="budget-row"><span>{b.category}</span><span>{money(b.spent)} / {money(b.amount)}</span></div><div className="progress"><span style={{width:`${Math.min(100,(b.spent/b.amount)*100)}%`,background:b.color}}/></div></div>)}</div>
      </section>
      <section className="bottom-grid"><div className="card transactions"><div className="card-head"><span className="card-title">Recent transactions</span><button className="card-link">View all <span style={{fontSize:14}}>→</span></button></div>{transactions.map((t) => { const Icon = iconFor(t.category); return <div className="transaction" key={t.id}><div className="tx-icon"><Icon size={15}/></div><div className="tx-copy"><div className="tx-name">{t.merchant}</div><div className="tx-category">{t.category} · {new Date(t.occurredAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div></div><div className={`tx-amount ${t.type === 'income' ? 'income' : ''}`}>{t.type === 'income' ? '+' : '−'}{money(Number(t.amount))}</div></div> })}</div><div className="summary"><div className="eyebrow" style={{color:'#91b5a5'}}>FINSIGHT INSIGHT</div><h3>Your spending is getting calmer.</h3><p>You&apos;re spending 18% less on dining than your three-month average. That&apos;s a habit worth keeping.</p><span className="pill">View your insights&nbsp; →</span></div></section>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:14,color:'#9aaba3',fontSize:10,gap:5}}><SlidersHorizontal size={12}/> {data?.source === 'database' ? 'Synced with your database' : 'Preview data · connect DATABASE_URL to sync'}</div>
    </main>
  </div>;
}
