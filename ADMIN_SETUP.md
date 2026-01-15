# Admin System Setup Guide

This guide will help you set up the admin profile system and create admin users.

## Step 1: Run the Profiles Migration

You need to run the `add_profiles_table.sql` migration in your Supabase database.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** section (left sidebar)
3. Click **"New Query"**
4. Copy the entire contents of `add_profiles_table.sql`
5. Paste it into the SQL editor
6. Click **"Run"** to execute the migration

### Option B: Using Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db push
```

## Step 2: Create Your First Admin User

After running the migration, you need to promote your user account to admin.

### Method 1: Using Supabase SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Run this query (replace with your email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

### Method 2: Create a New Admin User

If you haven't signed up yet:

1. Sign up for an account on your website at `/admin/login`
2. Then run the SQL query above to promote yourself to admin
3. Sign out and sign back in

## Step 3: Verify Admin Access

1. Navigate to `/admin/login`
2. Sign in with your admin credentials
3. You should be redirected to `/admin/dashboard`
4. If you see the dashboard, you're all set!

## User Roles

The system supports three roles:

- **user**: Regular users (default for new signups)
- **owner**: Range owners who can manage their listings
- **admin**: Full admin access to all features

## Managing Admin Users

### Promote a User to Admin

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'user@example.com';
```

### Demote an Admin to User

```sql
UPDATE profiles
SET role = 'user'
WHERE email = 'admin@example.com';
```

### List All Admin Users

```sql
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

## Troubleshooting

### "Access Denied" after signing in

- Make sure the profiles table was created successfully
- Verify your user has `role = 'admin'` in the profiles table
- Check the browser console for any errors

### Profiles table doesn't exist

- Run the `add_profiles_table.sql` migration again
- Check the Supabase logs for any migration errors

### Existing users don't have profiles

The migration includes a statement to create profiles for existing users:

```sql
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

## Security Notes

- The profiles table uses Row Level Security (RLS)
- Users can only view and update their own profile
- Users cannot change their own role
- Only admins can view all profiles and manage roles
- Admins cannot delete their own profile

## Automatic Profile Creation

The migration sets up a trigger that automatically creates a profile for any new user that signs up. New users will have the `user` role by default.
