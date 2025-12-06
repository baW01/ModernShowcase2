-- Additional performance indexes to speed up common queries and ordering

-- Products lookups by category relation and recency
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id_sold_created ON products(category_id, is_sold, created_at);

-- Requests list ordering/filtering
CREATE INDEX IF NOT EXISTS idx_product_requests_submitted_at ON product_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_product_requests_status_submitted ON product_requests(status, submitted_at);

-- Advertisements ordering and active fetches
CREATE INDEX IF NOT EXISTS idx_advertisements_active_priority ON advertisements(is_active, priority DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advertisements_created_at ON advertisements(created_at);

-- Time-ordered stats per product
CREATE INDEX IF NOT EXISTS idx_product_views_product_time ON product_views(product_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_clicks_product_time ON product_clicks(product_id, clicked_at DESC);

ANALYZE products;
ANALYZE product_requests;
ANALYZE advertisements;
ANALYZE product_views;
ANALYZE product_clicks;
