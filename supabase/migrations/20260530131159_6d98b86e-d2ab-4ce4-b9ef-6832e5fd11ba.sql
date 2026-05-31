
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-uploads', 'lesson-uploads', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read lesson uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'lesson-uploads');

CREATE POLICY "Anyone can upload lesson files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lesson-uploads');
