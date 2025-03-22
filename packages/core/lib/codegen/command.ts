import { join } from 'path';
import { Command, CommandRunner, ConsoleIO } from '../console/index.js';
import { Str } from '../utils/string.js';
import { CodegenService } from './service.js';
import { getClassNamesFromFilePath } from './utils.js';
import { Injectable } from '../foundation/decorators.js';

@Injectable()
export class CodegenCommand {
  constructor(private service: CodegenService) {}

  @Command('make:config {namespace}', { desc: 'Command to make config' })
  async makeConfig(_cli: ConsoleIO): Promise<void> {
    const namespace = _cli.argument<string>('namespace');
    // convert the namespace to camelcase for file name.
    const fileNameWithoutEx = Str.camel(namespace);
    const fileNameWithEx = `${fileNameWithoutEx}.ts`;
    const filePath = `config/${fileNameWithEx}`;
    const options = {
      input: { namespace },
      filePath,
      fileNameWithoutEx,
      fileNameWithEx,
    };

    try {
      await this.service.createConfigFile(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:controller {name}', { desc: 'Command to create a controller' })
  async makeController(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating controller');
    const name = _cli.argument<string>('name');
    const routeName = name;
    const controllerName = Str.pascal(`${name}_controller`);
    const fileNameWithoutEx = Str.camel(`${name}_controller`);
    const filePath = `app/http/controllers/${fileNameWithoutEx}.ts`;
    const options = {
      input: { routeName, controllerName },
      filePath,
      fileNameWithoutEx,
    };
    try {
      await this.service.createController(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:service {name}', { desc: 'Command to create a service' })
  async makeService(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating service class');
    const name = _cli.argument<string>('name');
    const className = Str.pascal(`${name}_service`);
    const fileNameWithoutEx = Str.camel(`${name}_service`);
    const filePath = `app/services/${fileNameWithoutEx}.ts`;
    const options = { input: { className }, filePath, fileNameWithoutEx };
    try {
      await this.service.createService(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:job {name}', { desc: 'Command to create a job' })
  async makeJob(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating job class');
    const jobName = _cli.argument<string>('name');
    const jobClassName = Str.pascal(`${jobName}_job`);
    const fileNameWithoutEx = Str.camel(`${jobName}_job`);
    const filePath = `app/jobs/${fileNameWithoutEx}.ts`;
    const options = {
      input: { jobName, jobClassName },
      filePath,
      fileNameWithoutEx,
      template: 'job',
    };
    try {
      await this.service.createJob(options);
      _cli.success(`Successfully created job at ${filePath}`);
    } catch (e) {
      console.log(e);
      _cli.error(e['message']);
    }
    process.exit();
  }

  @Command('make:model {name}', { desc: 'Command to create a model' })
  async makeModel(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating model class');
    const name = _cli.argument<string>('name');
    const className = Str.pascal(`${name}_model`);
    const fileNameWithoutEx = Str.camel(`${name}_model`);
    const filePath = `app/models/${fileNameWithoutEx}.ts`;
    const options = {
      input: { className, tableName: Str.pluralize(name) },
      filePath,
      fileNameWithoutEx,
    };
    try {
      await this.service.createModel(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }
    process.exit();
  }

  @Command('make:repo {repoName} {modelFileName} {--without-interface}', {
    desc: 'Command to create a repo',
  })
  async makeRepository(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating db repository class');
    const repoName = _cli.argument<string>('repoName');
    const repoClassName = Str.pascal(`${repoName}_Db_Repository`);
    const fileNameWithoutEx = Str.camel(`${repoName}_Db_Repository`);
    const filePath = `app/repositories/${fileNameWithoutEx}.ts`;
    const repoToken = Str.upper(`${repoName}_DB_REPO`);
    const modelFileName = _cli.argument<string>('modelFileName');
    const relativeModelFilePath = `../models/${modelFileName}`;
    const modelName = getClassNamesFromFilePath(
      join('app', `models/${modelFileName}.ts`),
    )[0];

    const options = {
      input: {
        className: repoClassName,
        modelFilePath: relativeModelFilePath,
        modelName,
      },
      repoToken,
      filePath,
      fileNameWithoutEx,
    };

    try {
      await this.service.createRepo(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:exception {name}', {
    desc: 'Command to create an http exception class',
  })
  async makeException(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating an exception class');
    const name = _cli.argument<string>('name');
    const className = Str.pascal(`${name}_exception`);
    const fileNameWithoutEx = Str.camel(`${name}_exception`);
    const filePath = `app/exceptions/${fileNameWithoutEx}.ts`;
    const options = { input: { className }, filePath, fileNameWithoutEx };
    try {
      await this.service.createException(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:resource {name}', { desc: 'Command to create a service' })
  async makeResource(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating resource file');
    const name = _cli.argument<string>('name');

    try {
      await CommandRunner.run(`make:model ${name}`);
      const modelName = Str.camel(`${name}_model`);
      await CommandRunner.run(`make:repo ${name} ${modelName}`);
      await CommandRunner.run(`make:controller ${name}`);
      await CommandRunner.run(`make:service ${name}`, { silent: true });
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:event {name}', {
    desc: 'Command to create an event class',
  })
  async makeEvent(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating an event class');
    const name = _cli.argument<string>('name');
    const className = Str.pascal(`${name}_event`);
    const fileNameWithoutEx = Str.camel(`${name}_event`);
    const filePath = `app/events/${fileNameWithoutEx}.ts`;
    const options = {
      input: { className, eventName: name },
      filePath,
      fileNameWithoutEx,
    };
    try {
      await this.service.createEvent(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command(
    'make:listener {name: Name of the listener} {--E|event= : Name of the event to which the listener will listen to}',
    { desc: 'Command to create an event listener class' },
  )
  async makeListener(_cli: ConsoleIO): Promise<void> {
    _cli.info('Creating a listener class');
    const name = _cli.argument<string>('name');
    console.log('name', name, _cli.values);
    const eventName = _cli.option<string>('event_name');
    const className = Str.pascal(`${name}_listener`);
    const fileNameWithoutEx = Str.camel(`${name}_listener`);
    const filePath = `app/events/listeners/${fileNameWithoutEx}.ts`;
    const options = {
      input: { className, eventName: eventName ?? name },
      filePath,
      fileNameWithoutEx,
    };
    try {
      await this.service.createListener(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command(
    'make:command {name : Name of the command by which it will be invoked}',
    { desc: 'Command to create a console command class' },
  )
  async makeCommand(_cli: ConsoleIO): Promise<void> {
    const name = _cli.argument<string>('name');
    const validClassToken = Str.replace(name, ':', '');
    const className = Str.pascal(`${validClassToken}_command`);
    const fileNameWithoutEx = Str.camel(`${validClassToken}_command`);
    const filePath = `app/console/${fileNameWithoutEx}.ts`;
    const options = {
      input: { className, commandName: name },
      filePath,
      fileNameWithoutEx,
    };
    try {
      await this.service.createCommand(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }

  @Command('make:mail {name}', {
    desc: 'Command to create a mail class',
  })
  async makeMail(_cli: ConsoleIO): Promise<void> {
    const name = _cli.argument<string>('name');
    const className = Str.pascal(`${name}_mail`);
    const fileNameWithoutEx = Str.camel(`${name}_mail`);
    const filePath = `app/mails/${fileNameWithoutEx}.ts`;
    const options = {
      input: { className, eventName: name },
      filePath,
      fileNameWithoutEx,
    };
    try {
      await this.service.createMail(options);
      _cli.success(`Successfully created ${filePath}`);
    } catch (e) {
      _cli.error(e['message']);
    }

    process.exit();
  }
}
