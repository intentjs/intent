import { EmitsEvent, Event } from '../../events/index.js';
import { events } from '../constants.js';

@Event(events.jobProcessing)
export class JobProcessing extends EmitsEvent {
  constructor(
    public message: any,
    public job: any,
  ) {
    super();
  }
}
