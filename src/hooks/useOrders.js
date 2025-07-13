import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const fetchOrders = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Only select necessary columns for performance
      const { data, error } = await supabase
        .from('orders_ax9m2k1')
        .select('id, plan_id, status, total_price, duration, file_name, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = async (orderData) => {
    try {
      const { data, error } = await supabase
        .from('orders_ax9m2k1')
        .insert([{
          user_id: user?.id,
          ...orderData,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select('id, status, created_at')
        .single()

      if (error) throw error
      
      // Add to local state for immediate UI update
      setOrders(prev => [{ ...orderData, ...data }, ...prev])
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  const updateOrderStatus = async (orderId, status, additionalData = {}) => {
    try {
      const { data, error } = await supabase
        .from('orders_ax9m2k1')
        .update({ 
          status, 
          ...additionalData,
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId)
        .select('id, status, updated_at')
        .single()

      if (error) throw error
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...data } : order
      ))
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  // Set up real-time subscription for order updates
  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders_ax9m2k1',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        setOrders(prev => prev.map(order => 
          order.id === payload.new.id ? { ...order, ...payload.new } : order
        ))
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  }
}