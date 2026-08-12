import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateQuestionForm } from "@/components/admin/create-question-form";
import { QuestionEditor } from "@/components/admin/question-editor";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function AdminGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const session = await requireRole("ADMIN");

  if (!session.databaseUserId) {
    notFound();
  }

  const game = await prisma.game.findFirst({
    where: {
      id: gameId,
      createdById: session.databaseUserId,
    },
    select: {
      id: true,
      title: true,
      joinCode: true,
      status: true,
      questions: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          prompt: true,
          correctAnswer: true,
          explanation: true,
          order: true,
          status: true,
        },
      },
    },
  });

  if (!game) {
    notFound();
  }

  return (
    <DashboardShell
      eyebrow="Question management"
      title={game.title}
      description="Create, edit, and remove the questions that belong to this game session."
      userName={session.userName}
      roleLabel="Administrator"
      highlights={[
        `Join code: ${game.joinCode}`,
        `Game status: ${game.status}`,
        `${game.questions.length} question${game.questions.length === 1 ? "" : "s"} in this game`,
      ]}
    >
      <div className="space-y-8">
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-900"
        >
          Back to all games
        </Link>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-950">
              Add a question
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              New questions are appended to the bottom of the set and can then
              be moved into place.
            </p>
          </div>

          <CreateQuestionForm gameId={game.id} />
        </section>

        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-stone-950">
              Question list
            </h2>
            <p className="text-sm leading-7 text-stone-700">
              Reorder questions with the move buttons and save edits inline.
            </p>
          </div>

          {game.questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">
              This game has no questions yet.
            </div>
          ) : (
            <div className="space-y-4">
              {game.questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  canMoveUp={index > 0}
                  canMoveDown={index < game.questions.length - 1}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
