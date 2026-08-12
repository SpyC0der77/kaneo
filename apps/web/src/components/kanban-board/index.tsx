import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  type DropAnimation,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { produce } from "immer";
import { useEffect, useState } from "react";
import { useUpdateTask } from "@/hooks/mutations/task/use-update-task";
import { useRegisterShortcuts } from "@/hooks/use-keyboard-shortcuts";
import useBulkSelectionStore from "@/store/bulk-selection";
import useProjectStore from "@/store/project";
import type { ProjectWithTasks } from "@/types/project";
import BulkToolbar from "../bulk-selection/bulk-toolbar";
import Column from "./column";
import TaskCard from "./task-card";

type KanbanBoardProps = {
  project: ProjectWithTasks;
  disableDragDrop?: boolean;
};

function KanbanBoard({ project, disableDragDrop = false }: KanbanBoardProps) {
  const queryClient = useQueryClient();
  const { setProject } = useProjectStore();
  const {
    setAvailableTasks,
    focusNext,
    focusPrevious,
    focusedTaskId,
    clearFocus,
  } = useBulkSelectionStore();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const { mutate: updateTask } = useUpdateTask();
  const navigate = useNavigate();

  useEffect(() => {
    if (project?.columns) {
      const allTaskIds = project.columns.flatMap((column) =>
        column.tasks.map((task) => task.id),
      );
      setAvailableTasks(allTaskIds);
    }
  }, [project, setAvailableTasks]);

  useEffect(() => {
    clearFocus();
  }, [clearFocus]);

  useRegisterShortcuts({
    shortcuts: {
      j: () => {
        focusNext();
        const state = useBulkSelectionStore.getState();
        if (state.focusedTaskId) {
          navigate({ to: ".", search: { taskId: state.focusedTaskId } });
        }
      },
      k: () => {
        focusPrevious();
        const state = useBulkSelectionStore.getState();
        if (state.focusedTaskId) {
          navigate({ to: ".", search: { taskId: state.focusedTaskId } });
        }
      },
      Enter: () => {
        if (focusedTaskId && project) {
          navigate({
            to: "/dashboard/workspace/$workspaceId/project/$projectId/task/$taskId",
            params: {
              workspaceId: project.workspaceId,
              projectId: project.id,
              taskId: focusedTaskId,
            },
          });
        }
      },
    },
  });

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: disableDragDrop ? 999999 : 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: disableDragDrop ? 999999 : 250,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.8",
        },
      },
    }),
    duration: 300,
    easing: "cubic-bezier(0.23, 1, 0.32, 1)",
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !project?.columns) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const updatedProject = produce(project, (draft) => {
      const sourceColumn = draft?.columns?.find((col) =>
        col.tasks.some((task) => task.id === activeId),
      );
      const destinationColumn = draft?.columns?.find(
        (col) =>
          col.id === overId || col.tasks.some((task) => task.id === overId),
      );

      if (!sourceColumn || !destinationColumn) return;

      const sourceTaskIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId,
      );
      const task = sourceColumn.tasks[sourceTaskIndex];

      sourceColumn.tasks = sourceColumn.tasks.filter((t) => t.id !== activeId);

      if (sourceColumn.id === destinationColumn.id) {
        let destinationIndex = destinationColumn.tasks.findIndex(
          (t) => t.id === overId,
        );
        if (sourceTaskIndex <= destinationIndex) {
          destinationIndex += 1;
        }
        destinationColumn.tasks.splice(destinationIndex, 0, task);

        destinationColumn.tasks.forEach((t, index) => {
          updateTask({ ...t, position: index });
        });

        queryClient.invalidateQueries({
          queryKey: ["projects", project.workspaceId],
        });
      } else {
        task.status = destinationColumn.id;
        const destinationIndex =
          overId === destinationColumn.id
            ? destinationColumn.tasks.length
            : destinationColumn.tasks.findIndex((t) => t.id === overId) + 1;

        destinationColumn.tasks.splice(destinationIndex, 0, task);

        destinationColumn.tasks.forEach((t, index) => {
          updateTask({ ...t, status: destinationColumn.id, position: index });
        });

        sourceColumn.tasks.forEach((t, index) => {
          updateTask({ ...t, position: index });
        });
      }
    });

    setProject(updatedProject);
    setActiveId(null);
  };

  if (!project?.columns) {
    return (
      <div className="flex h-full w-full flex-col bg-container">
        <header className="mb-6 mt-6 shrink-0 space-y-6 px-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted/50" />
          </div>
        </header>

        <div className="relative min-h-0 flex-1">
          <div className="flex h-full flex-1 gap-3 overflow-x-auto px-4 pb-4 md:px-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={`kanban-column-skeleton-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: It's a skeleton
                  i
                }`}
                className="h-full w-[348px] min-w-[348px] max-w-[348px] shrink-0 rounded-md bg-container"
              >
                <div className="flex h-[50px] items-center justify-between px-3">
                  <div className="h-5 w-24 animate-pulse rounded bg-muted/50" />
                  <div className="h-5 w-8 animate-pulse rounded bg-muted/50" />
                </div>

                <div className="flex flex-1 flex-col gap-2 px-2 pb-4">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={`kanban-task-skeleton-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: It's a skeleton
                        j
                      }`}
                      className="animate-pulse rounded-md border border-border/50 bg-background p-3"
                    >
                      <div className="space-y-3">
                        <div className="w-2/3 h-4 bg-muted/70 rounded" />
                        <div className="w-1/2 h-3 bg-muted/70 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeTask = activeId
    ? project.columns
        .flatMap((col) => col.tasks)
        .find((task) => task.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full w-full flex-col bg-container">
        <div className="min-h-0 flex-1 overflow-x-auto [-webkit-overflow-scrolling:touch]">
          <div className="flex h-full min-w-max gap-3 px-4 py-3 md:px-5">
            {project.columns?.map((column) => (
              <div
                key={column.id}
                className="h-full w-[348px] max-w-[348px] min-w-[348px] shrink-0"
              >
                <Column column={column} disableDragDrop={disableDragDrop} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="w-[348px] shadow-md">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>

      <BulkToolbar />
    </DndContext>
  );
}

export default KanbanBoard;
