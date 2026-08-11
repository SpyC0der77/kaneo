import { useState } from "react";
import type { ProjectWithTasks } from "@/types/project";
import { ColumnDropzone } from "./column-dropzone";
import { ColumnHeader } from "./column-header";

type ColumnProps = {
  column: ProjectWithTasks["columns"][number];
  disableDragDrop?: boolean;
};

function Column({ column, disableDragDrop = false }: ColumnProps) {
  const [isDropzoneOver, setIsDropzoneOver] = useState(false);

  return (
    <div
      className={`group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md transition-colors duration-150 ${
        isDropzoneOver ? "bg-accent/50 ring-1 ring-ring/30" : "bg-container"
      }`}
    >
      <div className="h-[50px] shrink-0 px-3">
        <ColumnHeader column={column} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 [-webkit-overflow-scrolling:touch]">
        <ColumnDropzone
          column={column}
          disableDragDrop={disableDragDrop}
          onIsOverChange={setIsDropzoneOver}
        />
      </div>
    </div>
  );
}

export default Column;
