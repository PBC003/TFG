export interface ApiErrorDetails {
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: ApiErrorDetails;
  path?: string;
  timestamp?: string;
}
