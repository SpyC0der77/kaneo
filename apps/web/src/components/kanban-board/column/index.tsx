import { useState } from "react";
import { getColumnAccentColor } from "@/lib/column";
import type { ProjectWithTasks } from "@/types/project";
import { ColumnDropzone } from "./column-dropzone";
import { ColumnHeader } from "./column-header";

type ColumnProps = {
  column: ProjectWithTasks["columns"][number];
  disableDragDrop?: boolean;
};

function Column({ column, disableDragDrop = false }: ColumnProps) {
  const [isDropzoneOver, setIsDropzoneOver] = useState(false);
  const accent = getColumnAccentColor(
    column.slug ?? column.id,
    column.color,
    column.isFinal,
  );

  return (
    <div
      className={`group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md transition-colors duration-150 ${
        isDropzoneOver ? "bg-accent/50 ring-1 ring-ring/30" : "bg-container"
      }`}
    >
      <div
        className="h-[50px] shrink-0 px-3"
        style={{ backgroundColor: `${accent}10` }}
      >
        <ColumnHeader column={column} />
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-2 [-webkit-overflow-scrolling:touch]">
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
