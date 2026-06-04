"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import { deleteQuizAction } from "@/lib/actions/quiz";

type Props = {
  quizId: string;
  quizTitle: string;
  triggerLabel?: string;
  triggerClassName?: string;
};

/**
 * Pour éviter la suppression accidentelle d'un quizz potentiellement long à
 * recréer, on demande à l'utilisateur de retaper le titre du quizz avant
 * d'activer le bouton "Supprimer".
 */
export function DeleteQuizButton({
  quizId,
  quizTitle,
  triggerLabel = "Supprimer",
  triggerClassName,
}: Props) {
  const [typedTitle, setTypedTitle] = useState("");
  const [open, setOpen] = useState(false);
  const canDelete = typedTitle.trim() === quizTitle.trim();

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTypedTitle("");
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={
            triggerClassName ??
            "text-destructive hover:text-destructive hover:bg-destructive/10"
          }
        >
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer ce quizz ?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Tu vas supprimer définitivement le quizz «&nbsp;
                <strong>{quizTitle}</strong>&nbsp;» :{" "}
                <span className="text-destructive font-medium">
                  toutes ses questions et participations
                </span>{" "}
                seront perdues.
              </p>
              <p>
                Pour confirmer, retape le titre du quizz exactement comme
                affiché :
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 pt-2">
          <Label htmlFor="confirmTitle" className="sr-only">
            Titre du quizz
          </Label>
          <Input
            id="confirmTitle"
            type="text"
            value={typedTitle}
            onChange={(e) => setTypedTitle(e.target.value)}
            placeholder={quizTitle}
            autoFocus
          />
          {typedTitle && !canDelete && (
            <p className="text-xs text-muted-foreground">
              Le titre ne correspond pas exactement.
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <form action={deleteQuizAction}>
            <input type="hidden" name="quizId" value={quizId} />
            <AlertDialogAction
              type="submit"
              disabled={!canDelete}
              className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
