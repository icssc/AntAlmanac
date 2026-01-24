import subprocess
import urllib.parse
import sys
import re
import argparse


def _extract_latency_percentile(output: str, percentile: int) -> float:
    """
    Try to extract a latency percentile (e.g. 50, 95) from hey's output.

    Different hey builds / platforms can format this slightly differently,
    so we try a few regex patterns instead of relying on one exact string.
    """
    patterns = [
        rf"{percentile}%\s+in\s+([\d.]+)",                 # e.g. '50% in 0.0835 secs'
        rf"{percentile}\s+in\s+([\d.]+)",                  # e.g. '50 in 0.0835 secs' (no % sign)
        rf"{percentile}%.*?([\d.]+)\s*(?:secs?|ms)",       # more flexible, with units
    ]

    for pattern in patterns:
        match = re.search(pattern, output)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                continue

    return 0.0


def get_metrics(url, staging_number: str, num_requests: int):
    try:
        # Run 'hey' command: 1000 requests
        result = subprocess.run(
            ['hey', '-n', str(num_requests), url],
            capture_output=True, 
            text=True, 
            check=True
        )
        output = result.stdout

        metrics = {
            "avg": 0.0,
            "rps": 0.0,
            "p50": 0.0,
            "p95": 0.0,
            "status": "N/A"
        }

        # Latency and Throughput Regex
        avg_match = re.search(r"Average:\s+([\d.]+)", output)
        rps_match = re.search(r"Requests/sec:\s+([\d.]+)", output)

        if avg_match:
            metrics["avg"] = float(avg_match.group(1))
        if rps_match:
            metrics["rps"] = float(rps_match.group(1))

        # Percentiles (p50 / p95) can be formatted differently across platforms,
        # so use a helper that tries multiple patterns instead of one exact match.
        metrics["p50"] = _extract_latency_percentile(output, 50)
        metrics["p95"] = _extract_latency_percentile(output, 95)

        # Status Code Extraction
        # Look for the pattern '[200] 1000 responses' or similar in the summary
        status_matches = re.findall(r"\[(\d+)\]\s+(\d+)\s+responses", output)
        if status_matches:
            # Join multiple codes if they exist, e.g., "200: 980, 500: 20"
            metrics["status"] = ", ".join([f"{code}: {count}" for code, count in status_matches])

        return metrics

    except subprocess.CalledProcessError as e:
        print(f"Error running hey for staging {staging_number}: {e}")
        return {"avg": 0, "rps": 0, "p50": 0, "p95": 0, "status": "Error"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Compare search performance between two staging environments "
            "by sending a configurable number of requests to each."
        )
    )
    parser.add_argument("staging_a", help="First staging number (e.g. 1457)")
    parser.add_argument("staging_b", help="Second staging number (e.g. 1456)")
    parser.add_argument("term", help='Search term, e.g. "computer science"')
    parser.add_argument(
        "-n",
        "--requests",
        type=int,
        default=1000,
        help="Number of requests to send to each staging (default: 1000)",
    )

    return parser.parse_args()


def main():
    args = parse_args()

    staging_a, staging_b, term = args.staging_a, args.staging_b, args.term
    num_requests = args.requests

    # High-level benchmark description (single, nicer line)
    print(
        f'Benchmarking staging {staging_a} vs {staging_b} for "{term}" '
        f"with {num_requests} requests each"
    )
    encoded_term = urllib.parse.quote(term)
    
    url_template = (
        "https://staging-{}.antalmanac.com/api/trpc/search.doSearch?"
        "batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22query%22%3A%22{}%22%2C"
        "%22term%22%3A%222026%20Winter%22%7D%7D%7D"
    )

    url_1 = url_template.format(staging_a, encoded_term)
    url_2 = url_template.format(staging_b, encoded_term)

    # Simple progress-style output around each hey run
    print(f"- Running staging {staging_a} ({num_requests} requests)...", flush=True)
    metrics_1 = get_metrics(url_1, staging_a, num_requests)
    print(f"- Finished staging {staging_a}", flush=True)

    print(f"- Running staging {staging_b} ({num_requests} requests)...", flush=True)
    metrics_2 = get_metrics(url_2, staging_b, num_requests)
    print(f"- Finished staging {staging_b}", flush=True)

    # Formatting
    header_fmt = "{:<18} | STAGING {:<15} | STAGING {:<15} | DELTA"
    row_fmt = "{:<18} | {:<23} | {:<23} | {:<23}"
    
    print("\n" + header_fmt.format("METRIC", staging_a, staging_b))
    print("-" * 85)
    
    # Status Codes Row (Special handling since delta doesn't apply)
    print("{:<18} | {:<23} | {:<23} | -".format("Status Codes", metrics_1["status"], metrics_2["status"]))

    # Numerical Metrics
    # Internally we keep latencies in seconds (as hey reports),
    # but display them in milliseconds for readability.
    metrics_to_print = [
        ("Average Latency", "avg"),
        ("Requests / Sec", "rps"),
        ("P50 (Median)", "p50"),
        ("P95", "p95"),
    ]

    for label, key in metrics_to_print:
        v1, v2 = metrics_1[key], metrics_2[key]

        if key in ("avg", "p50", "p95"):
            # Convert seconds → milliseconds for display
            v1_disp = v1 * 1000
            v2_disp = v2 * 1000
            delta_disp = v1_disp - v2_disp
            unit = "ms"
        else:
            v1_disp = v1
            v2_disp = v2
            delta_disp = v1_disp - v2_disp
            unit = ""

        delta_str = f"{delta_disp:+.4f}{unit}"

        print(
            row_fmt.format(
                label,
                f"{v1_disp:.4f}{unit}",
                f"{v2_disp:.4f}{unit}",
                delta_str,
            )
        )

if __name__ == "__main__":
    main()