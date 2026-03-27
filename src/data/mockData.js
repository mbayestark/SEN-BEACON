export const mockTemperatureData = [
  { time: "00:00", temperature: 28, pressure: 1012 },
  { time: "02:00", temperature: 27, pressure: 1013 },
  { time: "04:00", temperature: 26, pressure: 1013 },
  { time: "06:00", temperature: 27, pressure: 1012 },
  { time: "08:00", temperature: 30, pressure: 1011 },
  { time: "10:00", temperature: 33, pressure: 1010 },
  { time: "12:00", temperature: 36, pressure: 1009 },
  { time: "14:00", temperature: 38, pressure: 1008 },
  { time: "16:00", temperature: 37, pressure: 1009 },
  { time: "18:00", temperature: 34, pressure: 1010 },
  { time: "20:00", temperature: 31, pressure: 1011 },
  { time: "22:00", temperature: 29, pressure: 1012 },
];

export const mockMosquitoActivity = [
  { hour: "00:00", count: 45 },
  { hour: "02:00", count: 78 },
  { hour: "04:00", count: 120 },
  { hour: "06:00", count: 89 },
  { hour: "08:00", count: 34 },
  { hour: "10:00", count: 12 },
  { hour: "12:00", count: 8 },
  { hour: "14:00", count: 5 },
  { hour: "16:00", count: 15 },
  { hour: "18:00", count: 67 },
  { hour: "20:00", count: 134 },
  { hour: "22:00", count: 98 },
];

export const mockSpeciesData = [
  { id: "Aedes aegypti", label: "Aedes aegypti", value: 45, color: "hsl(104, 70%, 50%)" },
  { id: "Anopheles", label: "Anopheles", value: 25, color: "hsl(162, 70%, 50%)" },
  { id: "Culex", label: "Culex", value: 30, color: "hsl(291, 70%, 50%)" },
];

export const mockTrapStats = {
  temperature: 34,
  pressure: 1010,
  mosquitoCount: 1243,
  status: "Online",
  battery: 87,
  location: "Thiès, Senegal",
};