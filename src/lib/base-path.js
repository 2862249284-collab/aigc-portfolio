// Build replaces this value for GitHub Pages project deployments.
export const basePath = '';
export function stripBase(path){return basePath&&(path===basePath||path.startsWith(basePath+'/'))?path.slice(basePath.length)||'/':path;}
