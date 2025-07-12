import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders_ax9m2k1')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
        .select()
        .single()

      if (error) throw error
      
      setOrders(prev => [data, ...prev])
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
        .select()
        .single()

      if (error) throw error
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...data } : order
      ))
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err.message }
    }
  }

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    refetch: fetchOrders
  }
}