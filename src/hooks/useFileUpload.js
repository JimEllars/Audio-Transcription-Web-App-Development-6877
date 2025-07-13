import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function useFileUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const uploadFile = async (file, bucket = 'audio-files', folder = 'uploads') => {
    setUploading(true)
    setProgress(0)
    setError(null)
    
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      clearInterval(progressInterval)
      setProgress(100)
      
      if (error) throw error
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)
      
      setUploading(false)
      return {
        data: {
          path: data.path,
          publicUrl,
          fileName: file.name,
          size: file.size
        },
        error: null
      }
    } catch (err) {
      setUploading(false)
      setError(err.message)
      return { data: null, error: err.message }
    }
  }

  const deleteFile = async (path, bucket = 'audio-files') => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path])
      
      return { error }
    } catch (err) {
      return { error: err.message }
    }
  }

  return {
    uploadFile,
    deleteFile,
    uploading,
    progress,
    error
  }
}