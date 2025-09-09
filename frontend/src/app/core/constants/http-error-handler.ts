import { HttpError } from '@core/interfaces/http-error.interface';
import { LoginService } from '@core/services/login.service';

// This file defines a set of HTTP error handlers for different status codes
export const ERROR_HANDLERS: { [key: number]: HttpError } = {
  0: { message: "Network error. Please check your internet connection." },
  400: { message: "Bad request. Please check the submitted data." },
  401: {
    message: "Unauthorized. Please log in.",
    action: (loginService: LoginService) => loginService.logout(),
  },
  403: { message: "Access denied. You do not have permission." },
  404: { message: "Not found. The requested resource does not exist." },
  409: { message: "Conflict. A similar resource already exists." },
  422: { message: "Unprocessable entity. Please verify the form fields." },
  500: { message: "Internal server error. Please try again later." },
  502: { message: "Bad gateway. The upstream server returned an invalid response." },
  503: { message: "Service unavailable. The server is currently down." },
  504: { message: "Gateway timeout. The server took too long to respond." }
};

// Default error handler for unexpected errors
export const DEFAULT_ERROR_HANDLER: HttpError = {
  message: "An unexpected error occurred. Please try again.",
};