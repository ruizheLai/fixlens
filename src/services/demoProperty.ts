import { DEMO_BACKEND } from "../config/demoBackend";
export interface DemoProperty {
  address: string;
  manager: { name: string; agency_name: string | null } | null;
}
export async function getDemoProperty(signal: AbortSignal): Promise<DemoProperty> {
  const { supabase } = await import("./supabase");
  const { data, error } = await supabase.from("properties")
    .select("address,manager:profiles!properties_property_manager_id_fkey(name,agency_name)")
    .eq("id", DEMO_BACKEND.propertyId)
    .abortSignal(AbortSignal.any([signal, AbortSignal.timeout(15000)])).single<DemoProperty>();
  if (error || !data?.address) throw new Error("Demo property unavailable");
  return data;
}
