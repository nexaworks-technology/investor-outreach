"use server";
import { db } from "@/lib/db";
import { getAuthUser } from "./auth";
import { revalidatePath } from "next/cache";

export async function getWorkspaceSettings() {
  const user = await getAuthUser();
  const settings = await db.workspaceSettings.upsert({
    where: { workspaceId: user.workspaceId },
    update: {},
    create: { workspaceId: user.workspaceId }
  });
  return settings;
}

export async function updateSendingLimits(data: { dailySendLimit: number; sendOnWeekends: boolean; sendWindowStart: string; sendWindowEnd: string }) {
  const user = await getAuthUser();
  await db.workspaceSettings.upsert({
    where: { workspaceId: user.workspaceId },
    update: {
      dailySendLimit: data.dailySendLimit,
      sendOnWeekends: data.sendOnWeekends,
      sendWindowStart: data.sendWindowStart,
      sendWindowEnd: data.sendWindowEnd
    },
    create: {
      workspaceId: user.workspaceId,
      dailySendLimit: data.dailySendLimit,
      sendOnWeekends: data.sendOnWeekends,
      sendWindowStart: data.sendWindowStart,
      sendWindowEnd: data.sendWindowEnd
    }
  });
  revalidatePath("/settings");
  return { success: true };
}
