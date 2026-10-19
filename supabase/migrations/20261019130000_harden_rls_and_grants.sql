-- Hearth: harden row level security evaluation, index foreign keys,
-- and tighten function grants.
--
-- Three changes, none of which alter what a signed in user can do:
--
-- 1. Policies called auth.uid() directly, so Postgres re-evaluated it for every
--    row a query touched. Writing it as (select auth.uid()) makes it an
--    InitPlan that is evaluated once per query instead. Same answer, far less
--    work once tables grow.
-- 2. A foreign key without an index on the child column makes deleting or
--    updating the parent row scan the whole child table. One index per
--    foreign key that was missing one.
-- 3. attempt_join_household and regenerate_invite_code are SECURITY DEFINER
--    and are only called from signed in screens. Postgres grants EXECUTE to
--    PUBLIC by default, so the anon role could reach them. They refused to
--    do anything (they check auth.uid() first and returned "Not signed in."),
--    but the surface should not exist at all. get_my_household_ids keeps its
--    grant, because policies call it while running as anon.

-- 1. Policies -----------------------------------------------------

alter policy "Delete appliances own" on public.appliances using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Insert appliances own" on public.appliances with check ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Read appliances own or household" on public.appliances using (((( SELECT auth.uid() AS uid) = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
alter policy "Update appliances own or household" on public.appliances using (((( SELECT auth.uid() AS uid) = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
alter policy "Members view each other" on public.household_members using (((household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids)) OR (user_id = ( SELECT auth.uid() AS uid))));
alter policy "Owners insert themselves on household creation" on public.household_members with check (((user_id = ( SELECT auth.uid() AS uid)) AND (household_id IN ( SELECT households.id
   FROM households
  WHERE (households.created_by = ( SELECT auth.uid() AS uid))))));
alter policy "Users leave or owners remove" on public.household_members using (((user_id = ( SELECT auth.uid() AS uid)) OR (household_id IN ( SELECT households.id
   FROM households
  WHERE (households.created_by = ( SELECT auth.uid() AS uid))))));
alter policy "Authenticated users create households" on public.households with check ((( SELECT auth.uid() AS uid) = created_by));
alter policy "Members view their household" on public.households using (((id IN ( SELECT get_my_household_ids() AS get_my_household_ids)) OR (created_by = ( SELECT auth.uid() AS uid))));
alter policy "Owners update their household" on public.households using ((created_by = ( SELECT auth.uid() AS uid)));
alter policy "Users read own attempts" on public.join_attempts using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users insert own prefs" on public.notification_preferences with check ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users read own prefs" on public.notification_preferences using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users update own prefs" on public.notification_preferences using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users read own notifications" on public.notifications using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users update own notifications" on public.notifications using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Delete properties own" on public.properties using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Insert properties own" on public.properties with check ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Read properties own or household" on public.properties using (((( SELECT auth.uid() AS uid) = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
alter policy "Update properties own or household" on public.properties using (((( SELECT auth.uid() AS uid) = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
alter policy "Users delete own subs" on public.push_subscriptions using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users insert own subs" on public.push_subscriptions with check ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Users read own subs" on public.push_subscriptions using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Delete tasks own" on public.tasks using ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Insert tasks own" on public.tasks with check ((( SELECT auth.uid() AS uid) = user_id));
alter policy "Read tasks own or household" on public.tasks using (((( SELECT auth.uid() AS uid) = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));
alter policy "Update tasks own or household" on public.tasks using (((( SELECT auth.uid() AS uid) = user_id) OR (household_id IN ( SELECT get_my_household_ids() AS get_my_household_ids))));

-- 2. Foreign key indexes ------------------------------------------

create index if not exists idx_appliances_property_id on public.appliances (property_id);
create index if not exists idx_appliances_user_id on public.appliances (user_id);
create index if not exists idx_households_created_by on public.households (created_by);
create index if not exists idx_notifications_appliance_id on public.notifications (appliance_id);
create index if not exists idx_notifications_task_id on public.notifications (task_id);
create index if not exists idx_properties_user_id on public.properties (user_id);
create index if not exists idx_tasks_appliance_id on public.tasks (appliance_id);
create index if not exists idx_tasks_user_id on public.tasks (user_id);

-- 3. Function grants ----------------------------------------------

revoke execute on function public.attempt_join_household(text) from public, anon;
revoke execute on function public.regenerate_invite_code(uuid) from public, anon;
