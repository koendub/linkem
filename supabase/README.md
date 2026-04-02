
# Supabase

Why? Data storage without a backend

# How does it work?

Supabase managed login and uses row level security to control access

# Development setup

Structure:
 - Migrations are stored in the `supabase/migrations` folder
 - Types are generated from the migrations automatically. To generate these you need
 to be logged in to supabase. Then run `npx supabase gen types typescript > src/types/supabase.ts`.

To perform any database operations (including viewing / type generation):
 - Use `npx supabase login` to login to supabase
 - Use `npx supabase db reset` to reset the database to the current migration
 - Use `npx supabase migration new <name>` to create a new migration file
 - Use `npx supabase migration up` to apply your new migration
