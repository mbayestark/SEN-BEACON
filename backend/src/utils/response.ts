export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    ...(message !== undefined && { message }),
    data
  };
};

export const errorResponse = (message: string, error?: string): ApiResponse => {
  return {
    success: false,
    message,
    ...(error !== undefined && { error })
  };
};
