import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

type TemplateOption = "Template 1" | "Template 2" | "Template 3";

interface TemplateElement {
  id: string;
  type: "text" | "image";
  label: string;
  defaultValue: string;
  style?: string; // tailwind classes for preview rendering
}

interface TemplateDefinition {
  elements: TemplateElement[];
}

const TEMPLATES: Record<TemplateOption, TemplateDefinition> = {
  "Template 1": {
    elements: [
      { id: "hero", type: "image", label: "主圖片", defaultValue: "", style: "w-full aspect-[2/1] object-cover" },
      { id: "title", type: "text", label: "標題", defaultValue: "Cony Residence 2", style: "text-base font-bold text-foreground" },
      { id: "subtitle", type: "text", label: "副標題", defaultValue: "3 Bedrooms, ¥35,000", style: "text-sm text-muted-foreground" },
      { id: "desc", type: "text", label: "描述", defaultValue: "Private Pool, Delivery box, Floor heating, Private Cinema", style: "text-xs text-muted-foreground bg-muted/50 rounded p-2" },
    ],
  },
  "Template 2": {
    elements: [
      { id: "hero", type: "image", label: "圖片", defaultValue: "", style: "w-full aspect-[16/9] object-cover" },
      { id: "tag", type: "text", label: "標籤", defaultValue: "NEW", style: "text-xs font-bold text-white bg-destructive rounded-full px-2 py-0.5 inline-block" },
      { id: "title", type: "text", label: "標題", defaultValue: "產品名稱", style: "text-base font-bold text-foreground" },
      { id: "price", type: "text", label: "價格", defaultValue: "¥1,200", style: "text-lg font-bold text-primary" },
      { id: "action", type: "text", label: "按鈕文字", defaultValue: "立即購買", style: "text-sm font-medium text-primary-foreground bg-primary rounded px-4 py-1.5 text-center" },
    ],
  },
  "Template 3": {
    elements: [
      { id: "title", type: "text", label: "標題", defaultValue: "通知訊息", style: "text-base font-bold text-foreground" },
      { id: "body", type: "text", label: "內文", defaultValue: "您的訂單已確認，預計明天送達。", style: "text-sm text-muted-foreground" },
      { id: "divider", type: "text", label: "分隔線文字", defaultValue: "詳細資訊", style: "text-xs text-muted-foreground border-t border-border pt-2" },
      { id: "detail1", type: "text", label: "詳情 1", defaultValue: "訂單編號：#12345", style: "text-xs text-muted-foreground" },
      { id: "detail2", type: "text", label: "詳情 2", defaultValue: "配送方式：宅配", style: "text-xs text-muted-foreground" },
      { id: "action", type: "text", label: "按鈕文字", defaultValue: "查看訂單", style: "text-sm font-medium text-primary-foreground bg-primary rounded px-4 py-1.5 text-center" },
    ],
  },
};

interface FlexMessageEditorProps {
  template: TemplateOption;
}

const FlexMessageEditor = ({ template }: FlexMessageEditorProps) => {
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadId = useRef<string | null>(null);

  const tmpl = TEMPLATES[template];

  const getValue = (el: TemplateElement) => {
    return values[template]?.[el.id] ?? el.defaultValue;
  };

  const setValue = (id: string, val: string) => {
    setValues((prev) => ({
      ...prev,
      [template]: { ...prev[template], [id]: val },
    }));
  };

  const handleFileUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setValue(id, ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-1 gap-0 overflow-hidden min-h-0 border border-border rounded-lg">
      {/* Left: Accordion Editor */}
      <div className="flex-1 overflow-auto flex flex-col min-w-0 border-r border-border bg-muted/30">
        <div className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground mb-1">點擊元素展開編輯</p>
          {tmpl.elements.map((el) => {
            const isExpanded = expandedId === el.id;
            return (
              <div key={el.id} className="rounded-md border border-border overflow-hidden bg-card">
                {/* Row header */}
                <button
                  onClick={() => toggleExpand(el.id)}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2 transition-colors ${
                    isExpanded ? "bg-accent" : "hover:bg-muted/40"
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {el.type === "image" ? "IMG" : "TXT"}
                  </span>
                  <span className="text-xs text-foreground truncate">{el.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{isExpanded ? "▾" : "▸"}</span>
                </button>
                {/* Expanded editor */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-border bg-card">
                    {el.type === "text" ? (
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[70px] mt-1"
                        value={getValue(el)}
                        onChange={(e) => setValue(el.id, e.target.value)}
                      />
                    ) : (
                      <div className="space-y-2 mt-1">
                        <Input
                          value={getValue(el)}
                          onChange={(e) => setValue(el.id, e.target.value)}
                          placeholder="貼上圖片網址..."
                          className="h-8 text-sm"
                        />
                        <div
                          onClick={() => {
                            activeUploadId.current = el.id;
                            fileInputRef.current?.click();
                          }}
                          className="border border-dashed border-border rounded p-3 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                        >
                          <Upload size={14} className="mx-auto mb-0.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">點擊上傳圖片</p>
                        </div>
                        {getValue(el) && (
                          <img
                            src={getValue(el)}
                            alt=""
                            className="w-full rounded border border-border object-cover max-h-[120px]"
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && activeUploadId.current) handleFileUpload(activeUploadId.current, file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Right: Preview */}
      <div className="w-[280px] shrink-0 overflow-auto bg-muted/10 p-3 flex flex-col">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground">預覽</h3>
        <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
          {tmpl.elements.map((el) => {
            const val = getValue(el);
            const isSelected = expandedId === el.id;

            return (
              <div
                key={el.id}
                onClick={() => toggleExpand(el.id)}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "ring-2 ring-primary ring-inset"
                    : "hover:ring-1 hover:ring-primary/40 hover:ring-inset"
                }`}
              >
                {el.type === "image" ? (
                  val ? (
                    <img src={val} alt="" className={el.style || "w-full"} />
                  ) : (
                    <div className={`bg-muted flex items-center justify-center text-xs text-muted-foreground ${el.style?.replace("object-cover", "") || "w-full h-20"}`}>
                      {el.label}
                    </div>
                  )
                ) : (
                  <div className="px-3 py-1.5">
                    <span className={el.style}>{val || el.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlexMessageEditor;
