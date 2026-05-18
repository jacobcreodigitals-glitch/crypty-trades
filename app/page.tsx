import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/lib/supabase/server';

export default async function HomePage() {
  const supabase = createSupabaseServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  }

  redirect('/login');
}
