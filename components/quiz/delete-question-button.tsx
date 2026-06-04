"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { deleteQuestionAction } from "@/lib/actions/question";

type Props = {
  quizId: string;
  questionId: string;
  questionPreview: string;
};

export function DeleteQuestionButton({
  quizId,
  questionId,
  questionPreview,
}: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Supprimer la question"
        >
          ✕
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette question ?</AlertDialogTitle>
          <AlertDialogDescription>
            «&nbsp;
            <span className="italic">
              {questionPreview.length > 80
                ? questionPreview.slice(0, 80) + "…"
                : questionPreview}
            </span>
            &nbsp;»
            <br />
            <br />
            Cette action est <strong>irréversible</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={deleteQuestionAction}>
          <input type="hidden" name="quizId" value={quizId} />
          <input type="hidden" name="questionId" value={questionId} />
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="submit"
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Supprimer
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
