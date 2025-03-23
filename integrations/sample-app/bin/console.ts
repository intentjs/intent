import { Actuator } from '@intentjs/core';

const CONTAINER_IMPORTER = async () => {
  const { ApplicationContainer } = await import('../app/boot/container.js');
  return ApplicationContainer;
};

Actuator.init(CONTAINER_IMPORTER)
  .cli()
  .handle(process.argv.slice(2))
  .catch((err) => {
    console.error(`Intent Process Error:`, err);
    // process.exit(1);
  });
