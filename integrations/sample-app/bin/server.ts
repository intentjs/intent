import { HttpKernel } from '#http/kernel';
import { ApplicationContainer } from '#boot/container';
import { ApplicationExceptionFilter } from '#errors/filter';
import { IntentHttpServer } from '@intentjs/core';

const server = IntentHttpServer.init();

server.useContainer(ApplicationContainer);

server.useKernel(HttpKernel);

server.handleErrorsWith(ApplicationExceptionFilter);

server.start();
