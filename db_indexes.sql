-- Optimize Range Queries
CREATE INDEX IF NOT EXISTS idx_ranges_province ON ranges(province_id);
CREATE INDEX IF NOT EXISTS idx_ranges_city ON ranges(city_id);
CREATE INDEX IF NOT EXISTS idx_ranges_featured ON ranges(is_featured);
CREATE INDEX IF NOT EXISTS idx_ranges_name_trgm ON ranges USING gin(name gin_trgm_ops);

-- Optimize Verification Requests
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);

-- Optimize Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Full Text Search (if supported by Supabase version)
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
