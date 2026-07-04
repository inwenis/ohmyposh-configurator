import { describe, it, expect } from 'vitest';
import { formatPathPreview } from '../pathPreview';
import { getPreviewText } from '../templateUtils';
import type { Segment } from '../../../types/ohmyposh';

describe('formatPathPreview', () => {
  it('returns the full mock path when no options are set', () => {
    expect(formatPathPreview()).toBe('~/dev/my-app');
    expect(formatPathPreview({})).toBe('~/dev/my-app');
  });

  it('shows only the current folder for folder style', () => {
    expect(formatPathPreview({ style: 'folder' })).toBe('my-app');
  });

  it('shows the full path for full style', () => {
    expect(formatPathPreview({ style: 'full' })).toBe('~/dev/my-app');
  });

  it('abbreviates parent folders to first letter for letter style', () => {
    expect(formatPathPreview({ style: 'letter' })).toBe('~/d/my-app');
  });

  it('replaces intermediate folders with the folder icon for agnoster style', () => {
    expect(formatPathPreview({ style: 'agnoster' })).toBe('~/../my-app');
  });

  it('shows all folders for agnoster_full style', () => {
    expect(formatPathPreview({ style: 'agnoster_full' })).toBe('~/dev/my-app');
  });

  it('shortens from the right for agnoster_left style', () => {
    expect(formatPathPreview({ style: 'agnoster_left' })).toBe('~/dev/..');
  });

  it('hides the root location for agnoster_short with hide_root_location', () => {
    expect(formatPathPreview({ style: 'agnoster_short', hide_root_location: true })).toBe('../my-app');
  });

  it('keeps short folders and abbreviates long ones for mixed style', () => {
    // 'dev' (3 chars) is within the default mixed_threshold of 4
    expect(formatPathPreview({ style: 'mixed' })).toBe('~/dev/my-app');
    // threshold 2 pushes 'dev' over the limit
    expect(formatPathPreview({ style: 'mixed', mixed_threshold: 2 })).toBe('~/../my-app');
  });

  it('abbreviates like letter for unique and fish styles', () => {
    expect(formatPathPreview({ style: 'unique' })).toBe('~/d/my-app');
    expect(formatPathPreview({ style: 'fish' })).toBe('~/d/my-app');
  });

  it('honors folder_separator_icon', () => {
    expect(formatPathPreview({ style: 'full', folder_separator_icon: ' > ' })).toBe('~ > dev > my-app');
  });

  it('honors home_icon', () => {
    expect(formatPathPreview({ style: 'full', home_icon: '🏠' })).toBe('🏠/dev/my-app');
  });

  it('honors folder_icon for agnoster style', () => {
    expect(formatPathPreview({ style: 'agnoster', folder_icon: '…' })).toBe('~/…/my-app');
  });

  it('falls back to the full path for unknown styles', () => {
    expect(formatPathPreview({ style: 'powerlevel' })).toBe('~/dev/my-app');
  });
});

describe('getPreviewText for path segment with style options', () => {
  const makePathSegment = (options?: Record<string, unknown>): Segment => ({
    id: 'test-path',
    type: 'path',
    style: 'powerline',
    template: '  {{ .Path }} ',
    options,
  });

  it('renders the letter style in the preview text', () => {
    const text = getPreviewText(makePathSegment({ style: 'letter' }), undefined, true);
    expect(text).toContain('~/d/my-app');
  });

  it('renders the folder style in the preview text', () => {
    const text = getPreviewText(makePathSegment({ style: 'folder' }), undefined, true);
    expect(text).toContain('my-app');
    expect(text).not.toContain('~/dev/my-app');
  });

  it('keeps the default preview when no options are set', () => {
    const text = getPreviewText(makePathSegment(), undefined, true);
    expect(text).toContain('~/dev/my-app');
  });
});
