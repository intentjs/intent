import { EmitsEvent, Event } from '../../events/index.js';
import { events } from '../constants.js';

@Event(events.jobProcessed)
export class JobProcessed extends EmitsEvent {
  constructor(
    public message: any,
    public job: any,
  ) {
    super();
  }
}
