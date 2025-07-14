import { createClient } from '@supabase/supabase-js'

// Get credentials securely from WordPress
const SUPABASE_URL = window.aximAppData?.supabaseUrl;
const SUPABASE_ANON_KEY = window.aximAppData?.supabaseAnonKey;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials. Make sure aximAppData is loaded.');
}

// Create Supabase client
export const supabase = createClient(
  SUPABASE_URL || '',
  SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  }
)

// Helper function to check if user is logged in
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error)
    return null
  }
  return data?.session?.user || null
}

// Helper for handling file uploads
export const uploadFile = async (file, folder = 'uploads') => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    return {
      path: data.path,
      publicUrl,
      fileName: file.name,
      size: file.size
    }
  } catch (err) {
    console.error('Error uploading file:', err)
    throw err
  }
}

// Helper for creating orders
export const createOrder = async (orderData, isGuest = false) => {
  try {
    const user = await getCurrentUser()

    const { data, error } = await supabase
      .from('wp_orders_ax9m2k1')
      .insert([{
        ...orderData,
        user_id: user?.id || null,
        is_guest: isGuest,
        created_at: new Date().toISOString()
      }])
      .select('id,status,created_at')
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error creating order:', err)
    throw err
  }
}

// Helper for tracking guest orders
export const trackGuestOrder = async (orderId, email) => {
  try {
    const { data, error } = await supabase
      .from('wp_orders_ax9m2k1')
      .select('*')
      .eq('id', orderId)
      .eq('guest_email', email)
      .eq('is_guest', true)
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Error tracking order:', err)
    throw err
  }
}

// Analytics tracking
export const trackEvent = async (eventType, eventData = {}) => {
  try {
    // Use WordPress AJAX for tracking
    if (window.aximAppData?.ajaxUrl) {
      const formData = new FormData()
      formData.append('action', 'axim_track_event')
      formData.append('nonce', window.aximAppData.nonce)
      formData.append('event_type', eventType)
      formData.append('event_data', JSON.stringify(eventData))

      await fetch(window.aximAppData.ajaxUrl, {
        method: 'POST',
        body: formData
      })
    }
  } catch (error) {
    console.error('Error tracking event:', error)
  }
}

export default supabase