import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Type,
  MousePointer,
  Image,
  Minus,
  Square,
  Pencil,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SectionName = "Header" | "Hero" | "Body" | "Footer";
type ElementType = "text" | "button" | "image" | "separator" | "box";

interface FlexElement {
  id: string;
  type: ElementType;
  content: string;
  imageUrl?: string;
}

const ELEMENT_BUTTONS: { type: ElementType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "button", label: "Button", icon: MousePointer },
  { type: "image", label: "Image", icon: Image },
  { type: "separator", label: "Separator", icon: Minus },
  { type: "box", label: "Box", icon: Square },
];

const SECTION_ELEMENTS: Record<SectionName, ElementType[]> = {
  Header: ["text", "image", "separator", "box"],
  Hero: ["image"],
  Body: ["text", "image", "separator", "box"],
  Footer: ["text", "image", "separator", "box"],
};

const SECTIONS: SectionName[] = ["Header", "Hero", "Body", "Footer"];

const TYPE_COLORS: Record<ElementType, string> = {
  text: "bg-[hsl(var(--badge-text-bg))] text-[hsl(var(--badge-text-fg))]",
  button: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  image: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  separator: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  box: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

let idCounter = 0;
const genId = () => `el-${++idCounter}`;

const FlexMessageEditor = () => {
  const [activeSection, setActiveSection] = useState<SectionName>("Body");
  const [sections, setSections] = useState<Record<SectionName, FlexElement[]>>({
    Header: [],
    Hero: [],
    Body: [],
    Footer: [],
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const currentElements = sections[activeSection];

  const updateSection = useCallback(
    (elements: FlexElement[]) => {
      setSections((prev) => ({ ...prev, [activeSection]: elements }));
    },
    [activeSection]
  );

  const addElement = (type: ElementType) => {
    const defaults: Record<ElementType, string> = {
      text: "Text",
      button: "Button",
      image: "",
      separator: "",
      box: "Box",
    };
    const el: FlexElement = { id: genId(), type, content: defaults[type] };
    updateSection([...currentElements, el]);
  };

  const removeElement = (id: string) => {
    updateSection(currentElements.filter((e) => e.id !== id));
  };

  const moveElement = (id: string, dir: -1 | 1) => {
    const idx = currentElements.findIndex((e) => e.id === id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= currentElements.length) return;
    const copy = [...currentElements];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    updateSection(copy);
  };

  const updateElement = (id: string, patch: Partial<FlexElement>) => {
    updateSection(currentElements.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const handleFileUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateElement(id, { content: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFileUpload(id, file);
  };

  // Preview renderer
  const renderPreviewElement = (el: FlexElement) => {
    switch (el.type) {
      case "text":
        return <p className="text-sm">{el.content || "Text"}</p>;
      case "button":
        return (
          <button className="px-4 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium">
            {el.content || "Button"}
          </button>
        );
      case "image":
        return el.content ? (
          <img src={el.content} alt="" className="w-full rounded object-cover max-h-[120px]" />
        ) : (
          <div className="w-full h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
            Image
          </div>
        );
      case "separator":
        return <hr className="border-border" />;
      case "box":
        return (
          <div className="border border-border rounded p-2 text-xs text-muted-foreground">
            {el.content || "Box"}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1 gap-0 overflow-hidden min-h-0 border border-border rounded-lg">
      {/* Left: Section sidebar */}
      <div className="w-[80px] shrink-0 border-r border-border bg-muted/20 flex flex-col py-1">
        {SECTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-3 py-2.5 text-xs font-medium text-left transition-colors ${
              activeSection === s
                ? "bg-primary/10 text-primary border-r-2 border-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {s}
            {sections[s].length > 0 && (
              <span className="ml-1 text-[10px] opacity-60">({sections[s].length})</span>
            )}
          </button>
        ))}
      </div>

      {/* Middle: Element editor */}
      <div className="flex-1 overflow-auto flex flex-col min-w-0">
        {/* Element type buttons */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted/10">
          {ELEMENT_BUTTONS.filter((eb) => SECTION_ELEMENTS[activeSection].includes(eb.type)).map((eb) => (
            <Button
              key={eb.type}
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs gap-1"
              onClick={() => addElement(eb.type)}
            >
              <eb.icon size={13} />
              {eb.label}
            </Button>
          ))}
        </div>

        {/* Element rows */}
        <div className="flex-1 overflow-auto px-3 py-2 space-y-2">
          {currentElements.length === 0 && (
            <p className="text-xs text-muted-foreground py-8 text-center">
              點擊上方按鈕新增元件
            </p>
          )}
          {currentElements.map((el, idx) => (
            <div
              key={el.id}
              className="flex items-start gap-2 rounded-md border border-border p-2 bg-background group"
            >
              {/* Move handle */}
              <div className="flex flex-col items-center shrink-0 pt-0.5">
                <button
                  onClick={() => moveElement(el.id, -1)}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  onClick={() => moveElement(el.id, 1)}
                  disabled={idx === currentElements.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {/* Type badge */}
              <Badge className={`shrink-0 text-[10px] px-1.5 py-0.5 mt-0.5 ${TYPE_COLORS[el.type]}`}>
                {el.type}
              </Badge>

              {/* Content area */}
              <div className="flex-1 min-w-0">
                {el.type === "image" ? (
                  <div className="space-y-1.5">
                    <Input
                      value={el.content}
                      onChange={(e) => updateElement(el.id, { content: e.target.value })}
                      placeholder="貼上圖片網址..."
                      className="h-7 text-xs"
                    />
                    <div
                      onDrop={(e) => handleDrop(el.id, e)}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => {
                        setUploadingId(el.id);
                        fileInputRef.current?.click();
                      }}
                      className="border border-dashed border-border rounded p-3 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <Upload size={14} className="mx-auto mb-1 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground">拖放圖片至此或點擊上傳</p>
                    </div>
                  </div>
                ) : el.type === "separator" ? (
                  <hr className="border-border mt-2" />
                ) : editingId === el.id ? (
                  <Input
                    autoFocus
                    value={el.content}
                    onChange={(e) => updateElement(el.id, { content: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    className="h-7 text-xs"
                  />
                ) : (
                  <span className="text-sm truncate block pt-0.5">{el.content}</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {el.type !== "separator" && el.type !== "image" && (
                  <button
                    onClick={() => setEditingId(el.id)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil size={13} />
                  </button>
                )}
                <button
                  onClick={() => removeElement(el.id)}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && uploadingId) handleFileUpload(uploadingId, file);
            e.target.value = "";
          }}
        />
      </div>

      {/* Right: Preview */}
      <div className="w-[280px] shrink-0 overflow-auto border-l border-border bg-muted/10 p-3">
        <h3 className="text-xs font-semibold mb-2 text-muted-foreground">預覽</h3>
        <div className="rounded-lg border border-border bg-background min-h-[200px] overflow-hidden">
          {SECTIONS.map((s) => {
            const els = sections[s];
            if (els.length === 0) return null;
            return (
              <div key={s} className="p-3 space-y-2 border-b border-border last:border-b-0">
                {els.map((el) => (
                  <div key={el.id}>{renderPreviewElement(el)}</div>
                ))}
              </div>
            );
          })}
          {Object.values(sections).every((s) => s.length === 0) && (
            <p className="text-xs text-muted-foreground p-4 text-center">訊息預覽區</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlexMessageEditor;
