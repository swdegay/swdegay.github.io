import { assertEquals } from '@std/assert';
import { injectUmamiScript } from '@/plugins/umami-analytics-plugin.ts';

const UMAMI_WEBSITE_ID = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';
const EXPECTED_SCRIPT =
  `<script defer src="https://cloud.umami.is/script.js" data-website-id="${UMAMI_WEBSITE_ID}"></script>`;

Deno.test('inserts right before the closing body tag', () => {
  const input = '<html><head></head><body><h1>Hello World</h1></body></html>';
  const expected =
    `<html><head></head><body><h1>Hello World</h1>${EXPECTED_SCRIPT}</body></html>`;

  assertEquals(injectUmamiScript(input, UMAMI_WEBSITE_ID), expected);
});

Deno.test('appends to the end when no body tag exists', () => {
  const input = '<h1>Hello</h1><div>Minified content</div>';
  const expected =
    `<h1>Hello</h1><div>Minified content</div>${EXPECTED_SCRIPT}`;

  assertEquals(injectUmamiScript(input, UMAMI_WEBSITE_ID), expected);
});
