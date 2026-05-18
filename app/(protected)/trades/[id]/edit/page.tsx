'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Trade } from '@/types/trade';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EditTradePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [coin, setCoin] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTrade = async () => {
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
        .eq('id', params.id)
        .single();

      const data = result.data as Trade | null;
      const error = result.error;

      if (error || !data || data.user_id !== session.user.id) {
        router.push('/dashboard');
        return;
      }

      setTrade(data);
      setCoin(data.coin);
      setBuyPrice(data.buy_price.toString());
      setQuantity(data.quantity.toString());
      setSellPrice(data.sell_price !== null ? data.sell_price.toString() : '');
      setLoading(false);
    };

    loadTrade();
  }, [params.id, router, supabase]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);

    if (!trade || !coin || !buyPrice || !quantity) {
      setError('Coin, buy price, and quantity are required.');
      setSaving(false);
      return;
    }

    const parsedBuyPrice = Number(buyPrice);
    const parsedQuantity = Number(quantity);
    const parsedSellPrice = sellPrice ? Number(sellPrice) : null;
    const status = parsedSellPrice !== null ? 'closed' : 'open';

    const { error: updateError } = await supabase
      .from('trades')
      .update({
        coin,
        buy_price: parsedBuyPrice,
        quantity: parsedQuantity,
        sell_price: parsedSellPrice,
        status,
      })
      .eq('id', params.id)
      .eq('user_id', trade.user_id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Edit Trade</p>
          <h1 className="text-3xl font-semibold text-white">Update your trade</h1>
          <p className="text-sm leading-6 text-slate-300">
            Adjust the position details and save your changes.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Editing {trade?.coin ?? 'trade'}</CardTitle>
            <CardDescription>Modify values and change the trade status automatically.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-slate-400">Loading trade details…</p>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="coin">Coin</Label>
                  <Input
                    id="coin"
                    value={coin}
                    onChange={(event) => setCoin(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="buyPrice">Buy Price (USD)</Label>
                  <Input
                    id="buyPrice"
                    type="number"
                    step="0.01"
                    value={buyPrice}
                    onChange={(event) => setBuyPrice(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.0001"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sellPrice">Sell Price (USD)</Label>
                  <Input
                    id="sellPrice"
                    type="number"
                    step="0.01"
                    value={sellPrice}
                    onChange={(event) => setSellPrice(event.target.value)}
                    placeholder="Leave empty to keep open"
                  />
                </div>
                {error ? <p className="text-sm text-red-400">{error}</p> : null}
                <div className="flex items-center justify-between gap-4 pt-4">
                  <Button type="submit" isLoading={saving} disabled={saving}>
                    Save changes
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => router.push('/dashboard')}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
