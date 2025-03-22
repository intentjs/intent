import { GenericFunction } from '../interfaces/index.js';

export class EventMetadata {
  private static store: Record<string, any> = { events: {}, listeners: {} };

  static addListener(event: string, target: () => void): void {
    const listeners = EventMetadata.store.listeners[event] || [];
    listeners.push(target);
    EventMetadata.store.listeners[event] = listeners;
  }

  static getListeners(event: string): Array<GenericFunction> {
    const listeners = EventMetadata.store.listeners[event];
    return listeners || [];
  }
}
