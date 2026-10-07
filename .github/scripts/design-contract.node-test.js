import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptsDir, '../..');

const readRepoFile = (relativePath) => readFile(path.join(rootDir, relativePath), 'utf8');

const hexToRgb = (hex) => {
  const value = hex.slice(1);
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
};

const relativeLuminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (foreground, background) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);
  return (lighter + 0.05) / (darker + 0.05);
};

const getToken = (css, name) => {
  const match = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `missing CSS token --color-${name}`);
  return match[1].toLowerCase();
};

const getDarkToken = (css, name) => {
  const darkTheme = css.match(/\.dark\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const match = darkTheme.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert.ok(match, `missing dark CSS token --color-${name}`);
  return match[1].toLowerCase();
};

const collectSourceFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'dev-dist')
      continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectSourceFiles(entryPath)));
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(entryPath);
  }
  return files;
};

test('primary token pair meets the documented WCAG AA target', async () => {
  const css = await readRepoFile('src/index.css');
  const ratio = contrastRatio(getToken(css, 'on-primary'), getToken(css, 'primary'));
  assert.ok(ratio >= 4.5, `primary contrast is ${ratio.toFixed(2)}:1`);
});

test('semantic text colors meet the documented WCAG AA target in both themes', async () => {
  const css = await readRepoFile('src/index.css');
  const lightSurface = getToken(css, 'surface');
  const darkSurface = getDarkToken(css, 'surface');
  const semanticTextTokens = [
    'text-primary',
    'text-secondary',
    'success',
    'warning',
    'danger',
    'info',
  ];

  for (const token of semanticTextTokens) {
    const lightRatio = contrastRatio(getToken(css, token), lightSurface);
    const darkRatio = contrastRatio(getDarkToken(css, token), darkSurface);
    assert.ok(lightRatio >= 4.5, `light ${token} contrast is ${lightRatio.toFixed(2)}:1`);
    assert.ok(darkRatio >= 4.5, `dark ${token} contrast is ${darkRatio.toFixed(2)}:1`);
  }
});

test('DESIGN.md does not promise unsupported routes or primitives', async () => {
  const design = await readRepoFile('DESIGN.md');
  assert.doesNotMatch(design, /\/share\/:uid/);
  assert.doesNotMatch(design, /FormField|Surface,/);
});

test('profile search keeps Firestore access inside the profile service', async () => {
  const hook = await readRepoFile('src/features/profile/hooks/useUserSearch.ts');
  const service = await readRepoFile('src/features/profile/services/memberProfileService.ts');
  assert.doesNotMatch(hook, /firebase\/firestore|@\/lib\/firebase/);
  assert.match(service, /getDocs/);
  assert.match(service, /collection\(db, MEMBER_PROFILE_COLLECTION\)/);
});

test('primary backgrounds do not pair with hardcoded white foregrounds', async () => {
  const sourceFiles = await collectSourceFiles(path.join(rootDir, 'src'));
  const offenders = [];
  for (const file of sourceFiles) {
    const source = await readFile(file, 'utf8');
    for (const [index, line] of source.split('\n').entries()) {
      const hasPrimaryForeground =
        /bg-primary(?:\/[0-9]+)?[^\n"']*text-white|text-white[^\n"']*bg-primary/.test(line);
      const hasHoverOverride = /hover:bg-primary[^\n"']*hover:text-on-primary/.test(line);
      if (hasPrimaryForeground && !hasHoverOverride) {
        offenders.push(`${path.relative(rootDir, file)}:${index + 1}`);
      }
    }
  }
  assert.deepEqual(offenders, [], `hardcoded primary foregrounds: ${offenders.join(', ')}`);
});

test('random picker timing uses the motion contract', async () => {
  const picker = await readRepoFile('src/features/movies/hooks/useRandomPicker.ts');
  assert.match(picker, /MOTION_DURATION\.picker/);
  assert.doesNotMatch(picker, /3150|1950/);
});

test('root package exposes the repository test command', async () => {
  const packageJson = JSON.parse(await readRepoFile('package.json'));
  assert.equal(typeof packageJson.scripts?.test, 'string');
});
