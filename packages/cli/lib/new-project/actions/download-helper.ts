import { execSync } from "child_process";
import { simpleGit } from "simple-git";
import pc from "picocolors";
import { NEW_PROJECT_CONFIG } from "../config.js";

export const downloadRepository = async (
  starterTemplateName: string,
  dirName: string
) => {
  const isGitInstalled = checkIfGitIsInstalled();

  if (isGitInstalled) {
    try {
      const git = simpleGit();
      await git.clone(
        `https://github.com/${starterTemplateName}.git`,
        dirName,
        ["--branch", NEW_PROJECT_CONFIG.branch]
      );
      return 1;
    } catch (e) {
      console.log(`[ ${pc.bold(pc.red("error"))} ] ${pc.red(e.message)}`);
      return 0;
    }
  }

  return;
};

export const checkIfGitIsInstalled = (): boolean => {
  try {
    execSync("git --version", { stdio: "ignore" });
    return true;
  } catch (e) {
    return false;
  }
};
