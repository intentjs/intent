import { join } from 'path';
import { Project } from 'ts-morph';
import { findProjectRoot } from '../utils/index.js';

export const getClassNamesFromFilePath = (filePath: string): string[] => {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(
    join(findProjectRoot(), filePath),
  );
  const classes = sourceFile.getClasses();
  return classes.map(c => c.getName());
};
