// Interface for HTTP error handling in the application
export interface HttpError {
    message: string;
    action?: (service: any) => void;
}
