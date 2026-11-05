-- Manual queue position for entries in the "Planned" status (1..n per media type, NULL = not yet ordered).
ALTER TABLE user_media
    ADD COLUMN IF NOT EXISTS planned_order INTEGER;
