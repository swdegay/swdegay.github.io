#!/bin/bash

REPORT_FILE="dist/opt-report.txt"
SRC_HTML="dist/index.source.html"
FINAL_HTML="dist/index.html"
COMMIT_HASH=${1:0:7}

get_size() {
  if [ -f "$1" ]; then
    wc -c < "$1" | tr -d ' '
  else
    echo 0
  fi
}

SIZE_FINAL_HTML=$(get_size "$FINAL_HTML")
SIZE_SRC_HTML=$(get_size "$SRC_HTML")
DIFF=$((SIZE_SRC_HTML - SIZE_FINAL_HTML))

if [ "$SIZE_SRC_HTML" -gt 0 ]; then
  PERCENT=$(awk "BEGIN {printf \"%.2f\", ($DIFF / $SIZE_SRC_HTML) * 100}")
else
  PERCENT="0.00"
fi

{
  echo "+------------------------------------+"
  echo "|  FILE OPTIMIZATION REPORT          |"
  echo "+------------------------------------+"

  printf "|  Date   : %-24s |\n" "$(date '+%Y-%m-%d %H:%M:%S %Z')"
  printf "|  Commit : %-24s |\n" "${COMMIT_HASH:-n/a}"

  echo "+------------------------------------+"
  echo "|  BUILD SUMMARY                     |"

  printf "|  * Unoptimized : %-17s |\n" "$SIZE_SRC_HTML bytes"
  printf "|  * Optimized   : %-17s |\n" "$SIZE_FINAL_HTML bytes"

  echo "|                                    |"
  echo "|  RESULTS                           |"

  if [ "$SIZE_FINAL_HTML" -lt "$SIZE_SRC_HTML" ]; then
    printf "|  * Status : %-22s |\n" "SUCCESS"
    printf "|  * Saved  : %-22s |\n" "$DIFF bytes"
    printf "|  * Change : %-22s |\n" "-${PERCENT}%"
  elif [ "$SIZE_FINAL_HTML" -eq "$SIZE_SRC_HTML" ]; then
    printf "|  * Status : %-22s |\n" "NO CHANGE"
  else
    printf "|  * Status : %-22s |\n" "FAILURE"
    printf "|  * Change : %-22s |\n" "+${PERCENT#-}%"
  fi

  echo "+------------------------------------+"
} > "$REPORT_FILE"

echo "Report generated: $REPORT_FILE"