# Deno SSG

A lightweight, custom static site generator built with Deno. This pipeline
compiles, minifies, and bundles Vento templates, CSS, and JS into a
single, self-contained HTML file deployed automatically via GitHub Actions.

[Live site](https://sethdegay.dev/) |
[Optimization report](https://sethdegay.dev/optimization-report.txt)

## Getting Started

### Prerequisites

- Docker
- Visual Studio Code (with the `ms-vscode-remote.remote-containers` extension)

### Development

- Live Reload: Run `deno task dev` to start a local file server that watches for
  changes and rebuilds automatically.
- Minified Build: Run `deno task build-dev` to generate a minified output
  intended for inspection during development. This outputs a SHA-256 checksum;
  if the build is correct, use this hash to update the build test configuration.
- Validation: Run `deno task check` to execute linting, code formatting, and a
  full pipeline verification.

### User Data Configuration

To keep sensitive personal details out of the Git history, user data is managed
locally via JSON and deployed via GitHub Secrets.

#### Local Development

A sample structure is available at [data/userdata.json](data/userdata.json) to
demonstrate the expected schema. It is recommended to maintain a separate local
copy for actual user data. Modifying the original sample file will alter the
minified build hash and fail the validation tests.

#### Production Deployment

1. Encode your production `userdata.json` file to Base64 (without line wraps):

```bash
base64 -w 0 data/userdata.json
```

2. Navigate to your repository: Settings > Secrets and variables > Actions >
   Secrets.
3. Create a new repository secret:

- Name: `USER_DATA`
- Value: [Paste the Base64 output here]

For implementation details, review the deployment logic in the
[workflow](.github/workflows/main.yml) file.

## Benchmark Target

The project aims for a 14KB budget, inspired by the idea that keeping a page
under 14KB allows it to load faster by fitting into a server's initial
congestion window (`initcwnd`). While actual server configurations and
`initcwnd` sizes vary, adopting this value established a clear guide for the
entire pipeline. _(Reference:
[Why your website should be under 14KB in size](https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/))_
