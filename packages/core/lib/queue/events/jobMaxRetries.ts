import { EmitsEvent, Event } from '../../events/index.js';
import { events } from '../constants.js';

@Event(events.jobMaxRetriesExceeed)
export class JobMaxRetriesExceeed extends EmitsEvent {
  constructor(
    public message: any,
    public job: any,
  ) {
    super();
  }
}
