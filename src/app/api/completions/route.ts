import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dayKey } from "@/lib/activities";

const toggleSchema = z.object({
  childId: z.string().min(1),
  activityId: z.string().min(1),
});

/** Toggle today's completion for (child, activity). */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { childId, activityId } = parsed.data;

  // The child must belong to the signed-in user.
  const child = await prisma.child.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  const today = dayKey();
  const existing = await prisma.activityCompletion.findUnique({
    where: {
      childId_activityId_completedOn: { childId, activityId, completedOn: today },
    },
  });

  if (existing) {
    await prisma.activityCompletion.delete({ where: { id: existing.id } });
    return NextResponse.json({ completed: false });
  }

  await prisma.activityCompletion.create({
    data: { userId: session.user.id, childId, activityId, completedOn: today },
  });
  return NextResponse.json({ completed: true });
}
