import { Injectable } from '@angular/core';

// This service is responsible for managing logging in the application
@Injectable({ 
  providedIn: 'root' 
})
export class MessageService {

  // Array to hold messages
  messages: string[] = [];

  /**
   * Adds a message to the messages array
   * 
   * @param message - The message to be added
   */
  add(message: string): void {
    this.messages.push(message);
  }

  /**
   * Clear the messages array
   */
  clear(): void {
    this.messages = [];
  }
}