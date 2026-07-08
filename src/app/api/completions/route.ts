import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscribed } from "@/lib/activities";
import { todayKey } from "@/lib/dates";

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
  const [user, child, activity] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.child.findFirst({ where: { id: childId, userId: session.user.id } }),
    prisma.activity.findUnique({ where: { id: activityId } }),
  ]);
  if (!user || !child) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }
  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  if (activity.isPremium && !isSubscribed(user)) {
    return NextResponse.json(
      { error: "This is a Premium activity. Upgrade to log it." },
      { status: 403 }
    );
  }

  const today = todayKey();
  const existing = await prisma.activityCompletion.findUnique({
    where: {
      childId_activityId_completedOn: { childId, activityId, completedOn: today },
    },
  });

  try {
    if (existing) {
      await prisma.activityCompletion.delete({ where: { id: existing.id } });
      return NextResponse.json({ completed: false });
    }
    await prisma.activityCompletion.create({
      data: { userId: session.user.id, childId, activityId, completedOn: today },
    });
    return NextResponse.json({ completed: true });
  } catch (err) {
    // Double-click races: unique violation on create -> already completed;
    // record-not-found on delete -> already un-completed. Both are benign.
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") return NextResponse.json({ completed: true });
      if (err.code === "P2025") return NextResponse.json({ completed: false });
    }
    console.error("completions: toggle failed", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
