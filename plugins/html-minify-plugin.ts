import { minify } from '@minify-html/deno';
import { Context, Plugin } from '@/scripts/types.ts';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** @internal */
export function minifyHtmlInternal(htmlContent: string): string {
  const minified = minify(encoder.encode(htmlContent), {
    allow_noncompliant_unquoted_attribute_values: false, // true = possibly noncompliant
    allow_optimal_entities: false, // true = possibly noncompliant
    allow_removing_spaces_between_attributes: false, // true = possibly noncompliant
    keep_closing_tags: false,
    keep_comments: false,
    keep_html_and_head_opening_tags: false,
    keep_input_type_text_attr: false,
    keep_ssi_comments: false,
    minify_css: true,
    minify_doctype: false, // true = possibly noncompliant
    minify_js: true,
    preserve_brace_template_syntax: false,
    preserve_chevron_percent_template_syntax: false,
    remove_bangs: true,
    remove_processing_instructions: true,
  });
  return decoder.decode(minified);
}

const minifyHtml: Plugin = {
  name: 'HTML Minifier',
  transform(context: Context) {
    context.value = minifyHtmlInternal(context.value);
    return context;
  },
};
export default minifyHtml;
