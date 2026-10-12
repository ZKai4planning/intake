import { z } from 'zod'

const questionAnswerSchema = z.object({
  rowId: z.string(),
  value: z.union([z.string(), z.array(z.string()), z.null()]),
  flaggedForUpsell: z.boolean().optional(),
})

export const intakeUpsertSchema = z.object({
  id: z.string().min(1),
  actorId: z.enum(['homeowner', 'landlord', 'developer', 'consultant', 'architect', 'business', 'builder']),
  tier: z.enum(['simple', 'standard', 'advanced', 'professional', 'enterprise']),
  answers: z.record(z.string(), questionAnswerSchema),
})

const projectAddressSchema = z.object({
  postcode: z.string(),
  line1: z.string(),
  city: z.string(),
  council: z.string(),
})

const constraintResultSchema = z.object({
  label: z.string(),
  status: z.enum(['warning', 'clear']),
})

const purchaseItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  price: z.number(),
})

const projectPurchaseSchema = z.object({
  items: z.array(purchaseItemSchema),
  total: z.number(),
  paidAt: z.string(),
})

const consultantBookingSchema = z.object({
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
  bookedAt: z.string(),
})

export const projectPatchSchema = z.object({
  address: projectAddressSchema.optional(),
  constraints: z.array(constraintResultSchema).optional(),
  purchase: projectPurchaseSchema.optional(),
  consultantBooking: consultantBookingSchema.optional(),
  serviceId: z.string().optional(),
  featureTitle: z.string().optional(),
  status: z.literal('submitted').optional(),
})
