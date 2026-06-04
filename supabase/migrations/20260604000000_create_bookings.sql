CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  guests INTEGER NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can read bookings
CREATE POLICY "Authenticated users can read bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

-- Service role can insert (used by edge functions)
CREATE POLICY "Service role can insert bookings"
  ON bookings FOR INSERT
  TO service_role
  WITH CHECK (true);
