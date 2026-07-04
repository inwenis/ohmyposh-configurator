import { describe, it, expect } from 'vitest';
import { formatPathPreview } from '../pathPreview';
import { getPreviewText } from '../templateUtils';
import type { Segment } from '../../../types/ohmyposh';

// Mock path is ~/projects/src/my-app (root ~, intermediates projects + src, current my-app)
describe('formatPathPreview', () => {
  it('returns the full mock path when no options are set', () => {
    expect(formatPathPreview()).toBe('~/projects/src/my-app');
    expect(formatPathPreview({})).toBe('~/projects/src/my-app');
  });

  it('shows only the current folder for folder style', () => {
    expect(formatPathPreview({ style: 'folder' })).toBe('my-app');
  });

  it('shows the full path for full style', () => {
    expect(formatPathPreview({ style: 'full' })).toBe('~/projects/src/my-app');
  });

  it('shows all folders for agnoster_full style', () => {
    expect(formatPathPreview({ style: 'agnoster_full' })).toBe('~/projects/src/my-app');
  });

  it('replaces intermediate folders with the folder icon for agnoster style', () => {
    expect(formatPathPreview({ style: 'agnoster' })).toBe('~/../../my-app');
  });

  it('shows root, one folder icon, and the last max_depth folders for agnoster_short', () => {
    expect(formatPathPreview({ style: 'agnoster_short' })).toBe('~/../my-app');
    expect(formatPathPreview({ style: 'agnoster_short', max_depth: 2 })).toBe('~/../src/my-app');
  });

  it('hides the root location for agnoster_short with hide_root_location', () => {
    expect(formatPathPreview({ style: 'agnoster_short', hide_root_location: true })).toBe('../my-app');
    expect(formatPathPreview({ style: 'agnoster_short', hide_root_location: true, max_depth: 2 })).toBe('../src/my-app');
  });

  it('shows the full path for agnoster_short when max_depth covers the whole path', () => {
    expect(formatPathPreview({ style: 'agnoster_short', max_depth: 3 })).toBe('~/projects/src/my-app');
  });

  it('keeps the first folder and its child, then folder icons, for agnoster_left', () => {
    expect(formatPathPreview({ style: 'agnoster_left' })).toBe('~/projects/../..');
  });

  it('abbreviates every folder but the last to its first letter for letter style', () => {
    expect(formatPathPreview({ style: 'letter' })).toBe('~/p/s/my-app');
  });

  it('abbreviates like letter for unique style', () => {
    expect(formatPathPreview({ style: 'unique' })).toBe('~/p/s/my-app');
  });

  it('shortens folders to dir_length chars for fish style', () => {
    expect(formatPathPreview({ style: 'fish' })).toBe('~/p/s/my-app');
    expect(formatPathPreview({ style: 'fish', dir_length: 2 })).toBe('~/pr/sr/my-app');
  });

  it('keeps the last full_length_dirs folders complete for fish style', () => {
    expect(formatPathPreview({ style: 'fish', full_length_dirs: 2 })).toBe('~/p/src/my-app');
  });

  it('keeps short folders and abbreviates long ones for mixed style', () => {
    // 'projects' (8 chars) exceeds the default mixed_threshold of 4, 'src' (3) does not
    expect(formatPathPreview({ style: 'mixed' })).toBe('~/../src/my-app');
    expect(formatPathPreview({ style: 'mixed', mixed_threshold: 2 })).toBe('~/../../my-app');
    expect(formatPathPreview({ style: 'mixed', mixed_threshold: 8 })).toBe('~/projects/src/my-app');
  });

  it('shows the full path for powerlevel unless max_width is exceeded', () => {
    expect(formatPathPreview({ style: 'powerlevel' })).toBe('~/projects/src/my-app');
    expect(formatPathPreview({ style: 'powerlevel', max_width: 12 })).toBe('~/p/s/my-app');
    expect(formatPathPreview({ style: 'powerlevel', max_width: 100 })).toBe('~/projects/src/my-app');
  });

  it('honors folder_separator_icon', () => {
    expect(formatPathPreview({ style: 'full', folder_separator_icon: ' > ' })).toBe('~ > projects > src > my-app');
  });

  it('honors home_icon', () => {
    expect(formatPathPreview({ style: 'full', home_icon: '🏠' })).toBe('🏠/projects/src/my-app');
  });

  it('honors folder_icon for agnoster style', () => {
    expect(formatPathPreview({ style: 'agnoster', folder_icon: '…' })).toBe('~/…/…/my-app');
  });

  it('falls back to the full path for unknown styles', () => {
    expect(formatPathPreview({ style: 'no-such-style' })).toBe('~/projects/src/my-app');
  });
});

describe('getPreviewText for path segment with style options', () => {
  const makePathSegment = (options?: Record<string, unknown>): Segment => ({
    id: 'test-path',
    type: 'path',
    style: 'powerline',
    template: '  {{ .Path }} ',
    options,
  });

  it('renders the letter style in the preview text', () => {
    const text = getPreviewText(makePathSegment({ style: 'letter' }), undefined, true);
    expect(text).toContain('~/p/s/my-app');
  });

  it('renders the folder style in the preview text', () => {
    const text = getPreviewText(makePathSegment({ style: 'folder' }), undefined, true);
    expect(text).toContain('my-app');
    expect(text).not.toContain('~/projects/src/my-app');
  });

  it('keeps the default preview when no options are set', () => {
    const text = getPreviewText(makePathSegment(), undefined, true);
    expect(text).toContain('~/projects/src/my-app');
  });
});
