import type { components } from "./api";

export type AuditLog = components["schemas"]["PlayerLogs"];

export type GangMember = components["schemas"]["GangMember"];

export type Job = components["schemas"]["Job"];

export type Order = components['schemas']['Order'];
export type OrderLong = components['schemas']['OrderLong'];

export type ShopProduct = components['schemas']['ShopProduct'];

export interface BasketItem {
  id: string;
  name: string;
  pricePence: number;
  description: string;
  donatorLevel: number;
  durationDays: number;
  fulfilmentMode: string;
  quantity: number;
}

//Stats / Dashboard
export type DashboardStats = components["schemas"]["DashboardStats"];
export type DashboardTopStats = components["schemas"]["DashboardTopStats"];

// Player Data
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