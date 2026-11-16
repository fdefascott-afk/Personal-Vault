import { supabase } from '../lib/supabase'

const activityFields = 'id, title, description, scheduled_at'

async function getUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) throw error
  if (!user) throw new Error('Inicia sesión para administrar tu agenda.')

  return user.id
}

export async function listActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select(activityFields)
    .order('scheduled_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createActivity(activity) {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('activities')
    .insert({ ...activity, user_id: userId })
    .select(activityFields)
    .single()

  if (error) throw error
  return data
}

export async function updateActivity(id, activity) {
  const { data, error } = await supabase
    .from('activities')
    .update(activity)
    .eq('id', id)
    .select(activityFields)
    .single()

  if (error) throw error
  return data
}

export async function deleteActivity(id) {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', id)
    .select('id')
    .single()

  if (error) throw error
}
