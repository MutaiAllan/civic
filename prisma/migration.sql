-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Users see own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid()::text = id);

-- Citizens see only their own complaints; Admins see all
CREATE POLICY "Citizens see own complaints"
  ON complaints FOR SELECT
  USING (
    auth.uid()::text = user_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN')
  );

CREATE POLICY "Citizens insert own complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Admins update any complaint"
  ON complaints FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid()::text AND role = 'ADMIN')
  );

-- Indexes for performance
CREATE INDEX idx_complaints_user_id   ON complaints(user_id);
CREATE INDEX idx_complaints_status    ON complaints(status);
CREATE INDEX idx_complaints_category  ON complaints(category);
CREATE INDEX idx_complaints_created   ON complaints(created_at DESC);
