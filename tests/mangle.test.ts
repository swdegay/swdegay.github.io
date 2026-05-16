import { assertEquals } from '@std/assert';
import { mangleCssInternal } from '@/plugins/css-mangle-plugin.ts';

Deno.test('should correctly mangle classes, IDs, and CSS variables', async () => {
  const html = `
  <style>
    :root { --main-color: #ff0000; }
    .btn-primary { background: var(--main-color); }
  </style>
  <div class="btn-primary" id="submit-btn">Click Me</div>
  <script>document.getElementById('submit-btn').textContent='Hi';</script>
  `;

  const { processed, classMap } = await mangleCssInternal(html, 'secret-seed');

  assertEquals(classMap, {
    'btn-primary': 'F',
    'submit-btn': 'I',
    '--main-color': 'Y',
  });

  assertEquals(processed.includes('--Y: #ff0000;'), true);
  assertEquals(processed.includes('.F { background: var(--Y); }'), true);
  assertEquals(processed.includes('class="F"'), true);
  assertEquals(processed.includes('id="I"'), true);
});

Deno.test('should produce consistent class maps with the same seed', async () => {
  const html = `<div class="test" id="test"></div>`;
  const res1 = await mangleCssInternal(html, 'constant-seed');
  const res2 = await mangleCssInternal(html, 'constant-seed');

  assertEquals(res1.classMap, res2.classMap);
});
