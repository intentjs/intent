import { HttpKernel } from '#http/kernel';
import { ApplicationExceptionHandler } from '#errors/filter';
import { Actuator } from '@intentjs/core';

const CONTAINER_IMPORTER = async () => {
  const { ApplicationContainer } = await import('../app/boot/container.js');
  return ApplicationContainer;
};

Actuator.init(CONTAINER_IMPORTER)
  .http()
  .initKernel(HttpKernel)
  .catchErrorsWith(ApplicationExceptionHandler)
  .start();
