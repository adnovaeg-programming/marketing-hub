"use server";

import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/permissions/server";

export type PlatformKPIs = {
  total_users: number;
  new_users_today: number;
  new_users_7d: number;
  new_users_30d: number;
  total_organizations: number;
  total_workspaces: number;
  total_clients: number;
  total_projects: number;
  total_content: number;
  total_contracts: number;
  total_contracts_value: number;
  total_platform_fees: number;
  active_contracts: number;
  completed_contracts: number;
  wallet_total_balance: number;
  total_deposits: number;
  total_payouts: number;
  pending_payouts: number;
  total_marketplace_listings: number;
  total_scheduled_posts: number;
  published_posts: number;
  failed_posts: number;
  active_social_accounts: number;
};

export type GrowthDataPoint = {
  day: string;
  signups: number;
  revenue: number;
  contracts: number;
};

export type TopWorkspace = {
  workspace_id: string;
  workspace_name: string;
  organization_name: string | null;
  members_count: number;
  clients_count: number;
  projects_count: number;
  content_count: number;
  tasks_count: number;
  contracts_value: number;
  activity_score: number;
};

export type RevenueBreakdown = {
  platform_fees: number;
  deposits: number;
  withdrawals: number;
  escrow_held: number;
  escrow_released: number;
  pending_revenue: number;
  refunds: number;
};

export type ContentPerformance = Record<string, number>;

export async function getKPIsAction(): Promise<PlatformKPIs | null> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_platform_kpis");
    if (error) return null;
    return data as PlatformKPIs;
  } catch {
    return null;
  }
}

export async function getGrowthTimelineAction(
  days = 30
): Promise<GrowthDataPoint[]> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_growth_timeline", {
      p_days: days,
    });
    if (error) return [];
    return (data ?? []) as GrowthDataPoint[];
  } catch {
    return [];
  }
}

export async function getTopWorkspacesAction(
  limit = 10
): Promise<TopWorkspace[]> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_top_workspaces", {
      p_limit: limit,
    });
    if (error) return [];
    return (data ?? []) as TopWorkspace[];
  } catch {
    return [];
  }
}

export async function getRevenueBreakdownAction(): Promise<RevenueBreakdown | null> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_revenue_breakdown");
    if (error) return null;
    return data as RevenueBreakdown;
  } catch {
    return null;
  }
}

export async function getContentPerformanceAction(): Promise<ContentPerformance | null> {
  try {
    await requirePlatformAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_content_performance");
    if (error) return null;
    return data as ContentPerformance;
  } catch {
    return null;
  }
}