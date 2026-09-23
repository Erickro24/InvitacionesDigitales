import { supabase, supabaseEnabled } from "./supabase";
import { DEFAULT_INVITATION } from "./data";

const LOCAL_KEY = "bodaseditor_v2_invitations";

function localGet() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
  } catch {
    return [];
  }
}
function localSet(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export async function listInvitations(userId = "demo") {
  if (!supabaseEnabled) {
    return localGet();
  }
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getInvitationBySlug(slug) {
  if (!supabaseEnabled) {
    return localGet().find((x) => x.slug === slug) || null;
  }
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getInvitation(id, userId = "demo") {
  if (!supabaseEnabled) {
    return localGet().find((x) => x.id === id) || null;
  }
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createInvitation(userId = "demo") {
  const newInvitation = {
    ...DEFAULT_INVITATION,
    id: crypto.randomUUID(),
    user_id: userId,
    slug: `mi-boda-${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
  };

  if (!supabaseEnabled) {
    const data = [newInvitation, ...localGet()];
    localSet(data);
    return newInvitation;
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert([{ ...newInvitation, id: undefined }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateInvitation(id, patch, userId = "demo") {
  if (!supabaseEnabled) {
    const data = localGet().map((item) =>
      item.id === id ? { ...item, ...patch } : item
    );
    localSet(data);
    return data.find((x) => x.id === id);
  }

  const { data, error } = await supabase
    .from("invitations")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteInvitation(id, userId = "demo") {
  if (!supabaseEnabled) {
    localSet(localGet().filter((x) => x.id !== id));
    return;
  }
  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function incrementView(id) {
  if (!supabaseEnabled) {
    const data = localGet().map((item) =>
      item.id === id ? { ...item, views: (item.views || 0) + 1 } : item
    );
    localSet(data);
    return;
  }
  const { data: row } = await supabase
    .from("invitations")
    .select("views")
    .eq("id", id)
    .single();
  if (row) {
    await supabase
      .from("invitations")
      .update({ views: (row.views || 0) + 1 })
      .eq("id", id);
  }
}

export async function uploadImage(file, userId = "demo") {
  if (!supabaseEnabled) {
    return URL.createObjectURL(file);
  }
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("invitation-media")
    .upload(path, file, { upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("invitation-media").getPublicUrl(path);
  return data.publicUrl;
}
