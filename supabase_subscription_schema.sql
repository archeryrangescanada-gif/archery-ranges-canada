DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

CREATE TABLE subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  interval TEXT NOT NULL,
  features JSONB DEFAULT '[]'::JSONB,
  badge_image TEXT,
  color TEXT,
  is_public BOOLEAN DEFAULT true,
  max_quantity INTEGER,
  allowed_provinces TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (interval IN ('month', 'year', 'lifetime'))
);

CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read plans" ON subscription_plans 
  FOR SELECT USING (is_public = true OR (auth.role() = 'service_role'));

CREATE POLICY "Admins read all plans" ON subscription_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users read own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins read all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins update subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

INSERT INTO subscription_plans (name, description, price, interval, color, badge_image, is_public, features) VALUES
('Bronze', 'Free listing', 0, 'month', 'amber', '/bronze-badge.png', true, 
  '["Basic listing", "Contact information", "✗ Photos", "✗ Featured placement"]'::JSONB
),
('Silver', 'Enhanced visibility', 49.99, 'month', 'slate', '/silver-badge.png', true,
  '["Everything in Bronze", "Up to 10 photos", "Business hours", "✗ Featured placement"]'::JSONB
),
('Gold', 'Full featured exposure', 149.99, 'month', 'yellow', '/gold-badge.png', true,
  '["Everything in Silver", "Unlimited photos", "Featured placement", "Priority support"]'::JSONB
),
('Platinum', 'Maximum dominance', 399.99, 'month', 'indigo', '/platinum-badge.png', true,
  '["Everything in Gold", "Multiple locations", "Custom branding", "API access"]'::JSONB
);

INSERT INTO subscription_plans (name, description, price, interval, color, badge_image, is_public, max_quantity, allowed_provinces, features) VALUES
('The Founder', 'Legacy Package - Locked Forever', 199.00, 'month', 'gray', '/founder-badge.png', false, 3, ARRAY['ON', 'BC'],
  '[
    "Legacy Founder Badge + Verified",
    "Pinned Top 3 of Provincial Searches",
    "Clickable Website Link",
    "Phone & Email Display",
    "Unlimited Photo Gallery",
    "YouTube Video Embed",
    "500 Word Description",
    "Events Calendar & Global Feed",
    "Home Page Feature (50km radius)",
    "No Competitor Ads on Profile",
    "Advanced Analytics Dashboard",
    "Priority Email Support"
  ]'::JSONB
);
