export interface TeamMember {
  id: number;
  name: string;
  birthday: string;
  phoneNumbers: string[];
  plannedLeaveStartDate: string | null;
  plannedLeaveEndDate: string | null;
  role: string;
  avatar: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  location: string;
  high: number;
  low: number;
}

export interface Notification {
  id: number;
  icon: string;
  label: string;
  time: string;
  color: string;
}

export interface Reminder {
  id: number;
  text: string;
  timestamp: string;
}
