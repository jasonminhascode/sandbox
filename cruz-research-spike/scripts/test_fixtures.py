#!/usr/bin/env python3
"""Minimal fixture honesty checks for cruz-research-spike graduation criteria."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "fixtures"


class GovDealsFixtureTests(unittest.TestCase):
    def setUp(self) -> None:
        path = FIXTURES / "govdeals-maestro-search-street-sweeper.json"
        with path.open(encoding="utf-8") as handle:
            self.fixture = json.load(handle)

    def test_meta_live_vmfetch(self) -> None:
        meta = self.fixture["_meta"]
        self.assertEqual(meta["status"], "LIVE")
        self.assertEqual(meta["harvestMethod"], "vmFetch")
        self.assertIn("maestro.lqdt1.com", meta["endpoint"])

    def test_has_freightliner_m2_sweeper(self) -> None:
        rows = self.fixture["response"]["assetSearchResults"]
        self.assertGreater(len(rows), 0)
        m2 = [
            r
            for r in rows
            if (r.get("makebrand") or "").lower() == "freightliner"
            and (r.get("model") or "").upper().startswith("M2")
        ]
        self.assertTrue(m2, "expected at least one Freightliner M2 in fixture")

    def test_category_is_street_sweeper(self) -> None:
        rows = self.fixture["response"]["assetSearchResults"]
        sweeper_rows = [r for r in rows if r.get("categoryDescription") == "Sweeper - Street"]
        self.assertTrue(sweeper_rows)


class IronPlanetFixtureTests(unittest.TestCase):
    def setUp(self) -> None:
        path = FIXTURES / "ironplanet-quickviews-c3226-sample.json"
        with path.open(encoding="utf-8") as handle:
            self.fixture = json.load(handle)

    def test_meta_live(self) -> None:
        self.assertEqual(self.fixture["_meta"]["status"], "LIVE")
        self.assertEqual(self.fixture["_meta"]["categoryId"], "3226")

    def test_quickview_has_equip_id(self) -> None:
        self.assertTrue(all("equipId" in row for row in self.fixture["quickviews"]))


class GsaFixtureTests(unittest.TestCase):
    def setUp(self) -> None:
        path = FIXTURES / "gsa-fleet-graphql-freightliner.json"
        with path.open(encoding="utf-8") as handle:
            self.fixture = json.load(handle)

    def test_meta_partial(self) -> None:
        self.assertEqual(self.fixture["_meta"]["status"], "PARTIAL")

    def test_freightliner_m2_models_present(self) -> None:
        rows = self.fixture["response"]["data"]["getVehicleListingDetails"]["rows"]
        models = {r["modelName"] for r in rows}
        self.assertTrue(any(re.search(r"M2", m or "") for m in models))


if __name__ == "__main__":
    unittest.main()
