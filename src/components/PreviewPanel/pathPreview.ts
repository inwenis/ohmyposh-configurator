// Formats the mock preview path according to the path segment's style options.
// Mirrors (approximately) how Oh My Posh renders the path segment styles:
// https://ohmyposh.dev/docs/segments/system/path

const MOCK_PATH_FOLDERS = ['~', 'dev', 'my-app'];
const DEFAULT_FOLDER_SEPARATOR = '/';
const DEFAULT_HOME_ICON = '~';
const DEFAULT_FOLDER_ICON = '..';
const DEFAULT_MIXED_THRESHOLD = 4;

export function formatPathPreview(options?: Record<string, unknown>): string {
  const style = typeof options?.style === 'string' ? options.style : undefined;
  const separator = typeof options?.folder_separator_icon === 'string'
    ? options.folder_separator_icon
    : DEFAULT_FOLDER_SEPARATOR;
  const homeIcon = typeof options?.home_icon === 'string' ? options.home_icon : DEFAULT_HOME_ICON;
  const folderIcon = typeof options?.folder_icon === 'string' ? options.folder_icon : DEFAULT_FOLDER_ICON;

  const folders = MOCK_PATH_FOLDERS.map((name, index) => (index === 0 ? homeIcon : name));
  const root = folders[0];
  const middle = folders.slice(1, -1);
  const last = folders[folders.length - 1];

  switch (style) {
    case 'folder':
      return last;
    case 'agnoster':
      return [root, ...middle.map(() => folderIcon), last].join(separator);
    case 'agnoster_short': {
      const hideRoot = options?.hide_root_location === true;
      return (hideRoot ? [folderIcon, last] : [root, folderIcon, last]).join(separator);
    }
    case 'agnoster_left':
      return [root, ...middle, folderIcon].join(separator);
    case 'letter':
    case 'unique':
    case 'fish':
      return [root, ...middle.map((name) => name.charAt(0)), last].join(separator);
    case 'mixed': {
      const threshold = typeof options?.mixed_threshold === 'number'
        ? options.mixed_threshold
        : DEFAULT_MIXED_THRESHOLD;
      return [root, ...middle.map((name) => (name.length > threshold ? folderIcon : name)), last].join(separator);
    }
    // full, agnoster_full, powerlevel, and unset/unknown styles show the full path
    default:
      return folders.join(separator);
  }
}
