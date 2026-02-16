import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type MessageType = "Text" | "Carousel" | "Bubble";

interface KeywordEntry {
  id: number;
  keyword: string;
  type: MessageType;
}

const mockData: KeywordEntry[] = [
  { id: 1, keyword: "test", type: "Text" },
  { id: 2, keyword: "測試", type: "Text" },
  { id: 3, keyword: "Vin", type: "Carousel" },
  { id: 4, keyword: "Derek", type: "Bubble" },
  { id: 5, keyword: "test sticker", type: "Text" },
  { id: 6, keyword: "hello world", type: "Carousel" },
  { id: 7, keyword: "歡迎光臨", type: "Bubble" },
];

const typeLabels: Record<MessageType, string> = {
  Text: "文字",
  Carousel: "FLEX",
  Bubble: "FLEX",
};

const KeywordTable = () => {
  return (
    <div className="flex-1 overflow-auto p-6">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>關鍵字</TableHead>
            <TableHead className="w-32">類別</TableHead>
            <TableHead className="w-36 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockData.map((entry) => {
            const label = typeLabels[entry.type];
            return (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.keyword}</TableCell>
                <TableCell>
                  <Badge className={label === "文字" 
                    ? "bg-[hsl(var(--badge-text-bg))] text-[hsl(var(--badge-text-fg))] hover:bg-[hsl(var(--badge-text-bg))]" 
                    : "bg-[hsl(var(--badge-flex-bg))] text-[hsl(var(--badge-flex-fg))] hover:bg-[hsl(var(--badge-flex-bg))]"
                  }>{label}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      className="rounded-md p-1.5 text-preview-icon transition-colors hover:bg-accent"
                      title="預覽"
                    >
                      <Eye size={17} />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-edit-icon transition-colors hover:bg-accent"
                      title="編輯"
                    >
                      <Pencil size={17} />
                    </button>
                    <button
                      className="rounded-md p-1.5 text-delete-icon transition-colors hover:bg-accent"
                      title="刪除"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default KeywordTable;
