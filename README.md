# t.lal.vn PRO + Auth Email/Phone

## Tính năng mới: Đăng ký thành viên xác minh

### 1. Cấu hình Supabase Auth

Vào Supabase Dashboard > Authentication > Settings:

**Email:**
- Enable Email confirmations: ON
- Site URL: https://t.lal.vn
- Redirect URLs: https://t.lal.vn/auth/callback

**Phone (tùy chọn, cần Twilio):**
- Enable Phone confirmations: ON
- Twilio Account SID, Auth Token, Phone Number
- Nếu chưa có Twilio, test với OTP 123456 trong local (Supabase cho phép test OTP)

**Tạo bảng profiles:**
```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "public read" on profiles for select using (true);
create policy "users update own" on profiles for update using (auth.uid()=id);
create policy "users insert own" on profiles for insert with check (auth.uid()=id);
```

### 2. Deploy

- Thêm env vào Vercel:
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, AVIATIONSTACK_KEY

- Up code zip này lên repo may-bay

### 3. Luồng user

- /auth : chọn Email hoặc SĐT
- Email: Nhập tên, email, pass -> Supabase gửi link xác minh -> bấm link -> vào /
- Phone: Nhập SĐT +84 912... -> nhận OTP 6 số -> nhập OTP -> vào /
- Sau khi login, CRM, tính lãi, xuất Excel mở khóa

### 4. Test nhanh không cần SMS

Trong Supabase > Auth > Users > Add user > nhập phone + auto confirm = true để test

Hoặc dùng email magic link: thay signUp bằng signInWithOtp({email})
