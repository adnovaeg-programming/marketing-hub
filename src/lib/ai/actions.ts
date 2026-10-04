"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getWorkspaceContext } from "@/lib/permissions/server";

type Result<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createAIConversationAction(
  mode: "content" | "ads" | "strategy" | "general" = "general"
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ai_conversations")
      .insert({
        user_id: ctx.userId,
        workspace_id: ctx.workspaceId,
        title: "New conversation",
        mode,
      })
      .select("id")
      .single();

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/ai");
    return { success: true, data: data.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function sendAIMessageAction(
  conversationId: string,
  content: string
): Promise<Result<string>> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    if (!content.trim()) return { success: false, error: "empty_message" };

    const supabase = await createClient();

    // نسجّل رسالة المستخدم
    const { error: userMsgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        role: "user",
        content: content.trim(),
      });

    if (userMsgError) return { success: false, error: userMsgError.message };

    // ⚠️ هنا في الإنتاج هنستدعي OpenAI/Anthropic API
    // دلوقتي بنحاكي الرد
    const apiKey = process.env.OPENAI_API_KEY;

    let aiResponse: string;
    if (!apiKey) {
      aiResponse = `مرحبًا! أنا المساعد الذكي لـ One Post.

⚠️ مفتاح OpenAI مش مضبوط بعد في \`.env.local\`.

عشان تفعّل المساعد، ضيف:
\`\`\`
OPENAI_API_KEY=sk-xxxxx
\`\`\`

بعد كده هتقدر تسألني أي حاجة عن المحتوى، الإعلانات، أو الاستراتيجية التسويقية.`;
    } else {
      // TODO: call OpenAI API
      aiResponse = `(الرد المحاكى) ${content}`;
    }

    // نسجّل رد المساعد
    const { error: aiMsgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        role: "assistant",
        content: aiResponse,
      });

    if (aiMsgError) return { success: false, error: aiMsgError.message };

    // نحدّث آخر تعديل
    await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    revalidatePath(`/dashboard/ai`);
    return { success: true, data: aiResponse };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}

export async function deleteAIConversationAction(
  conversationId: string
): Promise<Result> {
  try {
    const ctx = await getWorkspaceContext();
    if (!ctx) return { success: false, error: "not_authenticated" };

    const supabase = await createClient();
    const { error } = await supabase
      .from("ai_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", ctx.userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/ai");
    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}