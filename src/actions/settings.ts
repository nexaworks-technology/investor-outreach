"use server";
import { db } from "@/lib/db";
import { requireWorkspace } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getWorkspaceSettings() {
  const { workspace } = await requireWorkspace();
  const settings = await db.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    update: {},
    create: { workspaceId: workspace.id }
  });
  return settings;
}

export async function updateSendingLimits(data: { dailySendLimit: number; sendOnWeekends: boolean; sendWindowStart: string; sendWindowEnd: string }) {
  const { workspace } = await requireWorkspace();
  await db.workspaceSettings.upsert({
    where: { workspaceId: workspace.id },
    update: {
      dailySendLimit: data.dailySendLimit,
      sendOnWeekends: data.sendOnWeekends,
      sendWindowStart: data.sendWindowStart,
      sendWindowEnd: data.sendWindowEnd
    },
    create: {
      workspaceId: workspace.id,
      dailySendLimit: data.dailySendLimit,
      sendOnWeekends: data.sendOnWeekends,
      sendWindowStart: data.sendWindowStart,
      sendWindowEnd: data.sendWindowEnd
    }
  });
  revalidatePath("/settings");
  return { success: true };
}
