export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

export const findNearestLocations = (
  sourceLat: number,
  sourceLon: number,
  locations: Array<{ location: { coordinates: [number, number] }; [key: string]: any }>,
  maxDistance?: number
): Array<any> => {
  const withDistances = locations.map(loc => ({
    ...loc,
    distance: calculateDistance(
      sourceLat,
      sourceLon,
      loc.location.coordinates[1],
      loc.location.coordinates[0]
    )
  }));

  let filtered = withDistances;
  if (maxDistance) {
    filtered = withDistances.filter(loc => loc.distance <= maxDistance);
  }

  return filtered.sort((a, b) => a.distance - b.distance);
};
