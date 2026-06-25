-- Restrict bookings access to known admin accounts only.
-- Previously SELECT and DELETE were granted to ANY authenticated user
-- (USING true), which -- combined with public signup -- exposed customer
-- PII (name/email/phone) to anyone able to obtain a JWT, and allowed them
-- to delete any booking. Scope both operations to an explicit admin allowlist.

create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') in (
    'info@villaleopardi.it',
    'info@ctmarketing.it'
  );
$$;

-- SELECT: only admins may read bookings
drop policy if exists "Authenticated users can read bookings" on public.bookings;
create policy "Admins can read bookings"
  on public.bookings for select
  to authenticated
  using (public.is_admin());

-- DELETE: only admins may delete bookings
drop policy if exists "Authenticated users can delete bookings" on public.bookings;
create policy "Admins can delete bookings"
  on public.bookings for delete
  to authenticated
  using (public.is_admin());
