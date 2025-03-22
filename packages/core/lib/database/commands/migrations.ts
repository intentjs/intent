import { Injectable } from '@nestjs/common';
import * as pc from 'picocolors';
import { Command, ConsoleIO } from '../../console/index.js';
import { Str } from '../../utils/string.js';
import { ObjectionService } from '../service.js';

@Injectable()
export class DbOperationsCommand {
  constructor() {}

  @Command('migrate:status {--connection==}', {
    desc: 'Command to show the status of all migrations',
  })
  async migrateStatus(_cli: ConsoleIO): Promise<void | boolean> {
    const options = ObjectionService.config;

    const conn = _cli.option<string>('connection') || options.default;
    const knex = ObjectionService.connection(conn);
    const connConfig = options.connections[conn];

    const [completed, pending]: Record<string, any>[][] =
      await knex.migrate.list(connConfig.migrations);
    const statusList = [];

    for (const migration of completed) {
      statusList.push({ migration: migration.name, status: pc.green('Y') });
    }

    for (const migration of pending) {
      statusList.push({ migration: migration.file, status: pc.red('N') });
    }

    _cli.table(['Migration', 'Status'], statusList);
    return true;
  }

  @Command('migrate {--connection==}', {
    desc: 'Command to run the pending migrations',
  })
  async migrationUp(_cli: ConsoleIO): Promise<void | boolean> {
    const options = ObjectionService.config;
    const conn = _cli.option<string>('connection') || options.default;
    const knex = ObjectionService.connection(conn);
    const connConfig = options.connections[conn];

    const [batch, migrations]: [number, string[]] = await knex.migrate.latest(
      connConfig.migrations,
    );

    if (migrations.length === 0) {
      _cli.info('No migrations to run');
      return true;
    }

    _cli.info(`Batch Number: ${batch}`);
    for (const migration of migrations) {
      _cli.success(migration);
    }

    return true;
  }

  @Command('migrate:rollback {--connection==}', {
    desc: 'Command to rollback the previous batch of migrations',
  })
  async migrateRollback(_cli: ConsoleIO): Promise<void | boolean> {
    const options = ObjectionService.config;
    const conn = _cli.option<string>('connection') || options.default;
    const knex = ObjectionService.connection(conn);
    const connConfig = options.connections[conn];

    const [batch, migrations]: [number, string[]] = await knex.migrate.rollback(
      connConfig.migrations,
    );

    if (migrations.length === 0) {
      _cli.info('No migrations to rollback. Already at the base migration');
      return true;
    }

    _cli.info(`Reverted Batch: ${batch}`);
    for (const migration of migrations) {
      _cli.success(migration);
    }

    return true;
  }

  @Command('migrate:reset {--connection==}', {
    desc: 'Command to reset the migration',
  })
  async migrateReset(_cli: ConsoleIO): Promise<boolean> {
    const options = ObjectionService.config;
    const conn = _cli.option<string>('connection') || options.default;
    const knex = ObjectionService.connection(conn);
    const connConfig = options.connections[conn];

    const confirm = await _cli.confirm(
      'Are you sure you want to reset your database? This action is irreversible.',
    );

    if (!confirm) {
      _cli.info('Thank you! Exiting...');
      return true;
    }

    const password = await _cli.password(
      'Please enter the password of the database to proceed',
    );

    if (connConfig.connection && Str.isNotString(connConfig.connection)) {
      const conPassword = connConfig.connection?.['password'];
      if (conPassword && password !== conPassword) {
        _cli.error(' Wrong Password. Exiting... ');
        return true;
      }
    }

    const [, migrations]: [number, string[]] = await knex.migrate.down(
      connConfig.migrations,
    );

    if (migrations.length === 0) {
      _cli.info('No migrations to rollback. Already at the base migration');
      return true;
    }

    _cli.info('Rollback of following migrations are done:');
    for (const migration of migrations) {
      _cli.success(migration);
    }

    return true;
  }

  @Command('make:migration {name} {--connection=}', {
    desc: 'Command to create a new migration',
  })
  async makeMigration(_cli: ConsoleIO): Promise<boolean> {
    const options = ObjectionService.config;
    const name = _cli.argument<string>('name');
    const conn = _cli.option<string>('connection') || options.default;
    const knex = ObjectionService.connection(conn);
    const connConfig = options.connections[conn];

    const res = await knex.migrate.make(name, {
      directory: connConfig?.migrations?.directory,
      extension: 'js',
    });

    const paths = res.split('/');
    _cli.success(paths[paths.length - 1]);
    return true;
  }
}
