-- First, clear ALL data
TRUNCATE auth.users CASCADE;

-- Disable trigger temporarily
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Insert test users
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    last_sign_in_at,
    email_change,
    email_change_token_new,
    email_change_token_current,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    is_sso_user
) VALUES (
    'd0d4671c-d053-4c0e-b3f9-4ca5f1411159',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    '',
    '',
    '',
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Test User"}',
    NOW(),
    NOW(),
    '',
    '',
    0,
    NULL,
    '',
    false
);

-- Create profile manually
INSERT INTO profiles (id, name, email)
VALUES (
    'd0d4671c-d053-4c0e-b3f9-4ca5f1411159',
    'Test User',
    'test@example.com'
);

-- Re-enable trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;