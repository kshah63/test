import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const childSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  birthDate: z.coerce.date().refine((d) => d <= new Date(), {
    message: "Birth date can't be in the future",
  }),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ children });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = childSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  // Free plan includes one child profile; Premium is unlimited.
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const subscribed =
    user?.subscriptionStatus === "active" || user?.subscriptionStatus === "past_due";
  if (!subscribed) {
    const count = await prisma.child.count({ where: { userId: session.user.id } });
    if (count >= 1) {
      return NextResponse.json(
        { error: "The free plan includes one child profile. Upgrade to Premium to add more." },
        { status: 403 }
      );
    }
  }

  const child = await prisma.child.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name.trim(),
      birthDate: parsed.data.birthDate,
    },
  });
  return NextResponse.json({ child }, { status: 201 });
}
