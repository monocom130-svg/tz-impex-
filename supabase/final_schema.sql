-- T-Z IMPEX FINAL DATABASE SCHEMA
-- RUN THIS IN SUPABASE SQL EDITOR
-- 1. Enable Extensions
create extension if not exists "uuid-ossp";
-- 2. Profiles Table
create table public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    email text unique not null,
    full_name text,
    avatar_url text,
    phone text,
    role text check (role in ('admin', 'customer', 'seller', 'rider')) default 'customer',
    loyalty_points integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 3. Categories Table
create table public.categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 4. Products Table
create table public.products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    slug text unique not null,
    description text,
    price decimal(10, 2) not null,
    stock integer default 0 not null,
    category_id uuid references public.categories(id),
    images text [],
    is_active boolean default true,
    is_featured boolean default false,
    is_flash_sale boolean default false,
    flash_sale_price decimal(10, 2),
    flash_sale_end timestamp with time zone,
    seller_id uuid references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 5. Coupons Table
create table public.coupons (
    id uuid default uuid_generate_v4() primary key,
    code text unique not null,
    discount_type text check (discount_type in ('percentage', 'fixed')) not null,
    discount_value decimal(10, 2) not null,
    min_purchase_amount decimal(10, 2) default 0,
    max_discount_amount decimal(10, 2),
    start_date timestamp with time zone not null,
    end_date timestamp with time zone,
    usage_limit integer,
    used_count integer default 0,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 6. Addresses Table
create table public.addresses (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    full_name text not null,
    phone text not null,
    address_line1 text not null,
    city text not null,
    state text not null,
    postal_code text not null,
    country text default 'Bangladesh',
    is_default boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 7. Orders Table
create table public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) not null,
    shipping_address_id uuid references public.addresses(id) not null,
    total_amount decimal(10, 2) not null,
    status text check (
        status in (
            'pending',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'return_requested'
        )
    ) default 'pending',
    delivery_method text default 'standard',
    coupon_id uuid references public.coupons(id),
    discount_amount decimal(10, 2) default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 8. Order Items Table
create table public.order_items (
    id uuid default uuid_generate_v4() primary key,
    order_id uuid references public.orders(id) on delete cascade not null,
    product_id uuid references public.products(id) not null,
    quantity integer not null,
    price_at_purchase decimal(10, 2) not null
);
-- 9. Reviews Table
create table public.reviews (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.products(id) on delete cascade not null,
    rating integer check (
        rating >= 1
        and rating <= 5
    ) not null,
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 10. Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.coupons enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
-- Policies (Simplified for deployment)
create policy "Public Select All" on public.categories for
select using (true);
create policy "Public Select All" on public.products for
select using (true);
create policy "Public Select All" on public.reviews for
select using (true);
create policy "Public Select All" on public.profiles for
select using (true);
create policy "Users own profile update" on public.profiles for
update using (auth.uid() = id);
create policy "Users own address" on public.addresses for all using (auth.uid() = user_id);
create policy "Users own orders" on public.orders for
select using (auth.uid() = user_id);
create policy "Users insert orders" on public.orders for
insert with check (auth.uid() = user_id);
create policy "Users insert order items" on public.order_items for
insert with check (true);
-- Simplified
create policy "Users insert reviews" on public.reviews for
insert with check (auth.role() = 'authenticated');
create policy "Review owners update/delete" on public.reviews for all using (auth.uid() = user_id);
create policy "Admins manage everything" on public.products for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins manage everything" on public.coupons for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
create policy "Admins manage everything" on public.orders for all using (
    exists (
        select 1
        from profiles
        where id = auth.uid()
            and role = 'admin'
    )
);
-- Rider Access
create policy "Riders view active orders" on public.orders for
select using (
        exists (
            select 1
            from profiles
            where id = auth.uid()
                and role = 'rider'
        )
    );
create policy "Riders update order status" on public.orders for
update using (
        exists (
            select 1
            from profiles
            where id = auth.uid()
                and role = 'rider'
        )
    );
-- 11. Auth Hook for Profile Creation
create or replace function public.handle_new_user() returns trigger language plpgsql security definer
set search_path = public as $$ begin
insert into public.profiles (id, email, full_name, avatar_url)
values (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
return new;
end;
$$;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();