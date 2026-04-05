
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

export interface Houses {
  id: string;
  location: string;
  securityLevel: string;
  virtualContents: string;
  contents: string;
  isOrgHouse: number;
  timeBought: string; 
}

export interface Vehicles {
  id: string;
  side: string;
  class: string;
  type: string;
  inventory: string;
  reg: string;
  capacity: string;
  security: string;
  acceleration: string;
  insertTime: string;
}

export interface GangMember {
  name: string;
  id: string;
  rank: number; 
}

export interface Job {
  id: number;
  type: string;
  status: string;
  result: string;
  payload: string;
  priority: boolean;
  createdAt: string;
  updatedAt: string;
}