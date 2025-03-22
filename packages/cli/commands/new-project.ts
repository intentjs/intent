import { join } from "path";
import { INTENT_LOG_PREFIX } from "../lib/utils/log-helpers.js";
import pc from "picocolors";
import { copyFile, existsSync, remove } from "fs-extra";
import * as p from "@clack/prompts";
import { NEW_PROJECT_OPTIONS } from "../lib/configuration/new-project-config.js";
import {
  NEW_PROJECT_CONFIG,
  SAFE_DELETE_FILES,
} from "../lib/new-project/config.js";
import { InjectConfigCodegen } from "../lib/codegen/inject-config.js";
import { cwd } from "process";
import { downloadRepository } from "../lib/new-project/actions/download-helper.js";
import { downloadDependenciesUsingNpm } from "../lib/new-project/actions/download-depedencies.js";

export class NewProjectCommand {
  constructor() {}

  async handle(name: string, options: Record<string, any>) {
    /**
     * Check if provided name is available for creating a directory
     */
    this.checkIfDirNameIsValidAndAvailable(name);

    /**
     * Build Prompt Options
     */
    const promptOptions = this.buildPromptOptions(options);

    p.intro("Setting up a new intent project");
    const missingOptions = await p.group(
      { ...promptOptions },
      {
        onCancel: ({ results }) => {
          p.log.error("User cancelled prompt! Exiting now...");
          process.exit(0);
        },
      }
    );

    const config = NEW_PROJECT_CONFIG;
    const starterTemplateName = `${config.gitOrg}/${config.repoName}`;

    const newProjectDirectory = join(cwd(), name);

    const finalOptions = { ...options, ...missingOptions };
    const injectConfigTask = new InjectConfigCodegen(newProjectDirectory);
    await p.tasks([
      {
        title: "Downloading the starter template",
        task: async (message) => {
          const success = await downloadRepository(starterTemplateName, name);
          !success && process.exit(0);
          return "Starter template cloned! 🎉";
        },
      },
      {
        title: "Cleaning up files",
        task: async (message) => {
          const deleteFilesPromise = [];
          for (const dirOrFileName of SAFE_DELETE_FILES) {
            deleteFilesPromise.push(remove(join(name, dirOrFileName)));
          }

          await Promise.allSettled(deleteFilesPromise);
          return "Files cleaned up 🗑️";
        },
      },
      {
        title: "Creating .env file",
        task: async (message) => {
          await copyFile(
            join(newProjectDirectory, ".env.example"),
            join(newProjectDirectory, ".env")
          );
          return "Created .env file";
        },
      },
      {
        title: "Installing dependencies via npm",
        task: async (message) => {
          await downloadDependenciesUsingNpm(name);
          return "Dependencies installed 🧰";
        },
      },
      {
        title: "Setting up the selected configuration",
        task: async (message) => {
          const { database, cache, storage, mailer, queue } = finalOptions;
          /**
           * Setup queue configuration
           */
          const getProjectSettingConfNamespace = (path: string) =>
            `new-project-settings/config/${path}.json`;

          const url = `https://raw.githubusercontent.com/intentjs/registry/refs/heads/main/`;

          message(`Injecting config for ${pc.yellow(queue)} queue`);
          await injectConfigTask.handle(
            url + getProjectSettingConfNamespace(`queue/${queue}`)
          );

          message(`Injecting config for ${pc.yellow(database)} db`);
          await injectConfigTask.handle(
            url + getProjectSettingConfNamespace(`db/${database}`)
          );

          message(`Injecting config for ${pc.yellow(storage)} filesystem`);
          await injectConfigTask.handle(
            url + getProjectSettingConfNamespace(`storage/${storage}`)
          );

          message(`Injecting config for ${pc.yellow(mailer)} mailer`);
          await injectConfigTask.handle(
            url + getProjectSettingConfNamespace(`mailer/${mailer}`)
          );

          message(`Injecting config for ${pc.yellow(cache)} cache`);
          await injectConfigTask.handle(
            url + getProjectSettingConfNamespace(`cache/${cache}`)
          );

          return `Configuration set!`;
        },
      },
    ]);

    p.outro("Project setup complete! 🎉");

    console.log("Building amazing products using Intent!");

    console.log();
    console.log(`${pc.gray("$")} ${pc.green(`cd ${name}`)}`);
    console.log(`${pc.gray("$")} ${pc.cyan("node intent dev")}`);
  }

  buildPromptOptions(options: Record<string, any>) {
    const missingPromptOptions = [] as Record<string, any>;
    if (!("database" in options)) {
      const promptConfig = NEW_PROJECT_OPTIONS["database"];
      missingPromptOptions["database"] = () =>
        p.select({
          message: promptConfig.question,
          options: promptConfig.selectOptions,
        });
    }

    if (!("cache" in options)) {
      const promptConfig = NEW_PROJECT_OPTIONS["cache"];
      missingPromptOptions["cache"] = () =>
        p.select({
          message: promptConfig.question,
          options: promptConfig.selectOptions,
        });
    }

    if (!("storage" in options)) {
      const promptConfig = NEW_PROJECT_OPTIONS["storage"];
      missingPromptOptions["storage"] = () =>
        p.select({
          message: promptConfig.question,
          options: promptConfig.selectOptions,
        });
    }

    if (!("mailer" in options)) {
      const promptConfig = NEW_PROJECT_OPTIONS["mailer"];
      missingPromptOptions["mailer"] = () =>
        p.select({
          message: promptConfig.question,
          options: promptConfig.selectOptions,
        });
    }

    if (!("queue" in options)) {
      const promptConfig = NEW_PROJECT_OPTIONS["queue"];
      missingPromptOptions["queue"] = () =>
        p.select({
          message: promptConfig.question,
          options: promptConfig.selectOptions,
        });
    }

    return missingPromptOptions;
  }

  checkIfDirNameIsValidAndAvailable(name: string) {
    // Check if directory name is valid
    const isWindows = process.platform === "win32";
    const invalidCharsRegex = isWindows
      ? /[<>:"/\\|?*\x00-\x1F]/g // Windows invalid chars
      : /[/\x00]/g; // Unix/Linux invalid chars

    if (!name || name.trim().length === 0) {
      console.log(INTENT_LOG_PREFIX, pc.red("Directory name cannot be empty"));
      process.exit(1);
    }

    if (name === "." || name === "..") {
      console.log(INTENT_LOG_PREFIX, pc.red("Invalid directory name"));
      process.exit(1);
    }

    if (invalidCharsRegex.test(name)) {
      console.log(
        INTENT_LOG_PREFIX,
        pc.red(
          `Directory name contains invalid characters${
            isWindows ? ' (< > : " \\ / | ? * are not allowed)' : ""
          }`
        )
      );
      process.exit(1);
    }

    // Check if name is available
    const dirPath = join(process.cwd(), name);
    if (existsSync(dirPath)) {
      console.log(
        INTENT_LOG_PREFIX,
        pc.red(`Directory "${name}" already exists`)
      );
      process.exit(1);
    }
  }
}
