import { Injectable } from '@nestjs/common';
import { Command, ConsoleIO } from '../../console/index.js';
import { QueueWorker } from '../worker.js';

@Injectable()
export class QueueConsoleCommands {
  /**
   * Command to run the queue worker, starts processing the jobs
   * @param args C
   */
  @Command(
    `queue:work 
      {--S|sleep= : Sleep time the queue should wait before moving on to next job} 
      {--C|connection= : Connection which should be used for consumption} 
      {--Q|queue= : Name of the queue from which the messages should be pulled}
    `,
    { desc: 'Command to run the intent queue worker.' },
  )
  public async startQueueWork(_cli: ConsoleIO): Promise<void> {
    const sleep = _cli.option<number>('sleep');
    const connection = _cli.option<number>('connection');
    const queue = _cli.option<number>('queue');

    const options: { [key: string]: string | number } = {};
    if (sleep) options['sleep'] = sleep;
    if (connection) options['connection'] = connection;
    if (queue) options['queue'] = queue;

    await QueueWorker.init(options).listen();
    return;
  }

  // /**
  //  * Command to get the length of the specified queue
  //  * @param args
  //  */
  // @Command('queue:length {--sleep=} {--connection=} {--queue=}', {
  //   desc: 'Command to get the length of the specified queue',
  // })
  // public async getQueueLength(_cli: ConsoleIO): Promise<void> {
  //   const sleep = _cli.option<number>('sleep');
  //   const connection = _cli.option<number>('connection');
  //   const queue = _cli.option<number>('queue');

  //   const options: { [key: string]: string | number } = {};
  //   if (sleep) options['sleep'] = sleep;
  //   if (connection) options['connection'] = connection;
  //   if (queue) options['queue'] = queue;
  //   const response = await QueueWorker.init(options).count();
  //   _cli.info(`Number of messages in queue is ${response}`);
  //   return;
  // }

  // /**
  //  * Command to purge the queue
  //  * @param args
  //  */
  // @Command('queue:purge {--sleep=} {--connection=} {--queue=}', {
  //   desc: 'Command to purge the queue',
  // })
  // public async purgeQueue(_cli: ConsoleIO): Promise<void> {
  //   const sleep = _cli.option<number>('sleep');
  //   const connection = _cli.option<number>('connection');
  //   const queue = _cli.option<number>('queue');

  //   const options: { [key: string]: string | number } = {};
  //   if (sleep) options['sleep'] = sleep;
  //   if (connection) options['connection'] = connection;
  //   if (queue) options['queue'] = queue;

  //   const answer = await _cli.ask(
  //     `Do you really want to purge queue? Please be sure as this action is irreversible!\nWrite "yes,delete it" to purge the queue`,
  //   );

  //   if (answer === 'yes,delete it') {
  //     await QueueWorker.init(options).purge();
  //     _cli.info(' queue succesfully purged ');
  //     return;
  //   }

  //   _cli.error(' wrong key, exiting... ');
  //   return;
  // }
}
