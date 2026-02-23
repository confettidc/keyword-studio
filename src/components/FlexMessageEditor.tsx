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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const selectedEl = selectedId ? tmpl.elements.find((e) => e.id === selectedId) : null;

  return (
    <div className="flex flex-1 gap-0 overflow-hidden min-h-0 border border-border rounded-lg">
      {/* Left: Editor */}
      <div className="flex-1 overflow-auto flex flex-col min-w-0 border-r border-border">
        {selectedEl ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{selectedEl.label}</span>
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← 返回
              </button>
            </div>
            {selectedEl.type === "text" ? (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">文字內容</label>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px]"
                  value={getValue(selectedEl)}
                  onChange={(e) => setValue(selectedEl.id, e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">圖片網址</label>
                <Input
                  value={getValue(selectedEl)}
                  onChange={(e) => setValue(selectedEl.id, e.target.value)}
                  placeholder="貼上圖片網址..."
                  className="h-9 text-sm"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-border rounded p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <Upload size={16} className="mx-auto mb-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">點擊上傳圖片</p>
                </div>
                {getValue(selectedEl) && (
                  <img
                    src={getValue(selectedEl)}
                    alt=""
                    className="w-full rounded border border-border object-cover max-h-[150px]"
                  />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground mb-2">點擊右側預覽中的元素進行編輯</p>
            {tmpl.elements.map((el) => (
              <button
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {el.type === "image" ? "IMG" : "TXT"}
                </span>
                <span className="text-xs text-foreground truncate">{el.label}</span>
                <span className="text-xs text-muted-foreground truncate ml-auto max-w-[120px]">
                  {getValue(el) || "—"}
                </span>
              </button>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && selectedId) handleFileUpload(selectedId, file);
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
            const isSelected = selectedId === el.id;

            return (
              <div
                key={el.id}
                onClick={() => setSelectedId(el.id)}
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
