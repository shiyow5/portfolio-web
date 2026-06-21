import { describe, expect, it } from 'vitest';
import { firstYoutubeId, youtubeEmbed, youtubeId, youtubeThumb } from './media';

describe('youtubeId', () => {
  it('parses youtu.be, watch, embed and shorts urls', () => {
    expect(youtubeId('https://youtu.be/wilF-7lHfRA')).toBe('wilF-7lHfRA');
    expect(youtubeId('https://www.youtube.com/watch?v=pysfLn6iDng')).toBe('pysfLn6iDng');
    expect(youtubeId('https://youtube.com/embed/abc12345678')).toBe('abc12345678');
    expect(youtubeId('https://www.youtube.com/shorts/abcDEF12345')).toBe('abcDEF12345');
  });

  it('returns null for non-YouTube urls', () => {
    expect(youtubeId('https://prtimes.jp/x/y')).toBeNull();
    expect(youtubeId('/papers/thesis.pdf')).toBeNull();
  });
});

describe('firstYoutubeId', () => {
  it('finds the first YouTube url in a list', () => {
    expect(firstYoutubeId(['https://prtimes.jp/x', 'https://youtu.be/wilF-7lHfRA'])).toBe(
      'wilF-7lHfRA',
    );
    expect(firstYoutubeId(['https://example.com'])).toBeNull();
  });
});

describe('thumb / embed urls', () => {
  it('builds thumbnail and nocookie embed urls', () => {
    expect(youtubeThumb('ID12345678x')).toBe(
      'https://img.youtube.com/vi/ID12345678x/hqdefault.jpg',
    );
    expect(youtubeEmbed('ID12345678x')).toBe('https://www.youtube-nocookie.com/embed/ID12345678x');
  });
});
