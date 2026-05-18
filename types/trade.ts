export type Trade = {
  id: string;
  user_id: string;
  coin: string;
  buy_price: number;
  quantity: number;
  sell_price: number | null;
  status: 'open' | 'closed';
  created_at: string;
};

export type TradeInsert = Omit<Trade, 'id' | 'user_id' | 'created_at'>;

export type TradeUpdate = {
  id: string;
} & Partial<Omit<Trade, 'id'>>;
