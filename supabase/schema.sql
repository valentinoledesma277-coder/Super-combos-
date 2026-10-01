-- ============================================================
-- SUPER COMBOS - FRESCO EN TU CASA
-- DATABASE SCHEMA & ROW LEVEL SECURITY FOR SUPABASE
-- URL: https://lazxzjumhxpetfmfbene.supabase.co
-- ============================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- 1. CATEGORIES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure columns exist if table was already created
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- ------------------------------------------------------------
-- 2. PRODUCTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    previous_price NUMERIC(10, 2) CHECK (previous_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    is_offer BOOLEAN NOT NULL DEFAULT false,
    unit VARCHAR(50) DEFAULT 'kg',
    subcategory VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all editable columns exist
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS previous_price NUMERIC(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_offer BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'kg';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ------------------------------------------------------------
-- 3. COMBOS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.combos (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    previous_price NUMERIC(10, 2) CHECK (previous_price >= 0),
    image_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    category VARCHAR(100) DEFAULT 'Super Combos',
    items_summary TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.combos ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Super Combos';
ALTER TABLE public.combos ADD COLUMN IF NOT EXISTS items_summary TEXT[];
ALTER TABLE public.combos ADD COLUMN IF NOT EXISTS previous_price NUMERIC(10, 2);
ALTER TABLE public.combos ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- ------------------------------------------------------------
-- 4. COMBO_ITEMS TABLE (Structured relation with products)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.combo_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    combo_id TEXT NOT NULL REFERENCES public.combos(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit VARCHAR(50) DEFAULT 'kg'
);

ALTER TABLE public.combo_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'kg';

-- ------------------------------------------------------------
-- 5. ORDERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    neighborhood VARCHAR(255) NOT NULL,
    notes TEXT,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('efectivo', 'transferencia', 'otro')),
    delivery_method VARCHAR(50) NOT NULL CHECK (delivery_method IN ('domicilio', 'retiro')),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    delivery_cost NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (delivery_cost >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'EN CAMINO', 'ENTREGADO', 'CANCELADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------
-- 6. ORDER_ITEMS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- ------------------------------------------------------------
-- 7. PROFILES TABLE (Associated with auth.users)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_combos_active ON public.combos(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- ------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- CATEGORIES POLICIES ---
DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
CREATE POLICY "Public can view active categories"
    ON public.categories FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;
CREATE POLICY "Admins can insert categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Admins can update categories"
    ON public.categories FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Admins can delete categories"
    ON public.categories FOR DELETE
    USING (auth.role() = 'authenticated');

-- --- PRODUCTS POLICIES ---
DROP POLICY IF EXISTS "Public can view products" ON public.products;
CREATE POLICY "Public can view products"
    ON public.products FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (auth.role() = 'authenticated');

-- --- COMBOS POLICIES ---
DROP POLICY IF EXISTS "Public can view combos" ON public.combos;
CREATE POLICY "Public can view combos"
    ON public.combos FOR SELECT
    USING (active = true OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert combos" ON public.combos;
CREATE POLICY "Admins can insert combos"
    ON public.combos FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update combos" ON public.combos;
CREATE POLICY "Admins can update combos"
    ON public.combos FOR UPDATE
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete combos" ON public.combos;
CREATE POLICY "Admins can delete combos"
    ON public.combos FOR DELETE
    USING (auth.role() = 'authenticated');

-- --- COMBO_ITEMS POLICIES ---
DROP POLICY IF EXISTS "Public can view combo items" ON public.combo_items;
CREATE POLICY "Public can view combo items"
    ON public.combo_items FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can manage combo items" ON public.combo_items;
CREATE POLICY "Admins can manage combo items"
    ON public.combo_items FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- --- ORDERS POLICIES ---
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
CREATE POLICY "Anyone can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view orders" ON public.orders;
CREATE POLICY "Admins can view orders"
    ON public.orders FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (auth.role() = 'authenticated');

-- --- ORDER_ITEMS POLICIES ---
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
CREATE POLICY "Anyone can insert order items"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view order items" ON public.order_items;
CREATE POLICY "Admins can view order items"
    ON public.order_items FOR SELECT
    USING (auth.role() = 'authenticated');

-- --- PROFILES POLICIES ---
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 10. AUTH TRIGGER FOR AUTOMATIC PROFILE CREATION
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'admin')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ------------------------------------------------------------
-- 11. STORAGE BUCKET CONFIGURATION (product-images)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT
USING (bucket_id IN ('product-images', 'products'));

DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
CREATE POLICY "Authenticated can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('product-images', 'products') AND (auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
CREATE POLICY "Authenticated can update product images"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('product-images', 'products') AND (auth.role() = 'authenticated'));

DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
CREATE POLICY "Authenticated can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id IN ('product-images', 'products') AND (auth.role() = 'authenticated'));
