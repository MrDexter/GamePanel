
export interface AuditLog {
  id: number;
  eventType: string;
  playerId: string;
  performedBy: string;
  performedByName: string;
  targetName: string;
  details: string;
  createdAt: string;
}