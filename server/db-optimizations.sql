-- Database optimization indexes for better performance
-- Run these queries manually in your database to improve query performance

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_sold ON products(is_sold);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_views ON products(views);
CREATE INDEX IF NOT EXISTS idx_products_clicks ON products(clicks);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category_sold ON products(category_id, is_sold);
CREATE INDEX IF NOT EXISTS idx_products_sold_created ON products(is_sold, created_at);
CREATE INDEX IF NOT EXISTS idx_products_category_created ON products(category_id, created_at);

-- Indexes for product statistics tables
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_ip_product ON product_views(ip_address, product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_product_id ON product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_ip_product ON product_clicks(ip_address, product_id);

-- Index for product requests
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_created ON product_requests(created_at);

-- Index for delete requests
CREATE INDEX IF NOT EXISTS idx_delete_requests_status ON delete_requests(status);
CREATE INDEX IF NOT EXISTS idx_delete_requests_product_id ON delete_requests(product_id);

-- Text search indexes for product title and description
CREATE INDEX IF NOT EXISTS idx_products_title_gin ON products USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_description_gin ON products USING gin(to_tsvector('english', description));

-- Analyze tables for better query planning
ANALYZE products;
ANALYZE product_views;
ANALYZE product_clicks;
ANALYZE product_requests;
ANALYZE delete_requests;
ANALYZE categories;
ANALYZE settings;