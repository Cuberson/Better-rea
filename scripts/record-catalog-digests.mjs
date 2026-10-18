import { writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Record the advertised catalog digests for every supported profile
// combination into the compiled runtime. Run after `tsc` and before bundling,
// so the digests come from the same compiled contracts and pinned schema
// converter that the runtime serves. Doctor and session-status identity reads
// then answer from recorded digests instead of canonicalizing every schema.
const compiledRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../dist",
);
const { createCatalogDigests } = await import(
  pathToFileURL(join(compiledRoot, "catalogIdentity.js")).href
);
const { COMPACT_INPUT_SCHEMA_BUDGET_BYTES } = await import(
  pathToFileURL(join(compiledRoot, "config/mcpInputSchemaProfile.js")).href
);
const compactPresentation = { budgetBytes: COMPACT_INPUT_SCHEMA_BUDGET_BYTES };
const digests = (presentation, outputSchemaProfile) =>
  createCatalogDigests(undefined, undefined, presentation, outputSchemaProfile);
await writeFile(
  join(compiledRoot, "recordedCatalogDigests.js"),
  `/** Recorded from the compiled catalogs by scripts/record-catalog-digests.mjs; do not edit. */\nexport const RECORDED_CATALOG_DIGESTS = Object.freeze(${JSON.stringify(
    {
      full: {
        full: digests(undefined, "full"),
        off: digests(undefined, "off"),
      },
      compact: {
        full: digests(compactPresentation, "full"),
        off: digests(compactPresentation, "off"),
      },
    },
  )});\n`,
  "utf8",
);
