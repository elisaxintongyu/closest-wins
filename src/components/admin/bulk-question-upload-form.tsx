"use client";

// Renders the admin form for bulk-uploading question spreadsheets.

import { useActionState } from "react";
import { bulkUploadQuestions } from "@/app/admin/actions";
import { FieldErrors, FormMessage } from "@/components/admin/form-feedback";
import { SubmitButton } from "@/components/admin/submit-button";
import { initialActionState } from "@/lib/admin-validation";

export function BulkQuestionUploadForm({ gameId }: { gameId: string }) {
  const bulkUploadQuestionsForGame = bulkUploadQuestions.bind(null, gameId);
  const [state, formAction] = useActionState(
    bulkUploadQuestionsForGame,
    initialActionState
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="question-file"
          className="text-sm font-medium text-stone-900"
        >
          Excel file
        </label>
        <input
          id="question-file"
          name="questionFile"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
        />
        <FieldErrors state={state} field="questionFile" />
      </div>

      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-3 text-sm leading-7 text-stone-700">
        Use the first sheet with these column headers:{" "}
        <span className="font-semibold">prompt</span>,{" "}
        <span className="font-semibold">correct answer</span>, and{" "}
        <span className="font-semibold">explanation</span>.
      </div>

      <FormMessage state={state} />

      <SubmitButton
        pendingLabel="Uploading questions..."
        className="min-h-11 w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:w-auto"
        style={{ color: "#fff" }}
      >
        Upload spreadsheet
      </SubmitButton>
    </form>
  );
}
