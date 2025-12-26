import { supabase } from './supabase'
import { hashPassword } from './password'

/**
 * Sync a Supabase Auth user to the oneapp_users table
 * @param supabaseUserId - The Supabase Auth user ID
 * @param email - User email
 * @param name - User name
 * @param passwordHash - Optional password hash (for new users)
 */
export async function syncUserToOneAppUsers(
  supabaseUserId: string,
  email: string,
  name: string,
  passwordHash?: string
): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }

  try {
    // Check if user already exists in oneapp_users
    const { data: existingUser, error: fetchError } = await supabase
      .from('oneapp_users')
      .select('id')
      .eq('email', email)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected for new users
      throw fetchError
    }

    if (existingUser) {
      // Update existing user
      const updateData: any = {
        name,
        updated_at: new Date().toISOString(),
      }

      if (passwordHash) {
        updateData.password = passwordHash
      }

      const { error: updateError } = await supabase
        .from('oneapp_users')
        .update(updateData)
        .eq('id', existingUser.id)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new user
      // Only include fields that exist in the database
      const insertData: any = {
        id: supabaseUserId,
        name,
        email,
      }

      // Only add password if passwordHash is provided and the column exists
      // If password column doesn't exist, this will be ignored
      if (passwordHash) {
        insertData.password = passwordHash
      }

      const { error: insertError, data } = await supabase
        .from('oneapp_users')
        .insert(insertData)
        .select()

      if (insertError) {
        // If error is about password column not existing, try without it
        if (insertError.message?.includes('password') || insertError.message?.includes('column')) {
          console.warn('Password column may not exist, retrying without password field')
          const { error: retryError } = await supabase
            .from('oneapp_users')
            .insert({
              id: supabaseUserId,
              name,
              email,
            })
          
          if (retryError) {
            throw retryError
          }
        } else {
          throw insertError
        }
      }
    }
  } catch (error: any) {
    console.error('Error syncing user to oneapp_users:', error)
    throw new Error(`Failed to sync user: ${error.message}`)
  }
}

