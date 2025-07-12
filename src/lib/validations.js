import { z } from 'zod'

export const customerInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
})

export const promoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required for student plan'),
})

export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 500 * 1024 * 1024,
    'File size must be less than 500MB'
  ).refine(
    (file) => ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'].includes(file.type),
    'Please select a valid audio file (MP3, WAV, M4A, AAC, or OGG)'
  ),
})

export const orderSchema = z.object({
  planId: z.enum(['student', 'basic', 'business']),
  customerInfo: customerInfoSchema,
  audioFile: z.instanceof(File),
  audioDuration: z.number().positive(),
  addOns: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
  })).optional(),
  promoCode: z.string().optional(),
})