import test from 'node:test';
import assert from 'node:assert/strict';
import { releaseNotes } from '../scripts/release-notes.mjs';

test('release notes isolate the exact version and retain Markdown', () => {
  const changelog = '# 变更记录\r\n\r\n## 1.0.10 - 2026-10-11\r\n\r\n- newer\r\n\r\n## 1.0.1 - 2026-10-10\r\n\r\n- **中文**\r\n\r\n### 兼容性\r\n\r\n说明\r\n\r\n## 1.0.0 - 2026-10-09\r\n\r\n- older\r\n';
  assert.equal(releaseNotes(changelog, 'v1.0.1'), '- **中文**\n\n### 兼容性\n\n说明\n');
  assert.equal(releaseNotes(changelog, 'v1.0.0'), '- older\n');
});

test('release notes reject invalid, missing and empty entries', () => {
  assert.throws(() => releaseNotes('', '1.0.0'), /Invalid/);
  assert.throws(() => releaseNotes('', 'v1.0.0'), /Missing/);
  assert.throws(() => releaseNotes('## 1.0.0 - 2026-10-10\n\n', 'v1.0.0'), /Empty/);
});
