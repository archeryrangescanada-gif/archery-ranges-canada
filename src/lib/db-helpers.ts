-- Function to increment ad impressions
CREATE OR REPLACE FUNCTION increment_ad_impressions(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads 
  SET impressions_count = impressions_count + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment ad clicks
CREATE OR REPLACE FUNCTION increment_ad_clicks(ad_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ads 
  SET clicks_count = clicks_count + 1 
  WHERE id = ad_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment announcement clicks
CREATE OR REPLACE FUNCTION increment_announcement_clicks(announcement_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE announcements 
  SET clicks_count = clicks_count + 1 
  WHERE id = announcement_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment listing views
CREATE OR REPLACE FUNCTION increment_listing_views(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE business_listings 
  SET views_count = views_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment announcement views
CREATE OR REPLACE FUNCTION increment_announcement_views(announcement_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE announcements 
  SET views_count = views_count + 1 
  WHERE id = announcement_id;
END;
$$ LANGUAGE plpgsql;