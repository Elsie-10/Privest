## Domain structure

This directory organizes Privest around the product journey:

- `ingestion` — statement parsing and validation
- `portfolio-engine` — deterministic portfolio calculations
- `risk` — deterministic recommendations and thresholds
- `privacy` — privacy-layer orchestration
- `history` — local snapshot persistence
- `ai` — AI communication layer and fallbacks
- `growth` — deterministic projection utilities
- `shared` — constants reused across domains

Each domain currently re-exports the existing implementation to avoid breaking behavior while establishing the structure for future expansion.
