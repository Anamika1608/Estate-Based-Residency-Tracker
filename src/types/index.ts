export interface LocationData {
  id?: number;
  lat: number;
  lon: number;
  time: string;
  estate: string;
  dayKey?: string; // Format: YYYY-MM-DD
}

export interface EstateStats {
  estate: string;
  daysSpent: number;
}

export type RootStackParamList = {
  Tracker: undefined;
  Charts: undefined;
};