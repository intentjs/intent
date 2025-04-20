import config from '#config/index';
import { IntentAppContainer, IntentProvidersFactory } from '@intentjs/core';
import { AppServiceProvider } from '#boot/sp/app';
import { ConsoleServiceProvider } from '#boot/sp/console';
export class ApplicationContainer extends IntentAppContainer {
  build() {
    /**
     * !! DO NOT REMOVE THIS !!
     *
     * Registers the core Intent Service Providers.
     */
    this.add(IntentProvidersFactory(config));

    /**
     * Register our main application service providers.
     */
    this.add(AppServiceProvider);
    this.add(ConsoleServiceProvider);
  }
}
