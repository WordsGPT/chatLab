import { HttpContextToken } from '@angular/common/http';

// This file defines HTTP context tokens used for various purposes in HTTP requests
export const ORIGIN = new HttpContextToken<string>(() => 'Unknown');
export const REFRESH_AUTH = new HttpContextToken<boolean>(() => false);
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);