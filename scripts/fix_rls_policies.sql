-- Update RLS policies to include super_admin

-- Plans
DROP POLICY IF EXISTS "Admins read all plans" ON subscription_plans;
CREATE POLICY "Admins read all plans" ON subscription_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Subscriptions
DROP POLICY IF EXISTS "Admins read all subscriptions" ON subscriptions;
CREATE POLICY "Admins read all subscriptions" ON subscriptions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

DROP POLICY IF EXISTS "Admins update subscriptions" ON subscriptions;
CREATE POLICY "Admins update subscriptions" ON subscriptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
