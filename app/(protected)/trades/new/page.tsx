'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddTradePage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [coin, setCoin] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!coin || !buyPrice || !quantity) {
      setError('Coin, buy price, and quantity are required.');
      setSubmitting(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    if (!session?.user) {
      router.push('/login');
      return;
    }

    const parsedBuyPrice = Number(buyPrice);
    const parsedQuantity = Number(quantity);
    const parsedSellPrice = sellPrice ? Number(sellPrice) : null;
    const status = parsedSellPrice !== null ? 'closed' : 'open';

    const { error: insertError } = await supabase.from('trades').insert([
      {
        user_id: session.user.id,
        coin,
        buy_price: parsedBuyPrice,
        quantity: parsedQuantity,
        sell_price: parsedSellPrice,
        status,
      },
    ]);

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col gap-3">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">New Trade</p>
          <h1 className="text-3xl font-semibold text-white">Add a new crypto position</h1>
          <p className="text-sm leading-6 text-slate-300">
            Add a trade and automatically track whether the position is open or closed.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Trade details</CardTitle>
            <CardDescription>Enter the coin, buy price, quantity, and optional sell price.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="coin">Coin</Label>
                <Input
                  id="coin"
                  value={coin}
                  onChange={(event) => setCoin(event.target.value)}
                  placeholder="BTC, ETH, SOL"
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
                  placeholder="42000"
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
                  placeholder="0.5"
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
                  placeholder="Optional"
                />
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <div className="flex items-center justify-between gap-4 pt-4">
                <Button type="submit" isLoading={submitting} disabled={submitting}>
                  Create trade
                </Button>
                <Button variant="ghost" type="button" onClick={() => router.push('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
