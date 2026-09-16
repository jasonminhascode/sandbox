#!/usr/bin/env python3
"""Research-only: prove GovDeals maestro.lqdt1.com JSON is reachable via vmFetch."""

from __future__ import annotations

import json
import sys
import uuid
from datetime import UTC, datetime
from urllib import error, request

MAESTRO_URL = "https://maestro.lqdt1.com/search/list"
# Public anonymous key shipped in GovDeals JS bundle (rotates; refresh from bundle if 401).
MAESTRO_KEY = "af93060f-337e-428c-87b8-c74b5837d6cd"


def fetch_search(search_text: str, page: int = 1, display_rows: int = 5) -> dict:
    payload = {
        "categoryIds": "",
        "businessId": "GD",
        "searchText": search_text,
        "isQAL": False,
        "locationId": "",
        "model": "",
        "makebrand": "",
        "eventId": "",
        "auctionTypeId": "",
        "page": page,
        "displayRows": display_rows,
        "sortField": "",
        "sortOrder": "",
        "sessionId": "",
        "requestType": "",
        "responseStyle": "",
        "facets": [],
    }
    headers = {
        "User-Agent": "cruz-research-spike/1.0 (research-only)",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "x-api-key": MAESTRO_KEY,
        "x-user-id": "-1",
        "x-api-correlation-id": str(uuid.uuid4()),
        "x-page-unique-id": str(uuid.uuid4()),
        "Origin": "https://www.govdeals.com",
        "Referer": "https://www.govdeals.com/",
    }
    req = request.Request(
        MAESTRO_URL,
        data=json.dumps(payload).encode(),
        headers=headers,
        method="POST",
    )
    with request.urlopen(req, timeout=30) as resp:
        body = json.loads(resp.read().decode())
        return {
            "status": resp.status,
            "x_total_count": resp.headers.get("x-total-count"),
            "fetched_at": datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
            "results": body.get("assetSearchResults", []),
        }


def main() -> int:
    query = sys.argv[1] if len(sys.argv) > 1 else "street sweeper"
    try:
        data = fetch_search(query)
    except error.HTTPError as exc:
        print(json.dumps({"error": exc.code, "reason": exc.reason}), file=sys.stderr)
        return 1

    print(json.dumps({"query": query, **data}, indent=2))
    if not data["results"]:
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
