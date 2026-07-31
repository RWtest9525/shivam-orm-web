import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const users = [
      {
        email: "admin@hoora.com",
        password: "admin123",
        isAdmin: true,
        companyName: "Hoora Admin",
        contactPerson: "Super Admin",
        phone: "+91 9999999999",
        plan: "enterprise",
      },
      {
        email: "demo@hoora.com",
        password: "client123",
        isAdmin: false,
        companyName: "AutoCare Pro",
        contactPerson: "Rajesh Kumar",
        phone: "+91 9876543210",
        plan: "pro",
      },
    ];

    const results: any[] = [];

    for (const u of users) {
      // Check if user already exists in clients table by email
      const { data: existingClient } = await adminClient
        .from("clients")
        .select("id, auth_user_id")
        .eq("email", u.email)
        .maybeSingle();

      if (existingClient?.auth_user_id) {
        results.push({ email: u.email, status: "already_exists", clientId: existingClient.id });
        continue;
      }

      // Create auth user via admin API
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { company_name: u.companyName },
      });

      if (authError) {
        // If user exists in auth but not in clients, try to link
        if (authError.message.includes("already") || authError.message.includes("registered")) {
          const { data: listData } = await adminClient.auth.admin.listUsers();
          const found = listData?.users?.find((x: any) => x.email === u.email);
          if (found) {
            const { data: clientRow, error: clientErr } = await adminClient
              .from("clients")
              .insert({
                email: u.email,
                company_name: u.companyName,
                contact_person: u.contactPerson,
                phone: u.phone,
                plan: u.plan,
                status: "active",
                is_super_admin: u.isAdmin,
                auth_user_id: found.id,
              })
              .select("id")
              .single();
            results.push({ email: u.email, status: "linked_existing", clientId: clientRow?.id, error: clientErr?.message });
            continue;
          }
        }
        results.push({ email: u.email, status: "error", error: authError.message });
        continue;
      }

      const userId = authData.user.id;

      // Create client row linked to auth user
      const { data: clientRow, error: clientError } = await adminClient
        .from("clients")
        .insert({
          email: u.email,
          company_name: u.companyName,
          contact_person: u.contactPerson,
          phone: u.phone,
          plan: u.plan,
          status: "active",
          is_super_admin: u.isAdmin,
          auth_user_id: userId,
        })
        .select("id")
        .single();

      if (clientError) {
        results.push({ email: u.email, status: "client_error", error: clientError.message, userId });
        continue;
      }

      results.push({ email: u.email, status: "created", clientId: clientRow.id, userId });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
