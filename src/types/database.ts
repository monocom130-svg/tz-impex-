export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    role: 'admin' | 'customer' | 'seller' | 'rider';
    loyalty_points: number;
    created_at: string;
}

export interface Address {
    id: string;
    user_id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    parent_id: string | null;
    created_at: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    stock: number;
    category_id: string | null;
    images: string[];
    is_active: boolean;
    is_featured: boolean;
    is_flash_sale: boolean;
    flash_sale_price: number | null;
    flash_sale_end: string | null;
    seller_id: string | null;
    created_at: string;
    updated_at: string;
    // Joins
    category?: Category;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    sku: string | null;
    size: string | null;
    color: string | null;
    stock: number;
    price_adjustment: number;
    created_at: string;
}

export interface Review {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    // Joins
    user?: Profile;
}

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    min_purchase_amount: number;
    max_discount_amount: number | null;
    start_date: string;
    end_date: string | null;
    usage_limit: number | null;
    used_count: number;
    is_active: boolean;
    created_at: string;
}
