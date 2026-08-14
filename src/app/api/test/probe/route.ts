import { NextResponse } from "next/server";
import { findOwnedGame, findOwnedQuestion } from "@/lib/admin-access";
import { getOptionalSession } from "@/lib/auth-guards";
import { findPlayerMembership } from "@/lib/player-access";
import { isE2ETestModeEnabled } from "@/lib/test-mode";

function notFoundResponse() {
  return NextResponse.json({ error: "Not found." }, { status: 404 });
}

export async function POST(request: Request) {
  if (!isE2ETestModeEnabled()) {
    return notFoundResponse();
  }

  const session = await getOptionalSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as
    | { intent: "admin-game"; gameId: string }
    | { intent: "admin-question"; questionId: string }
    | { intent: "player-membership"; gameId: string };

  try {
    switch (body.intent) {
      case "admin-game": {
        if (session.role !== "ADMIN" || !session.databaseUserId) {
          return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        await findOwnedGame(body.gameId, session.databaseUserId);
        return NextResponse.json({ ok: true });
      }
      case "admin-question": {
        if (session.role !== "ADMIN" || !session.databaseUserId) {
          return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        await findOwnedQuestion(body.questionId, session.databaseUserId);
        return NextResponse.json({ ok: true });
      }
      case "player-membership": {
        if (session.role !== "PLAYER" || !session.databaseUserId) {
          return NextResponse.json({ error: "Forbidden." }, { status: 403 });
        }

        await findPlayerMembership(body.gameId, session.databaseUserId);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
  } catch {
    return notFoundResponse();
  }
}
