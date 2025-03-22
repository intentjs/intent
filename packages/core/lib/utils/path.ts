import fsExtra from 'fs-extra';
import path from 'path';

const { existsSync } = fsExtra;
export const findProjectRoot = (startPath = process.cwd()) => {
  // Markers that indicate project root
  const rootMarkers = ['.intentrc', 'package.json'];

  let currentPath = startPath;
  let lastNodeModulesIndex = -1;

  // Keep going up until we reach the root of the filesystem
  while (currentPath !== path.parse(currentPath).root) {
    // Check if we're in a node_modules directory
    if (currentPath.includes('node_modules')) {
      lastNodeModulesIndex = currentPath.lastIndexOf('node_modules');
      // Jump above the node_modules directory
      currentPath = currentPath.slice(0, lastNodeModulesIndex);
      continue;
    }

    // Check for any of the root markers
    const hasRootMarker = rootMarkers.some(marker => {
      try {
        return existsSync(path.join(currentPath, marker));
      } catch (error) {
        return false;
      }
    });

    if (hasRootMarker) {
      // Verify this isn't a package.json inside node_modules
      if (currentPath.includes('node_modules')) {
        currentPath = path.dirname(currentPath);
        continue;
      }
      return currentPath;
    }

    // Move up one directory
    currentPath = path.dirname(currentPath);
  }

  // If no root markers are found, return the starting directory
  return startPath;
};

// Helper function to check if a path is within node_modules
function isInNodeModules(path) {
  return path.includes('node_modules');
}
