-- CLASS FEEDBACK: votes 테이블 및 RLS 정책
create table if not exists public.votes (
  id bigint generated always as identity primary key,
  rating text not null check (rating in ('satisfied', 'neutral', 'dissatisfied')),
  created_at timestamptz not null default now()
);

alter table public.votes enable row level security;

-- 테이블 권한: anon은 INSERT만, authenticated(관리자)는 SELECT/INSERT/DELETE (UPDATE 없음)
revoke all on table public.votes from anon, authenticated;
grant insert on table public.votes to anon;
grant select, insert, delete on table public.votes to authenticated;

-- RLS 정책
drop policy if exists "anon can insert votes" on public.votes;
create policy "anon can insert votes" on public.votes
  for insert to anon with check (rating in ('satisfied', 'neutral', 'dissatisfied'));

drop policy if exists "admin can select votes" on public.votes;
create policy "admin can select votes" on public.votes
  for select to authenticated using (true);

drop policy if exists "admin can insert votes" on public.votes;
create policy "admin can insert votes" on public.votes
  for insert to authenticated with check (true);

drop policy if exists "admin can delete votes" on public.votes;
create policy "admin can delete votes" on public.votes
  for delete to authenticated using (true);
