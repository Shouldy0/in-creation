-- Redefine the handle_new_user function with robust fallbacks
create or replace function public.handle_new_user()
returns trigger as $$
declare
  username_val text;
begin
  -- Try to get username from metadata, or fallback to email prefix
  username_val := coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  
  -- Clean up username (remove spaces, lowercase)
  username_val := lower(regexp_replace(username_val, '\s+', '', 'g'));

  -- Insert profile, safegaurding against duplicates
  insert into public.profiles (id, username, full_name, avatar_url, current_state)
  values (
    new.id,
    username_val,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'Resting'
  )
  on conflict (id) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- Ensure trigger is properly bound (drop and recreate to be safe)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
