import { createClient } from '@supabase/supabase-js';

// ↓↓↓ STEP 3에서 복사한 값으로 교체 ↓↓↓
const SUPABASE_URL = 'https://eiikhqlwxdrcafcyulsr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpaWtocWx3eGRyY2FmY3l1bHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3Mjc0MjgsImV4cCI6MjA5NjMwMzQyOH0.zlw20d_Es0OcLH4qVccLZNN645IwkSjDbUx6vw8z-So';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 데이터 불러오기 (없으면 fallback 사용)
export async function loadData<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase
    .from('app_state')
    .select('data')
    .eq('key', key)
    .maybeSingle();
  if (error || !data) return fallback;
  return data.data as T;
}

// 데이터 저장하기
export async function saveData(key: string, value: unknown) {
  await supabase.from('app_state').upsert({ key, data: value });
}