export interface Device {
  id: string;
  name: string;
  mac: string;
  ip?: string;
  hostname?: string;
  deviceType?: string;
  status: "online" | "blocked" | "offline";
  lastSeen?: string;
}

export interface Schedule {
  id: string;
  deviceId: string;
  blockFrom: string;    // "23:00"
  blockUntil: string;   // "06:00"
  days: DayOfWeek[];
  enabled: boolean;
  createdAt: string;
}

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface FritzBoxHost {
  mac: string;
  ip: string;
  hostname: string;
  active: boolean;
  interfaceType: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
