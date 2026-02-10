-- Categories Table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  image_url text,
  parent_id uuid references public.categories(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone." on categories for select using (true);
create policy "Admins can insert categories." on categories for insert with check (auth.role() = 'service_role' or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can update categories." on categories for update using (auth.role() = 'service_role' or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can delete categories." on categories for delete using (auth.role() = 'service_role' or exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Products Table
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  price decimal(10, 2) not null,
  compare_at_price decimal(10, 2),
  stock integer default 0 not null,
  category_id uuid references public.categories(id),
  images text[],
  is_active boolean default true,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  seller_id uuid references public.profiles(id)
);

alter table public.products enable row level security;

create policy "Active products are viewable by everyone." on products for select using (is_active = true or exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'seller')));
create policy "Admins and Sellers can insert products." on products for insert with check (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'seller')));
create policy "Admins and Sellers can update own products." on products for update using (exists (select 1 from profiles where id = auth.uid() and role = 'admin') or (seller_id = auth.uid()));
create policy "Admins and Sellers can delete own products." on products for delete using (exists (select 1 from profiles where id = auth.uid() and role = 'admin') or (seller_id = auth.uid()));

-- Product Variants
create table public.product_variants (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  sku text,
  size text,
  color text,
  stock integer default 0 not null,
  price_adjustment decimal(10, 2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.product_variants enable row level security;

create policy "Variants are viewable by everyone." on product_variants for select using (true);
create policy "Admins and Sellers can manage variants." on product_variants for all using (exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'seller')));

-- Reviews
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.reviews enable row level security;

create policy "Reviews are viewable by everyone." on reviews for select using (true);
create policy "Authenticated users can create reviews." on reviews for insert with check (auth.role() = 'authenticated');
create policy "Users can update own reviews." on reviews for update using (auth.uid() = user_id);
create policy "Users can delete own reviews." on reviews for delete using (auth.uid() = user_id);
