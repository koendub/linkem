-- Add support for multiple injectable element kinds (link, text, subpage)
ALTER TABLE links RENAME COLUMN href_format TO url_format;
ALTER TABLE links ALTER COLUMN url_format DROP NOT NULL;
ALTER TABLE links ADD COLUMN type TEXT NOT NULL DEFAULT 'link' CHECK (type IN ('link', 'text', 'subpage'));
ALTER TABLE links ADD COLUMN iframe_width TEXT;
ALTER TABLE links ADD COLUMN iframe_height TEXT;
