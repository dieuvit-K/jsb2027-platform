import { db } from './store'
import { authApi } from './auth'
import type { AuditLogEntry } from '../types'

/** Journalisation des actions sensibles (administration). */
export async function audit(
  action: string,
  resourceType: string,
  resourceId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  const session = authApi.session()
  const entry: Omit<AuditLogEntry, 'id'> = {
    editionId: 'jsb-2027',
    userId: session?.userId ?? 'anonymous',
    userEmail: session?.email ?? 'system',
    action,
    resourceType,
    resourceId,
    metadata,
    createdAt: 0,
    updatedAt: 0,
  }
  await db.auditLogs.add(entry)
}
