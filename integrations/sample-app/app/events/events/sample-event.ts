import { EmitsEvent, Event } from '@intentjs/core/events';

@Event('order_placed')
export class OrderPlacedEvent extends EmitsEvent {
  constructor(public order: Record<string, any>) {
    super();
  }
}
