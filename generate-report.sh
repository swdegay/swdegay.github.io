#!/bin/bash

get_size() {
  if [[ -f $1 ]]; then
    wc -c < "$1" | tr -d ' '
  else
    echo 0
  fi
}

abs() {
  echo $(( $1 < 0 ? -$1 : $1 ))
}

if ! git rev-parse --verify --quiet "$1^{commit}" &> /dev/null; then
  echo "Error: Invalid commit hash" >&2
  exit 1
fi

# output file
REPORT_FILE="dist/optimization-report.txt"

# inputs
SRC_HTML="dist/index.html"
MIN_HTML="dist/index.min.html"
COMMIT_HASH=${1:0:7}

OLD=$(get_size "$SRC_HTML")
NEW=$(get_size "$MIN_HTML")

if [[ $OLD -le 0 || $NEW -le 0 ]]; then
  echo "Error: Source or optimized file is missing or empty." >&2
  exit 1
fi

DIFF=$((NEW - OLD))
PERCENT=$(awk "BEGIN {printf \"%.2f\", ($DIFF / $OLD) * 100}")

{
  echo "+------------------------------------+"
  echo "|  FILE OPTIMIZATION REPORT          |"
  echo "+------------------------------------+"

  printf "|  Date   : %-24s |\n" "$(date '+%Y-%m-%d %H:%M:%S %Z')"
  printf "|  Commit : %-24s |\n" "${COMMIT_HASH:-n/a}"

  echo "+------------------------------------+"
  echo "|  BUILD SUMMARY                     |"

  printf "|  * Unoptimized : %-17s |\n" "$OLD bytes"
  printf "|  * Optimized   : %-17s |\n" "$NEW bytes"

  echo "|                                    |"
  echo "|  RESULTS                           |"

  if [[ $NEW -lt $OLD ]]; then
    printf "|  * Saved  : %-22s |\n" "$(abs "$DIFF") bytes"
    printf "|  * Change : %-22s |\n" "${PERCENT}%"
    printf "|  * Status : %-22s |\n" "SUCCESS"
  elif [[ $NEW -eq $OLD ]]; then
    printf "|  * Status : %-22s |\n" "NO CHANGE"
  else
    printf "|  * Status : %-22s |\n" "FAILURE"
    printf "|  * Change : %-22s |\n" "+${PERCENT}%"
  fi

  echo "+------------------------------------+"
} > "$REPORT_FILE"

echo "Report generated: $REPORT_FILE"