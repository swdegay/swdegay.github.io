# Deno SSG

A lightweight, custom static site generator built with Deno. This pipeline
compiles, minifies, and bundles Vento templates, CSS, JS, and SVG favicon into a
single, self-contained HTML file deployed automatically via GitHub Actions.

I built this project to explore TypeScript, CI/CD, and the mechanics of building
a basic build tool within the modern JavaScript ecosystem.

[Live site](https://sethdegay.dev/) |
[Optimization report](https://sethdegay.dev/optimization-report.txt)

## Benchmark Target

The project aims for a 14KB budget, inspired by the idea that keeping a page
under 14KB allows it to load faster by fitting into a server's initial
congestion window (`initcwnd`). While actual server configurations and
`initcwnd` sizes vary, adopting this value established a clear guide for the
entire pipeline. _(Reference:
[Why your website should be under 14KB in size](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/))_
