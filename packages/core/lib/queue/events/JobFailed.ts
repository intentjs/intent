import { EmitsEvent, Event } from '../../events/index.js';
import { events } from '../constants.js';

@Event(events.jobFailed)
export class JobFailed extends EmitsEvent {
  constructor(
    public message: any,
    public job: any,
  ) {
    super();
  }
}
