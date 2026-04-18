Site: https://sethdegay.dev/

Description: This project is a sandbox for minimizing webpage payload.

Objectives:
  - Progressive enhancement approach to maintain functionality for security and
    performance conscious visitors who disable JavaScript on their browsers.
  - Payload < 14kb (excl. remote assets)
    Ref: https://endtimes.dev/why-your-website-should-be-under-14kb-in-size/
  - Aesthetic: Brutalist/Terminal-inspired

Notes:
  - Mangle charset is shuffled using the latest commit hash as seed to ensure
    deterministic outputs
  - Server side compression (gzip/brotli) may further reduce delivered payload
  - Initial loading time may vary depending on regional server caching
  - Optimization report is available at: https://sethdegay.dev/opt-report.txt

