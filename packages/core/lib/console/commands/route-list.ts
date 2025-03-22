import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { Command } from '../decorators.js';
import { columnify } from '../../utils/columnify.js';
import { RouteExplorer } from '../../rest/index.js';

@Command('routes:list')
export class ListRouteCommand {
  constructor(private moduleRef: ModuleRef) {}

  async handle() {
    const ds = this.moduleRef.get(DiscoveryService, { strict: false });
    const ms = this.moduleRef.get(MetadataScanner, { strict: false });
    const routeExplorer = new RouteExplorer(ds, ms, this.moduleRef);
    const routes = routeExplorer.explorePlainRoutes(ds, ms);

    const formattedRows = columnify(routes, { padStart: 2 });

    return 1;
  }
}
