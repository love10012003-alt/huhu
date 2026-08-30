# t.lal.vn - CanhDon PRO New Style

Style mới đen nhám #09090b + gold bo 20px, mobile-first, giống Can Tho PRO.

## Deploy lên t.lal.vn

1. Vào Supabase SQL Editor:
```sql
create table if not exists flight_cache (iata text primary key, data jsonb, updated_at timestamptz default now());
alter table flight_cache disable row level security;
```

2. Vercel env:
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, AVIATIONSTACK_KEY

3. Up code:
- Clone repo may-bay
- Copy toàn bộ file trong zip này đè lên
- git add . && git commit -m "new style pro" && git push
- Vercel tự build

4. Cron:
Vào https://t.lal.vn/api/cron -> check ok:true
Vào /api/flights?airport=VCA -> thấy 14 chuyến thật

## Tính năng
- 6 sân bay SGN/VCA/HAN/DAD/CXR/PQC
- Nhóm ≤60 phút
- CRM mini, tính lãi, Grab vs Xanh SM, Zalo, bãi đỗ, dẫn đường, voice, xuất Excel

Build: Next 14.2.35
