import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useGuestOrders() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createGuestOrder = async (orderData) => {
    try {
      setLoading(true)
      setError(null)

      // Create guest order without user authentication
      const { data, error } = await supabase
        .from('orders_ax9m2k1')
        .insert([{
          ...orderData,
          user_id: null, // Guest orders have no user_id
          is_guest: true,
          guest_email: orderData.customer_info.email,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select('id, status, created_at, guest_email')
        .single()

      if (error) throw error
      
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const trackGuestOrder = async (orderId, email) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('orders_ax9m2k1')
        .select('*')
        .eq('id', orderId)
        .eq('guest_email', email)
        .eq('is_guest', true)
        .single()

      if (error) throw error
      
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createGuestOrder,
    trackGuestOrder
  }
}