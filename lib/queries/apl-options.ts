import "server-only";

import { aplConfigured, readAplStock } from "@/lib/apl";
import type { AplOption } from "@/components/admin/catalog/product-form";

/** The variants AuPeptideLabs shares, for the product form's picker. Null when the shelf cannot be read. */
export async function getAplOptions(): Promise<AplOption[] | null> {
  if (!aplConfigured()) return null;
  try {
    const shelf = await readAplStock();
    return [...shelf.values()]
      .map((v) => ({ id: v.variantId, label: `${v.productName} ${v.variantName}`, stock: v.stock }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    return null;
  }
}
