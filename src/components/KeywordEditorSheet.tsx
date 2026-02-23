import { useState, useEffect } from "react";
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
type TemplateOption = "Template 1" | "Template 2" | "Template 3";

interface KeywordEditorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
}

const MOCK_EDIT_KEYWORDS = ["test", "hello", "歡迎"];

const KeywordEditorSheet = ({ open, onOpenChange, mode }: KeywordEditorSheetProps) => {
  const [type, setType] = useState<MessageType>("Text");
  const [keywords, setKeywords] = useState<string[]>(mode === "edit" ? MOCK_EDIT_KEYWORDS : []);
  const [removeTags, setRemoveTags] = useState<string[]>([]);
  const [addTags, setAddTags] = useState<string[]>([]);
  const [template, setTemplate] = useState<TemplateOption>("Template 1");
  const [textContent, setTextContent] = useState("");

  // Reset keywords when mode changes
  useEffect(() => {
    setKeywords(mode === "edit" ? MOCK_EDIT_KEYWORDS : []);
    setAddTags([]);
    setRemoveTags([]);
  }, [mode, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-[68vw] w-[68vw] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-3">
          <div className="flex items-center justify-between">
            <SheetTitle>{mode === "create" ? "新增關鍵觸發" : "編輯關鍵觸發"}</SheetTitle>
            <Select value={template} onValueChange={(v) => setTemplate(v as TemplateOption)}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="選擇模版" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Template 1">Template 1</SelectItem>
                <SelectItem value="Template 2">Template 2</SelectItem>
                <SelectItem value="Template 3">Template 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                <TagInput tags={keywords} onChange={setKeywords} placeholder="輸入關鍵字..." variant="keyword" />
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
            <div className="flex-1 flex gap-4 min-h-0">
              {/* Left: textarea */}
              <div className="flex-1 flex flex-col min-w-0">
                <label className="text-xs text-muted-foreground mb-1">訊息內容</label>
                <textarea
                  className="flex-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="輸入文字訊息..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                />
              </div>
              {/* Right: LINE-style preview */}
              <div className="w-[280px] shrink-0 overflow-auto bg-[hsl(var(--muted)/0.3)] rounded-lg p-3 flex flex-col">
                <h3 className="text-xs font-semibold mb-2 text-muted-foreground">預覽</h3>
                <div className="flex-1 flex flex-col bg-[#7494C0] rounded-xl p-4 min-h-[200px]">
                  <div className="flex-1" />
                  {textContent && (
                    <div className="flex justify-start">
                      <div className="bg-white text-foreground rounded-2xl rounded-tl-sm px-3 py-2 text-sm max-w-[85%] shadow-sm whitespace-pre-wrap break-words">
                        {textContent}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <FlexMessageEditor template={template} />
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
