import type { CatalogDigests } from "./catalogIdentity.js";

/**
 * Digests of one advertised catalog, keyed by the advertised input-schema
 * presentation and output-schema profile the server selected.
 */
interface RecordedCatalogProfileDigests {
  readonly full: CatalogDigests;
  readonly off: CatalogDigests;
}

/**
 * Digests of every supported advertised-catalog profile combination
 * (input full/compact × output full/off), recorded from the compiled
 * contracts by `scripts/record-catalog-digests.mjs` after compilation.
 * Source runs leave this undefined and compute them on first use.
 */
export const RECORDED_CATALOG_DIGESTS:
  | {
      readonly full: RecordedCatalogProfileDigests;
      readonly compact: RecordedCatalogProfileDigests;
    }
  | undefined = undefined;
