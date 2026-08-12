import { CheckCircle2, Circle } from "lucide-react";
import columnIcons, {
  DEFAULT_COLUMN_ICON_NAMES,
} from "@/constants/column-icons";

const DEFAULT_STATUS_COLORS: Record<string, string> = {
  "to-do": "#8a8f98",
  todo: "#8a8f98",
  backlog: "#8a8f98",
  "in-progress": "#f2c94c",
  "in progress": "#f2c94c",
  started: "#f2c94c",
  "in-review": "#4cb782",
  "in review": "#4cb782",
  review: "#4cb782",
  done: "#5e6ad2",
  completed: "#5e6ad2",
  canceled: "#eb5757",
  cancelled: "#eb5757",
};

export function getColumnAccentColor(
  slugOrId: string,
  color?: string | null,
  isFinal?: boolean,
) {
  if (color) return color;
  const key = slugOrId.toLowerCase();
  if (DEFAULT_STATUS_COLORS[key]) return DEFAULT_STATUS_COLORS[key];
  if (isFinal) return DEFAULT_STATUS_COLORS.done;
  return "#8a8f98";
}

export const getColumnIcon = (
  columnId: string,
  isFinal?: boolean,
  iconName?: string | null,
) => {
  const resolvedIconName =
    iconName ||
    DEFAULT_COLUMN_ICON_NAMES[
      columnId as keyof typeof DEFAULT_COLUMN_ICON_NAMES
    ];
  const Icon =
    resolvedIconName &&
    columnIcons[resolvedIconName as keyof typeof columnIcons];

  if (Icon) {
    return <Icon className="w-4 h-4 text-muted-foreground" />;
  }

  return isFinal ? (
    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
  ) : (
    <Circle className="w-4 h-4 text-muted-foreground" />
  );
};
