import { db } from '@/lib/db'

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'

export async function createNotification(params: {
  userId: string
  title: string
  message: string
  type?: NotificationType
  relatedEntityType?: string
  relatedEntityId?: string
}) {
  return db.notification.create({
    data: {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type || 'INFO',
      relatedEntityType: params.relatedEntityType || null,
      relatedEntityId: params.relatedEntityId || null,
    },
  })
}
