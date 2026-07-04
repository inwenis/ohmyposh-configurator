// Formats the mock preview path according to the path segment's style options.
// Mirrors how Oh My Posh renders the path segment styles:
// https://ohmyposh.dev/docs/segments/system/path

const MOCK_PATH_FOLDERS = ['~', 'projects', 'src', 'my-app'];
const DEFAULT_FOLDER_SEPARATOR = '/';
const DEFAULT_HOME_ICON = '~';
const DEFAULT_FOLDER_ICON = '..';
const DEFAULT_MIXED_THRESHOLD = 4;
const DEFAULT_MAX_DEPTH = 1;
const DEFAULT_DIR_LENGTH = 1;
const DEFAULT_FULL_LENGTH_DIRS = 1;

function stringOption(options: Record<string, unknown> | undefined, key: string, fallback: string): string {
  const value = options?.[key];
  return typeof value === 'string' ? value : fallback;
}

function numberOption(options: Record<string, unknown> | undefined, key: string, fallback: number): number {
  const value = options?.[key];
  return typeof value === 'number' && value > 0 ? value : fallback;
}

export function formatPathPreview(options?: Record<string, unknown>): string {
  const style = typeof options?.style === 'string' ? options.style : undefined;
  const separator = stringOption(options, 'folder_separator_icon', DEFAULT_FOLDER_SEPARATOR);
  const homeIcon = stringOption(options, 'home_icon', DEFAULT_HOME_ICON);
  const folderIcon = stringOption(options, 'folder_icon', DEFAULT_FOLDER_ICON);

  const folders = MOCK_PATH_FOLDERS.map((name, index) => (index === 0 ? homeIcon : name));
  const root = folders[0];
  const middle = folders.slice(1, -1);
  const last = folders[folders.length - 1];
  const fullPath = folders.join(separator);

  // Every folder except the root and the last shortened to its first letter
  const letterPath = [root, ...middle.map((name) => name.charAt(0)), last].join(separator);

  switch (style) {
    // Only the name of the current folder
    case 'folder':
      return last;
    // First and last folder as-is, every intermediate folder as the folder icon
    case 'agnoster':
      return [root, ...middle.map(() => folderIcon), last].join(separator);
    // Root (unless hidden), one folder icon, then the last max_depth folders
    case 'agnoster_short': {
      const maxDepth = numberOption(options, 'max_depth', DEFAULT_MAX_DEPTH);
      const tail = folders.slice(1);
      if (maxDepth >= tail.length) {
        return fullPath;
      }
      const shown = tail.slice(-maxDepth);
      const hideRoot = options?.hide_root_location === true;
      return (hideRoot ? [folderIcon, ...shown] : [root, folderIcon, ...shown]).join(separator);
    }
    // First folder and its child as-is, every following folder as the folder icon
    case 'agnoster_left': {
      const rest = folders.slice(2);
      return [root, ...folders.slice(1, 2), ...rest.map(() => folderIcon)].join(separator);
    }
    // letter: first letter of every folder except the last
    // unique: shortest unique prefix — equals letter for the mock path (no sibling folders to disambiguate)
    case 'letter':
    case 'unique':
      return letterPath;
    // dir_length chars per folder, the last full_length_dirs folders in full
    case 'fish': {
      const dirLength = numberOption(options, 'dir_length', DEFAULT_DIR_LENGTH);
      const fullLengthDirs = numberOption(options, 'full_length_dirs', DEFAULT_FULL_LENGTH_DIRS);
      const shortened = folders.map((name, index) => {
        if (index === 0 || index >= folders.length - fullLengthDirs) {
          return name;
        }
        return name.substring(0, dirLength);
      });
      return shortened.join(separator);
    }
    // Intermediate folders longer than mixed_threshold become the folder icon
    case 'mixed': {
      const threshold = numberOption(options, 'mixed_threshold', DEFAULT_MIXED_THRESHOLD);
      return [root, ...middle.map((name) => (name.length > threshold ? folderIcon : name)), last].join(separator);
    }
    // Full path, shortened letter-style when it exceeds max_width
    case 'powerlevel': {
      const maxWidth = numberOption(options, 'max_width', 0);
      if (maxWidth > 0 && fullPath.length > maxWidth) {
        return letterPath;
      }
      return fullPath;
    }
    // full, agnoster_full, and unset/unknown styles show the full path
    default:
      return fullPath;
  }
}
