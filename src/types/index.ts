export type DockStatus = "available" | "busy" | "maintenance";
export type GateStatus = "available" | "busy" | "maintenance";
export type OperationType = "load" | "unload";
export type AppointmentStatus = "confirmed" | "cancelled" | "rescheduled" | "completed" | "no_show";
export type QueueType = "gate" | "dock";

export interface Gate {
  id: number;
  facility_id: number;
  name: string;
  avg_checkin_minutes: number;
  status: GateStatus;
}

export interface Dock {
  id: number;
  facility_id: number;
  name: string;
  avg_process_minutes: number;
  status: DockStatus;
}

export interface Appointment {
  id: number;
  facility_id: number;
  dock_id: number;
  dock_name: string;
  truck_id: number;
  plate_number: string;
  driver_name: string;
  operation_type: OperationType;
  is_perishable: 0 | 1;
  scheduled_start: string;
  scheduled_end: string;
  status: AppointmentStatus;
  reschedule_reason?: string | null;
}

export interface CreateAppointmentInput {
  facilityId: number;
  dockId: number;
  plateNumber: string;
  driverName: string;
  operationType: OperationType;
  isPerishable: boolean;
  scheduledStart: string;
  scheduledEnd: string;
}

export interface QueueEntry {
  id: number;
  queue_type: QueueType;
  queue_position: number;
  wait_reason: string;
  arrival_time: string;
  expected_dock_id: number | null;
  gate_id: number | null;
  operation_type: OperationType;
  is_perishable: 0 | 1;
  plate_number: string;
  driver_name: string;
  expected_dock_name: string | null;
  gate_name: string | null;
}

export interface DashboardStats {
  trucksToday: number;
  onTimeRate: number | null;
  avgWaitMinutes: number | null;
  dockUtilization: number;
}

export interface QueueInfo {
  queue_type: QueueType;
  queue_position: number;
  resource_name: string;
}

export interface CheckinScanResult {
  checkin_id: number;
  qr_code: string;
  gate_id: number | null;
  arrival_time: string | null;
  entry_time: string | null;
  process_start_time: string | null;
  process_end_time: string | null;
  departure_time: string | null;
  appointment_id: number;
  scheduled_start: string;
  appointment_status: AppointmentStatus;
  operation_type: OperationType;
  is_perishable: 0 | 1;
  dock_id: number;
  facility_id: number;
  dock_name: string;
  dock_status: DockStatus;
  gate_name: string | null;
  plate_number: string;
  driver_name: string;
  queueInfo: QueueInfo | null;
}

export type RescheduleReason = "weather" | "power_outage" | "dock_maintenance" | "other";

export interface RescheduleInput {
  id: number;
  scheduledStart: string;
  scheduledEnd: string;
  dockId?: number;
  reasonCategory: RescheduleReason;
  notes?: string;
}
