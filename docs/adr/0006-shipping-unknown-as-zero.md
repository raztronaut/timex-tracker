# ADR 0006: Unknown shipping treated as $0

## Status

Accepted

## Context

Marketplace search result pages don't always show shipping costs. eBay may show "shipping TBD" or simply omit the field. Calculated shipping to postal code M6K1V8 may not appear until checkout. We need a rule for how to handle unknown shipping in cost calculations.

## Decision

When shipping cost is not visible on the search result page, it is treated as `null` in the raw listing and `$0` in the `totalCostCad` calculation. The `shippingUnknown` flag is set to `true` on the `NormalizedListing` so downstream consumers know the total is a floor estimate.

## Consequences

- The total cost shown is a floor estimate, not exact. The UI labels these as "shipping TBD."
- Some candidates may actually exceed $50 once real shipping is known. The collector understands this tradeoff.
- The alternative (excluding unknown-shipping listings) would filter out too many legitimate results.
