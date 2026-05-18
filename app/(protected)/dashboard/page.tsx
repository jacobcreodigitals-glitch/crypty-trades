'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Trade } from '@/types/trade';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    const fetchTrades = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const result = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      const data = result.data as Trade[] | null;
      const error = result.error;

      if (error) {
        setError(error.message);
      } else if (data) {
        setTrades(data);
      }

      setLoading(false);
    };

    fetchTrades();
  }, [router, supabase]);

  const closedTrades = useMemo(
    () => trades.filter((trade) => trade.status === 'closed' && trade.sell_price !== null),
    [trades]
  );

  const filteredTrades = useMemo(
    () => {
      if (!dateFilter) return trades;
      return trades.filter((trade) => trade.created_at.startsWith(dateFilter));
    },
    [trades, dateFilter]
  );

  const totalProfitLoss = useMemo(
    () =>
      closedTrades.reduce((sum, trade) => {
        return sum + ((trade.sell_price ?? 0) - trade.buy_price) * trade.quantity;
      }, 0),
    [closedTrades]
  );

  const winRate = useMemo(() => {
    if (!closedTrades.length) return 0;
    const wins = closedTrades.filter((trade) => (trade.sell_price ?? 0) > trade.buy_price).length;
    return Math.round((wins / closedTrades.length) * 100);
  }, [closedTrades]);

  const deleteTrade = async (id: string) => {
    if (!window.confirm('Delete this trade? This action cannot be undone.')) {
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      setError(error.message);
      return;
    }

    setTrades((current) => current.filter((trade) => trade.id !== id));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Crypty Trades</p>
          <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Your trading dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Manage your open and closed crypto trades, review performance, and stay on top of profit and loss.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => router.push('/trades/new')}>
            New Trade
          </Button>
          <Button variant="outline" onClick={logout}>
            Log Out
          </Button>
        </div>
      </div>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Total P/L USD</p>
          <p className="mt-4 text-3xl font-semibold text-white">
            {totalProfitLoss >= 0 ? '+' : '-'}${Math.abs(totalProfitLoss).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Open trades</p>
          <p className="mt-4 text-3xl font-semibold text-white">{trades.filter((trade) => trade.status === 'open').length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Closed trades</p>
          <p className="mt-4 text-3xl font-semibold text-white">{closedTrades.length}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-card p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Win rate</p>
          <p className="mt-4 text-3xl font-semibold text-white">{winRate}%</p>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-300">Filter by date added</p>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
          />
        </div>
        {dateFilter ? (
          <Button variant="outline" onClick={() => setDateFilter('')}>
            Clear date filter
          </Button>
        ) : null}
      </div>

      <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-slate-950/80 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Coin</th>
                <th className="px-6 py-4 font-medium">Buy Price</th>
                <th className="px-6 py-4 font-medium">Quantity</th>
                <th className="px-6 py-4 font-medium">Sell Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">P&L USD</th>
                <th className="px-6 py-4 font-medium">P&L %</th>
                <th className="px-6 py-4 font-medium">Actions</th>
                <th className="px-6 py-4 font-medium">Date added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-background">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    Loading trades...
                  </td>
                </tr>
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    No trades yet. Add your first position.
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const profitLoss = trade.sell_price !== null ? (trade.sell_price - trade.buy_price) * trade.quantity : 0;
                  const profitPercent = trade.sell_price !== null ? ((trade.sell_price - trade.buy_price) / trade.buy_price) * 100 : 0;
                  const isPositive = profitLoss >= 0;

                  return (
                    <tr key={trade.id} className="transition hover:bg-white/5">
                      <td className="px-6 py-4 font-medium text-white">{trade.coin}</td>
                      <td className="px-6 py-4 text-slate-200 font-mono">${trade.buy_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-slate-200 font-mono">{trade.quantity}</td>
                      <td className="px-6 py-4 text-slate-200 font-mono">
                        {trade.sell_price !== null ? `$${trade.sell_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={trade.status === 'closed' ? 'success' : 'warning'}>
                          {trade.status}
                        </Badge>
                      </td>
                      <td className={`px-6 py-4 font-mono font-semibold ${trade.sell_price !== null ? (isPositive ? 'text-emerald-400' : 'text-red-400') : 'text-slate-400'}`}>
                        {trade.sell_price !== null ? `${isPositive ? '+' : '-'}$${Math.abs(profitLoss).toFixed(2)}` : '—'}
                      </td>
                      <td className={`px-6 py-4 font-mono font-semibold ${trade.sell_price !== null ? (isPositive ? 'text-emerald-400' : 'text-red-400') : 'text-slate-400'}`}>
                        {trade.sell_price !== null ? `${isPositive ? '+' : '-'}${Math.abs(profitPercent).toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <Button variant="ghost" onClick={() => router.push(`/trades/${trade.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="outline" onClick={() => deleteTrade(trade.id)}>
                          Delete
                        </Button>
                      </td>
                      <td className="px-6 py-4 text-slate-200 font-mono">
                        {new Date(trade.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
