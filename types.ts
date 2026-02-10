
export type TaskStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Canceled';
export type TaskCategory = 'EVS' | 'BioMed' | 'Engineering';

export interface EVSTask {
  id: string;
  roomNumber: string;
  category: TaskCategory;
  facility: string;
  description: string;
  status: TaskStatus;
  assignedTo?: string;
  startTime?: string;
  endTime?: string;
  expectedDuration: number; // in minutes
  priority: 'High' | 'Medium' | 'Low';
  isEscalated?: boolean;
  createdAt: string;
  location: { x: number; y: number }; // Coordinates on floor plan 0-100
  recurrence?: {
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    endDate?: string;
  };
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: 'Available' | 'In Use' | 'Maintenance';
  location: { x: number; y: number };
}

export interface RoomDetail {
  roomNumber: string;
  type: 'ICU' | 'MedSurg' | 'Emergency' | 'Surgery' | 'Isolation';
  facility: string;
  patientName?: string;
  temperature: number;
  humidity: number;
  pressure: 'Positive' | 'Negative' | 'Neutral';
  assets: Asset[];
  inventory: { item: string; quantity: number; unit: string; minThreshold: number }[];
  recentMaintenance: EVSTask[];
  recentCleaning: EVSTask[];
}

export interface KPIData {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  trend: number; // percentage change
  sparkline: number[];
  category: 'Speed' | 'Efficiency' | 'Quality' | 'Strategic' | 'Workforce' | 'Financial';
  description: string;
}

export type DateFilter = '12h' | '24h' | '7d' | '30d' | 'quarter' | 'year';

export interface IntegrationStatus {
  name: string;
  status: 'active' | 'warning' | 'error';
  lastSync: string;
}

export interface IntegrationPoint {
  id: string;
  name: string;
  type: string;
  value: string;
  unit: string;
  status: 'normal' | 'alarm' | 'offline';
  location: string;
}

export interface IntegrationDetail {
  name: string;
  apiEndpoint: string;
  version: string;
  authStatus: string;
  latency: string;
  activeAlarms: number;
  points: IntegrationPoint[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'urgent';
  timestamp: string;
  read: boolean;
}

export interface MaintenanceLog {
  id: string;
  date: string;
  action: string;
  technician: string;
  notes: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

export interface MaintenanceDevice {
  id: string;
  name: string;
  category: 'BioMed' | 'Engineering';
  type: string;
  facility: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installDate: string;
  warrantyExpiration: string;
  lastMaintenanceDate: string;
  lastMaintenanceAction: string;
  status: 'Operational' | 'Repair Needed' | 'Out of Service';
  history: MaintenanceLog[];
}
