import { assertEquals } from '@std/assert';
import { mangleCss } from '@/scripts/mangle-css.ts';

Deno.test('should correctly mangle classes, IDs, and CSS variables', async () => {
  const html = `
  <style>
    :root { --main-color: #ff0000; }
    .btn-primary { background: var(--main-color); }
  </style>
  <div class="btn-primary" id="submit-btn">Click Me</div>
  `;

  const { processed, classMap } = await mangleCss(html, 'secret-seed');

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

Deno.test('should produce consistent results with the same seed', async () => {
  const html = `<div class="test" id="test"></div>`;
  const res1 = await mangleCss(html, 'constant-seed');
  const res2 = await mangleCss(html, 'constant-seed');

  assertEquals(res1.classMap, res2.classMap);
});
