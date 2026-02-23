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
  ChevronUp,
  ChevronDown,
  Upload,
  ArrowRightLeft,
  ArrowDownUp,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SectionName = "Header" | "Hero" | "Body" | "Footer";
type ElementType = "text" | "button" | "image" | "separator" | "box";
type BoxDirection = "horizontal" | "vertical";
type BoxChildType = "text" | "image" | "separator";

interface FlexElement {
  id: string;
  type: ElementType;
  content: string;
  // Box-specific
  direction?: BoxDirection;
  children?: FlexElement[];
}

const ELEMENT_BUTTONS: { type: ElementType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "button", label: "Button", icon: MousePointer },
  { type: "image", label: "Image", icon: Image },
  { type: "separator", label: "Separator", icon: Minus },
  { type: "box", label: "Box", icon: Square },
];

const BOX_CHILD_BUTTONS: { type: BoxChildType; label: string; icon: React.ElementType }[] = [
  { type: "text", label: "Text", icon: Type },
  { type: "image", label: "Image", icon: Image },
  { type: "separator", label: "Sep", icon: Minus },
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
      box: "",
    };
    const el: FlexElement = {
      id: genId(),
      type,
      content: defaults[type],
      ...(type === "box" ? { direction: "vertical" as BoxDirection, children: [] } : {}),
    };
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

  // Box child operations
  const addBoxChild = (boxId: string, type: BoxChildType) => {
    const defaults: Record<BoxChildType, string> = { text: "Text", image: "", separator: "" };
    const child: FlexElement = { id: genId(), type, content: defaults[type] };
    updateSection(
      currentElements.map((e) =>
        e.id === boxId ? { ...e, children: [...(e.children || []), child] } : e
      )
    );
  };

  const removeBoxChild = (boxId: string, childId: string) => {
    updateSection(
      currentElements.map((e) =>
        e.id === boxId ? { ...e, children: (e.children || []).filter((c) => c.id !== childId) } : e
      )
    );
  };

  const updateBoxChild = (boxId: string, childId: string, patch: Partial<FlexElement>) => {
    updateSection(
      currentElements.map((e) =>
        e.id === boxId
          ? { ...e, children: (e.children || []).map((c) => (c.id === childId ? { ...c, ...patch } : c)) }
          : e
      )
    );
  };

  const moveBoxChild = (boxId: string, childId: string, dir: -1 | 1) => {
    updateSection(
      currentElements.map((e) => {
        if (e.id !== boxId) return e;
        const kids = [...(e.children || [])];
        const idx = kids.findIndex((c) => c.id === childId);
        const newIdx = idx + dir;
        if (idx < 0 || newIdx < 0 || newIdx >= kids.length) return e;
        [kids[idx], kids[newIdx]] = [kids[newIdx], kids[idx]];
        return { ...e, children: kids };
      })
    );
  };

  const toggleBoxDirection = (boxId: string) => {
    updateSection(
      currentElements.map((e) =>
        e.id === boxId
          ? { ...e, direction: e.direction === "horizontal" ? "vertical" : "horizontal" }
          : e
      )
    );
  };

  const handleFileUpload = (id: string, file: File, boxId?: string) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (boxId) {
        updateBoxChild(boxId, id, { content: url });
      } else {
        updateElement(id, { content: url });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (id: string, e: React.DragEvent, boxId?: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFileUpload(id, file, boxId);
  };

  // Render image editor (reusable for top-level and box children)
  const renderImageEditor = (el: FlexElement, boxId?: string) => (
    <div className="space-y-1.5">
      <Input
        value={el.content}
        onChange={(e) =>
          boxId ? updateBoxChild(boxId, el.id, { content: e.target.value }) : updateElement(el.id, { content: e.target.value })
        }
        placeholder="貼上圖片網址..."
        className="h-7 text-xs"
      />
      <div
        onDrop={(e) => handleDrop(el.id, e, boxId)}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => {
          setUploadingId(el.id);
          fileInputRef.current?.click();
        }}
        className="border border-dashed border-border rounded p-2 text-center cursor-pointer hover:bg-muted/30 transition-colors"
      >
        <Upload size={12} className="mx-auto mb-0.5 text-muted-foreground" />
        <p className="text-[10px] text-muted-foreground">拖放或點擊上傳</p>
      </div>
    </div>
  );

  // Render a box child row
  const renderBoxChildRow = (child: FlexElement, boxId: string, idx: number, total: number) => (
    <div
      key={child.id}
      className="flex items-start gap-1.5 rounded border border-border/60 p-1.5 bg-background group/child"
    >
      <div className="flex flex-col items-center shrink-0">
        <button
          onClick={() => moveBoxChild(boxId, child.id, -1)}
          disabled={idx === 0}
          className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
        >
          <ChevronUp size={10} />
        </button>
        <button
          onClick={() => moveBoxChild(boxId, child.id, 1)}
          disabled={idx === total - 1}
          className="text-muted-foreground hover:text-foreground disabled:opacity-20 p-0.5"
        >
          <ChevronDown size={10} />
        </button>
      </div>
      <Badge className={`shrink-0 text-[9px] px-1 py-0 mt-0.5 ${TYPE_COLORS[child.type]}`}>
        {child.type}
      </Badge>
      <div className="flex-1 min-w-0">
        {child.type === "image" ? (
          renderImageEditor(child, boxId)
        ) : child.type === "separator" ? (
          <hr className="border-border mt-1.5" />
        ) : editingId === child.id ? (
          <Input
            autoFocus
            value={child.content}
            onChange={(e) => updateBoxChild(boxId, child.id, { content: e.target.value })}
            onBlur={() => setEditingId(null)}
            onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
            className="h-6 text-xs"
          />
        ) : (
          <span
            className="text-xs truncate block pt-0.5 cursor-pointer"
            onClick={() => setEditingId(child.id)}
          >
            {child.content}
          </span>
        )}
      </div>
      <button
        onClick={() => removeBoxChild(boxId, child.id)}
        className="p-0.5 text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover/child:opacity-100 transition-opacity"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );

  // Preview renderer
  const renderPreviewElement = (el: FlexElement): React.ReactNode => {
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
          <div
            className={`border border-border rounded p-2 gap-2 ${
              el.direction === "horizontal" ? "flex flex-row items-center" : "flex flex-col"
            }`}
          >
            {(el.children || []).length === 0 ? (
              <span className="text-[10px] text-muted-foreground">Box</span>
            ) : (
              (el.children || []).map((child) => (
                <div key={child.id} className={el.direction === "horizontal" ? "flex-1 min-w-0" : ""}>
                  {renderPreviewElement(child)}
                </div>
              ))
            )}
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
                {el.type === "box" ? (
                  <div className="space-y-2">
                    {/* Box direction toggle + add child buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => toggleBoxDirection(el.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          el.direction === "horizontal"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                        title="切換排列方向"
                      >
                        <ArrowRightLeft size={11} />
                        橫向
                      </button>
                      <button
                        onClick={() => toggleBoxDirection(el.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-colors ${
                          el.direction === "vertical"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50"
                        }`}
                        title="切換排列方向"
                      >
                        <ArrowDownUp size={11} />
                        直向
                      </button>
                      <span className="text-muted-foreground text-[10px] mx-0.5">│</span>
                      {BOX_CHILD_BUTTONS.map((cb) => (
                        <button
                          key={cb.type}
                          onClick={() => addBoxChild(el.id, cb.type)}
                          className="flex items-center gap-0.5 px-1.5 py-1 rounded text-[11px] text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-dashed border-border transition-colors"
                          title={`新增 ${cb.label}`}
                        >
                          <Plus size={10} />
                          <cb.icon size={10} />
                        </button>
                      ))}
                    </div>
                    {/* Box children */}
                    <div className="space-y-1.5 pl-1 border-l-2 border-amber-300/40">
                      {(el.children || []).length === 0 && (
                        <p className="text-[10px] text-muted-foreground py-2 text-center">
                          點擊上方 + 新增子元件
                        </p>
                      )}
                      {(el.children || []).map((child, ci) =>
                        renderBoxChildRow(child, el.id, ci, (el.children || []).length)
                      )}
                    </div>
                  </div>
                ) : el.type === "image" ? (
                  renderImageEditor(el)
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
                {el.type !== "separator" && el.type !== "image" && el.type !== "box" && (
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
            if (file && uploadingId) {
              // Check if uploadingId belongs to a box child
              const parentBox = currentElements.find(
                (el) => el.type === "box" && (el.children || []).some((c) => c.id === uploadingId)
              );
              if (parentBox) {
                handleFileUpload(uploadingId, file, parentBox.id);
              } else {
                handleFileUpload(uploadingId, file);
              }
            }
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
