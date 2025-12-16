-- Add plan type to profiles
create type subscription_plan as enum ('free', 'pro');

alter table profiles 
add column plan subscription_plan not null default 'free',
add column stripe_customer_id text;

-- Create subscriptions table
create table subscriptions (
  id text primary key, -- Stripe Subscription ID
  user_id uuid references profiles(id) on delete cascade not null,
  status text not null, -- active, past_due, canceled, etc.
  price_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false
);

-- RLS
alter table subscriptions enable row level security;

create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Only service role can insert/update subscriptions (via webhook)
-- But for now we might need to allow authenticated users to read.
