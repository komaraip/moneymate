UPDATE users
SET role = 'admin'
WHERE role = 'owner';

UPDATE users
SET role = 'user'
WHERE role = 'viewer';

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'user'));
