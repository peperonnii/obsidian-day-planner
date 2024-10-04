import { get, type Readable, type Writable } from "svelte/store";

import type { DayToTasks } from "../../../task-types";
import type { OnUpdateFn } from "../../../types";
import { areValuesEmpty } from "../../../util/task-utils";
import { getDiff, getDiff_v2 } from "../../../util/tasks-utils";

import type { EditOperation } from "./types";

interface UseEditActionsProps {
  baselineTasks: Writable<DayToTasks>;
  editOperation: Writable<EditOperation | undefined>;
  displayedTasks: Readable<DayToTasks>;
  onUpdate: OnUpdateFn;
}

export function useEditActions({
  editOperation,
  baselineTasks,
  displayedTasks,
  onUpdate,
}: UseEditActionsProps) {
  function startEdit(operation: EditOperation) {
    editOperation.set(operation);
  }

  function cancelEdit() {
    editOperation.set(undefined);
  }

  async function confirmEdit() {
    if (get(editOperation) === undefined) {
      return;
    }

    const currentTasks = get(displayedTasks);

    editOperation.set(undefined);

    // todo: diffing can be moved outside to separate concerns
    //  but we need to know if something changed to not cause extra rewrites?
    // todo: push that into onUpdate(baselineTasks, currentTasks)
    const diff = getDiff(get(baselineTasks), currentTasks);
    const oldBase = get(baselineTasks);

    if (areValuesEmpty(diff)) {
      return;
    }

    baselineTasks.set(currentTasks);

    await onUpdate(getDiff_v2(oldBase, currentTasks));
    // await onUpdate({ ...updateText(diff), moved: diff.moved });
  }

  return {
    startEdit,
    confirmEdit,
    cancelEdit,
  };
}
