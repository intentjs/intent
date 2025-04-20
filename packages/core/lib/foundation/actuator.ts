import { IntentHttpServer } from '../rest/foundation/server.js';
import { IntentConsoleProcess } from './intent-process.js';

type ContainerImporterType = () => any;

export class Actuator {
  private container: any;
  constructor(private readonly containerImporter: () => Promise<any>) {}

  static init(containerImporter: ContainerImporterType): Actuator {
    return new Actuator(containerImporter);
  }

  async importContainer(): Promise<any> {
    if (!this.container) {
      this.container = await this.containerImporter();
    }
    return this.container;
  }

  /**
   * Get the intent process
   * @returns Get the intent process
   */
  cli(): IntentConsoleProcess {
    return new IntentConsoleProcess(this);
  }

  http(): IntentHttpServer {
    return new IntentHttpServer(this);
  }
}
