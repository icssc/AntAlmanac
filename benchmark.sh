#!/bin/bash

# Usage: ./benchmark.sh <staging_num_1> <staging_num_2> <search_term>
STAGING_A=$1
STAGING_B=$2
TERM=$3

if [ -z "$STAGING_A" ] || [ -z "$STAGING_B" ] || [ -z "$TERM" ]; then
    echo "Usage: $0 <staging_A_number> <staging_B_number> <search_term>"
    echo "Example: $0 1439 1453 \"computer science\""
    exit 1
fi

# URL Encoding for the search term
ENCODED_TERM=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$TERM'))")
URL_TEMPLATE="https://staging-%s.antalmanac.com/api/trpc/search.doSearch?batch=1&input=%%7B%%220%%22%%3A%%7B%%22json%%22%%3A%%7B%%22query%%22%%3A%%22$ENCODED_TERM%%22%%2C%%22term%%22%%3A%%222026%%20Winter%%22%%7D%%7D%%7D"

URL1=$(printf "$URL_TEMPLATE" "$STAGING_A")
URL2=$(printf "$URL_TEMPLATE" "$STAGING_B")

get_metrics() {
    # 1. Capture the full output to a variable first for debugging
    local output
    output=$(hey -n 1000 "$1")

    # 2. Check if output is empty
    if [ -z "$output" ]; then
        echo "0 0 0 0"
        return
    fi

    # 3. Use a more flexible awk pattern and handle missing units
    avg=$(echo "$output" | awk '/Average:/ {print $2}' | sed 's/s//')
    rps=$(echo "$output" | awk '/Requests\/sec:/ {print $2}')
    p50=$(echo "$output" | awk '/50% in/ {print $3}' | sed 's/s//')
    p95=$(echo "$output" | awk '/95% in/ {print $3}' | sed 's/s//')

    # If any value is empty, default to 0 to prevent bc errors
    echo "${avg:-0} ${rps:-0} ${p50:-0} ${p95:-0}"
}

echo "Starting benchmarks for term: '$TERM'..."

# Execute
read -r avg1 rps1 p50_1 p95_1 <<< $(get_metrics "$URL1")
read -r avg2 rps2 p50_2 p95_2 <<< $(get_metrics "$URL2")

# Calculate Deltas (Staging A - Staging B)
d_avg=$(echo "$avg1 - $avg2" | bc -l)
d_rps=$(echo "$rps1 - $rps2" | bc -l)
d_p50=$(echo "$p50_1 - $p50_2" | bc -l)
d_p95=$(echo "$p95_1 - $p95_2" | bc -l)

# Output Table
printf "\n%-18s | STAGING %-9s | STAGING %-9s | DELTA\n" "METRIC" "$STAGING_A" "$STAGING_B"
printf "%s\n" "----------------------------------------------------------------------------"
printf "%-18s | %-17s | %-17s | -\n" "Search Term" "$TERM" "$TERM"
printf "%-18s | %-16ss | %-16ss | %+.4fs\n" "Average Latency" "$avg1" "$avg2" "$d_avg"
printf "%-18s | %-17.2f | %-17.2f | %+.2f\n" "Requests / Sec" "$rps1" "$rps2" "$d_rps"
printf "%-18s | %-16ss | %-16ss | %+.4fs\n" "P50 (Median)" "$p50_1" "$p50_2" "$d_p50"
printf "%-18s | %-16ss | %-16ss | %+.4fs\n" "P95" "$p95_1" "$p95_2" "$d_p95"