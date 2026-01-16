# Fix Duplicate Email Prevention

## Problem
The current system doesn't properly prevent duplicate emails in the leads table. The code has a check, but the database doesn't have a unique constraint on the email column.

## Solution

### Step 1: Add Unique Constraint in Supabase

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Add unique constraint to email column in leads table
ALTER TABLE leads 
ADD CONSTRAINT leads_email_unique UNIQUE (email);
```

This will:
- Prevent duplicate emails at the database level
- Cause an error if someone tries to insert a duplicate email
- Make the email column truly unique

### Step 2: Update the API to handle database errors properly

The API code will be updated to:
1. Remove the unnecessary `.single()` check (which can cause issues)
2. Rely on the database unique constraint
3. Handle the specific Postgres error code for unique violations

---

## Files to be Updated

1. **Database:** Run the SQL above in Supabase
2. **API:** `app/api/lead/route.ts` - Improved error handling

---

## Important Notes

⚠️ **Before running the SQL:**
- If you already have duplicate emails in your database, the constraint will fail
- You should clean up duplicates first with this SQL:

```sql
-- Find duplicates
SELECT email, COUNT(*) 
FROM leads 
GROUP BY email 
HAVING COUNT(*) > 1;

-- If duplicates exist, you can keep the first and delete others:
DELETE FROM leads a USING leads b
WHERE a.id > b.id 
AND a.email = b.email;
```
