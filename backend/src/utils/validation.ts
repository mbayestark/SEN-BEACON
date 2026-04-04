export const isValidCoordinates = (coordinates: number[]): boolean => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return false;
  }
  const [lon, lat] = coordinates;
  
  return lon! >= -180 && lon! <= 180 && lat! >= -90 && lat! <= 90;
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};
