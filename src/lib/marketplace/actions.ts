"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/permissions/server";
import { logAudit } from "@/lib/audit/log";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

/* ═══════════ CREATE LISTING ═══════════ */

type ListingInput = {
  categoryId: string;
  title: string;
  description: string;
  basePrice: number;
  currency: "EGP" | "USD" | "SAR" | "AED";
  deliveryDays: number;
  revisions: number;
  tags?: string[];
  packages?: {
    tier: "basic" | "standard" | "premium";
    name: string;
    description?: string;
    price: number;
    deliveryDays: number;
    revisions: number;
    features?: string[];
  }[];
};

export async function createListingAction(
  input: ListingInput
): Promise<Result<string>> {
  try {
    const ctx = await requirePermission("workspace.view");
    const supabase = await createClient();

    if (!input.title.trim() || !input.description.trim()) {
      return { success: false, error: "missing_fields" };
    }

    if (input.basePrice <= 0) {
      return { success: false, error: "invalid_price" };
    }

    const { data: slugData, error: slugError } = await supabase.rpc(
      "generate_slug",
      { base: input.title }
    );
    if (slugError) return { success: false, error: slugError.message };

    const { data, error } = await supabase
      .from("service_listings")
      .insert({
        provider_id: ctx.userId,
        workspace_id: ctx.workspaceId,
        category_id: input.categoryId,
        title: input.title.trim(),
        slug: slugData as string,
        description: input.description.trim(),
        base_price: input.basePrice,
        currency: input.currency,
        delivery_days: input.deliveryDays,
        revisions: input.revisions,
        tags: input.tags ?? [],
        status: "published",
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    // نضيف الباقات لو موجودة
    if (input.packages && input.packages.length > 0) {
      const packagesToInsert = input.packages.map((p) => ({
        listing_id: data.id,
        tier: p.tier,
        name: p.name,
        description: p.description ?? null,
        price: p.price,
        delivery_days: p.deliveryDays,
        revisions: p.revisions,
        features: p.features ?? [],
      }));

      const { error: pkgError } = await supabase
        .from("service_listing_packages")
        .insert(packagesToInsert);

      if (pkgError) {
        // نمسح الـ listing لو فشل
        await supabase.from("service_listings").delete().eq("id", data.id);
        return { success: false, error: pkgError.message };
      }
    }

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "service_listing",
      entityId: data.id,
      entityName: input.title,
      metadata: { category: input.categoryId, price: input.basePrice },
    });

    revalidatePath("/marketplace");
    revalidatePath("/dashboard/marketplace");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ UPDATE LISTING STATUS ═══════════ */

export async function updateListingStatusAction(
  listingId: string,
  status: "draft" | "published" | "paused" | "archived"
): Promise<Result> {
  try {
    const ctx = await requirePermission("workspace.view");
    const supabase = await createClient();

    const { error } = await supabase
      .from("service_listings")
      .update({ status })
      .eq("id", listingId)
      .eq("workspace_id", ctx.workspaceId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/marketplace");
    revalidatePath("/marketplace");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ DELETE LISTING ═══════════ */

export async function deleteListingAction(
  listingId: string
): Promise<Result> {
  try {
    const ctx = await requirePermission("workspace.view");
    const supabase = await createClient();

    const { error } = await supabase
      .from("service_listings")
      .delete()
      .eq("id", listingId)
      .eq("workspace_id", ctx.workspaceId);

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "service_listing",
      entityId: listingId,
      metadata: { action: "delete" },
      severity: "warning",
    });

    revalidatePath("/dashboard/marketplace");
    revalidatePath("/marketplace");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ CREATE SERVICE REQUEST ═══════════ */

type RequestInput = {
  categoryId: string;
  title: string;
  description: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: "EGP" | "USD" | "SAR" | "AED";
  deadline?: string;
};

export async function createServiceRequestAction(
  input: RequestInput
): Promise<Result<string>> {
  try {
    const ctx = await requirePermission("workspace.view");
    const supabase = await createClient();

    if (!input.title.trim() || !input.description.trim()) {
      return { success: false, error: "missing_fields" };
    }

    const { data: refData, error: refError } = await supabase.rpc(
      "generate_reference",
      { prefix: "SR" }
    );
    if (refError) return { success: false, error: refError.message };

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        reference: refData as string,
        client_id: ctx.userId,
        workspace_id: ctx.workspaceId,
        category_id: input.categoryId,
        title: input.title.trim(),
        description: input.description.trim(),
        budget_min: input.budgetMin ?? null,
        budget_max: input.budgetMax ?? null,
        currency: input.currency,
        deadline: input.deadline ?? null,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    await logAudit({
      action: "auth.password_reset" as never,
      entityType: "service_request",
      entityId: data.id,
      entityName: input.title,
    });

    revalidatePath("/marketplace/requests");
    revalidatePath("/dashboard/marketplace/requests");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ UPDATE REQUEST STATUS ═══════════ */

export async function updateRequestStatusAction(
  requestId: string,
  status: "open" | "in_review" | "awarded" | "in_progress" | "completed" | "cancelled"
): Promise<Result> {
  try {
    const ctx = await requirePermission("workspace.view");
    const supabase = await createClient();

    const { error } = await supabase
      .from("service_requests")
      .update({ status })
      .eq("id", requestId)
      .eq("client_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/marketplace/requests");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

/* ═══════════ INCREMENT VIEW COUNT ═══════════ */

export async function incrementListingViewsAction(
  listingId: string
): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_listing_views" as never, {
      p_listing_id: listingId,
    } as never);
  } catch {
    // silent — ليس حرجًا
  }
}