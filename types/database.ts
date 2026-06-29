export type UserRole = "admin_principal" | "operador" | "cliente";

export type OrderStatus =
    | "recibido"
    | "en_proceso"
    | "preparando"
    | "listo"
    | "entregado"
    | "cancelado";

export interface Profile {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
    address: string | null;
    avatar_url: string | null;
    role: UserRole;
    telegram_chat_id: string | null;
    telegram_code: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    sort_order: number;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    category_id: string | null;
    name: string;
    slug: string;
    description: string | null;
    price: number | null;
    dimensions: {
        width?: number;
        depth?: number;
        height?: number;
    } | null;
    images: string[];
    active: boolean;
    featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    // join
    category?: Category;
}

export interface Order {
    id: string;
    user_id: string;
    order_number: string;
    status: OrderStatus;
    total_amount: number | null;
    shipping_address: {
        street?: string;
        city?: string;
        province?: string;
        notes?: string;
    } | null;
    client_notes: string | null;
    admin_notes: string | null;
    created_at: string;
    updated_at: string;
    // joins
    profile?: Profile;
    order_items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string | null;
    quantity: number;
    unit_price: number | null;
    product_snapshot: {
        name: string;
        price: number | null;
        images: string[];
        category?: string;
    };
    created_at: string;
}

export interface OrderStatusLog {
    id: string;
    order_id: string;
    changed_by: string | null;
    old_status: OrderStatus | null;
    new_status: OrderStatus;
    note: string | null;
    notified_email: boolean;
    notified_telegram: boolean;
    created_at: string;
    // join
    profile?: Profile;
}

export interface WishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
    // join
    product?: Product;
}

export interface FeaturedGallery {
    id: string;
    title: string | null;
    subtitle: string | null;
    image_url: string;
    sort_order: number;
    active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

// Tipo genérico para respuestas de Supabase
export type Database = {
    public: {
        Tables: {
            profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile>; };
            categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category>; };
            products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product>; };
            orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order>; };
            order_items: { Row: OrderItem; Insert: Partial<OrderItem>; Update: Partial<OrderItem>; };
            order_status_log: { Row: OrderStatusLog; Insert: Partial<OrderStatusLog>; Update: Partial<OrderStatusLog>; };
            wishlist: { Row: WishlistItem; Insert: Partial<WishlistItem>; Update: Partial<WishlistItem>; };
            featured_gallery: { Row: FeaturedGallery; Insert: Partial<FeaturedGallery>; Update: Partial<FeaturedGallery>; };
        };
        Enums: {
            user_role: UserRole;
            order_status: OrderStatus;
        };
    };
};