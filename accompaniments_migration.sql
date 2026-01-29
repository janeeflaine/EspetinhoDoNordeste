-- Create Accompaniments Table
CREATE TABLE IF NOT EXISTS accompaniments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0.00,
  category_id TEXT NOT NULL,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE accompaniments ENABLE ROW LEVEL SECURITY;

-- Public Read Access
CREATE POLICY "Public Read Accompaniments" ON accompaniments 
  FOR SELECT USING (true);

-- Admin Full Access (assuming anon/authenticated for now based on previous pattern)
-- or restricting to authenticated role if auth is active.
-- Since we fixed auth recently, let's use authenticated for writing.
CREATE POLICY "Authenticated Insert Accompaniments" ON accompaniments 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update Accompaniments" ON accompaniments 
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete Accompaniments" ON accompaniments 
  FOR DELETE USING (auth.role() = 'authenticated');
