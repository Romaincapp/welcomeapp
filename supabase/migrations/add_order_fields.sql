-- Add order field to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Add order field to tips table
ALTER TABLE tips ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Update existing categories with sequential order
UPDATE categories SET "order" = subquery.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM categories
) AS subquery
WHERE categories.id = subquery.id;

-- Update existing tips with sequential order within each category
UPDATE tips SET "order" = subquery.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY created_at) as row_num
  FROM tips
) AS subquery
WHERE tips.id = subquery.id;

-- Create index for better performance on ordering
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");
CREATE INDEX IF NOT EXISTS idx_tips_category_order ON tips(category_id, "order");
