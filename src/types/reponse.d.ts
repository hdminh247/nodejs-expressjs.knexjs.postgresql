// Custom response type
declare interface CustomResponse {
  error: boolean;
  data: any;
  errors: ErrorObject[];
}

// Error type
declare interface ErrorObject {
  code: string;
  message: string;
}
