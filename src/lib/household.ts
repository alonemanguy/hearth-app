import { supabase } from './supabase';

export type Household = {
  id: string;
  name: string;
  invite_code: string;
  invite_code_expires_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type HouseholdMember = {
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  joined_at: string;
};

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = 'H-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function thirtyDaysFromNow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
}

export async function getCurrentHousehold(): Promise<Household | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) return null;

  const { data: household } = await supabase
    .from('households')
    .select('*')
    .eq('id', membership.household_id)
    .maybeSingle();

  return (household as Household) ?? null;
}

export async function getHouseholdMembers(
  householdId: string
): Promise<HouseholdMember[]> {
  const { data, error } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('joined_at', { ascending: true });

  if (error || !data) return [];
  return data as HouseholdMember[];
}

async function attachSoloDataToHousehold(householdId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await Promise.all([
    supabase
      .from('properties')
      .update({ household_id: householdId })
      .eq('user_id', user.id)
      .is('household_id', null),
    supabase
      .from('appliances')
      .update({ household_id: householdId })
      .eq('user_id', user.id)
      .is('household_id', null),
    supabase
      .from('tasks')
      .update({ household_id: householdId })
      .eq('user_id', user.id)
      .is('household_id', null),
  ]);
}

export async function createHousehold(
  name: string
): Promise<{ household: Household | null; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { household: null, error: 'Not signed in.' };

  let inserted: Household | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    const { data, error } = await supabase
      .from('households')
      .insert({
        name: name.trim(),
        invite_code: code,
        created_by: user.id,
        invite_code_expires_at: thirtyDaysFromNow(),
      })
      .select()
      .single();

    if (!error && data) {
      inserted = data as Household;
      break;
    }
    lastError = error?.message ?? 'Unknown error';
  }

  if (!inserted) {
    return {
      household: null,
      error: lastError ?? 'Could not create household.',
    };
  }

  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: inserted.id,
      user_id: user.id,
      role: 'owner',
    });

  if (memberError) {
    return { household: null, error: memberError.message };
  }

  await attachSoloDataToHousehold(inserted.id);

  return { household: inserted, error: null };
}

export async function joinHousehold(
  code: string
): Promise<{ household: Household | null; error: string | null }> {
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) {
    return { household: null, error: 'Enter an invite code.' };
  }

  const { data, error } = await supabase.rpc('attempt_join_household', {
    code: trimmed,
  });

  if (error) {
    console.error('Join RPC failed:', error);
    return { household: null, error: 'Could not join household.' };
  }

  if (!data || !data.ok) {
    return { household: null, error: data?.error ?? 'Join failed.' };
  }

  const household = data.household as Household;

  await attachSoloDataToHousehold(household.id);

  return { household, error: null };
}

export async function leaveHousehold(
  householdId: string
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in.' };

  const { error } = await supabase
    .from('household_members')
    .delete()
    .eq('household_id', householdId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function regenerateInviteCode(
  householdId: string
): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('regenerate_invite_code', {
    hid: householdId,
  });

  if (error) {
    console.error('Regenerate failed:', error);
    return { code: null, error: 'Could not regenerate code.' };
  }

  if (!data || !data.ok) {
    return { code: null, error: data?.error ?? 'Failed.' };
  }

  return { code: data.invite_code, error: null };
}