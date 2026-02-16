import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TagInput from "@/components/TagInput";
import FlexMessageEditor from "@/components/FlexMessageEditor";

type MessageType = "Text" | "Flex";

interface KeywordEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
}

const KeywordEditorSheet = ({ open, onOpenChange, mode }: KeywordEditorSheetProps) => {
  const [type, setType] = useState<MessageType>("Text");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [removeTags, setRemoveTags] = useState<string[]>([]);
  const [addTags, setAddTags] = useState<string[]>([]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[68vw] w-[68vw] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-3">
          <SheetTitle>{mode === "create" ? "新增關鍵字訊息" : "編輯關鍵字訊息"}</SheetTitle>
        </SheetHeader>

        {/* Compact fields area */}
        <div className="px-6 pb-3">
          <div className="flex items-start gap-6">
            {/* Left: Category + Keywords */}
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">訊息類型</label>
                <Select value={type} onValueChange={(v) => setType(v as MessageType)}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text">文字</SelectItem>
                    <SelectItem value="Flex">FLEX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  觸發關鍵字（Enter 或逗號新增）
                </label>
                <TagInput tags={keywords} onChange={setKeywords} placeholder="輸入關鍵字..." />
              </div>
            </div>

            {/* Right: Tag management */}
            <div className="flex-1 space-y-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">觸發時加入標籤</label>
                <TagInput tags={addTags} onChange={setAddTags} placeholder="輸入標籤..." />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">觸發時移除標籤</label>
                <TagInput tags={removeTags} onChange={setRemoveTags} placeholder="輸入標籤..." />
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Message Editor */}
        <div className="flex-1 overflow-hidden flex flex-col px-6 py-3 min-h-0">
          {type === "Text" ? (
            <div className="flex-1 flex flex-col">
              <label className="text-xs text-muted-foreground mb-1">訊息內容</label>
              <textarea
                className="flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="輸入文字訊息..."
              />
            </div>
          ) : (
            <FlexMessageEditor />
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 pb-6 pt-3 border-t border-border flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button>
            {mode === "create" ? "新增" : "儲存"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default KeywordEditorSheet;
