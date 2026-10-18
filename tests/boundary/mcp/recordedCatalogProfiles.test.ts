import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { expect, it } from "vitest";

// The compiled runtime pre-records catalog digests for every supported
// advertised-profile combination so doctor and session-status identity reads
// answer without canonicalizing every schema at runtime.
it("records catalog digests for every supported input and output profile", async () => {
  const { RECORDED_CATALOG_DIGESTS } = (await import(
    pathToFileURL(resolve("dist/recordedCatalogDigests.js")).href
  )) as {
    RECORDED_CATALOG_DIGESTS:
      | {
          readonly full: Record<string, unknown>;
          readonly compact: Record<string, unknown>;
        }
      | undefined;
  };
  const { createCatalogDigests, createCatalogIdentity } = (await import(
    pathToFileURL(resolve("dist/catalogIdentity.js")).href
  )) as {
    createCatalogDigests: (
      contracts?: unknown,
      promptContracts?: unknown,
      compactPresentation?: { budgetBytes: number } | undefined,
      outputSchemaProfile?: "full" | "off",
    ) => unknown;
    createCatalogIdentity: (
      compactPresentation?: { budgetBytes: number } | undefined,
      outputSchemaProfile?: "full" | "off",
    ) => { readonly digests: unknown };
  };
  const { COMPACT_INPUT_SCHEMA_BUDGET_BYTES } = (await import(
    pathToFileURL(resolve("dist/config/mcpInputSchemaProfile.js")).href
  )) as { COMPACT_INPUT_SCHEMA_BUDGET_BYTES: number };

  expect(RECORDED_CATALOG_DIGESTS).toBeDefined();
  const presentations = {
    full: undefined,
    compact: { budgetBytes: COMPACT_INPUT_SCHEMA_BUDGET_BYTES },
  } as const;
  for (const inputProfile of ["full", "compact"] as const) {
    for (const outputProfile of ["full", "off"] as const) {
      const label = `${inputProfile}/${outputProfile}`;
      const presentation = presentations[inputProfile];
      const recorded =
        RECORDED_CATALOG_DIGESTS?.[inputProfile]?.[outputProfile];
      expect(recorded, label).toBeDefined();
      // The recorded value must equal the live projection of the compiled
      // contracts, and the identity must answer from it without recomputing.
      expect(recorded, label).toEqual(
        createCatalogDigests(undefined, undefined, presentation, outputProfile),
      );
      expect(
        createCatalogIdentity(presentation, outputProfile).digests,
        label,
      ).toEqual(recorded);
    }
  }
});
