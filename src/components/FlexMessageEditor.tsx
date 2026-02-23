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
  Upload,
  ArrowRightLeft,
  ArrowDownUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SectionName = "Header" | "Hero" | "Body" | "Footer";
type ElementType = "text" | "button" | "image" | "separator" | "box";
type BoxDirection = "horizontal" | "vertical";

interface FlexElement {
  id: string;
  type: ElementType;
  content: string;
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

// Deep remove an element by id from a tree
const deepRemove = (elements: FlexElement[], id: string): FlexElement[] =>
  elements
    .filter((e) => e.id !== id)
    .map((e) =>
      e.type === "box" && e.children
        ? { ...e, children: deepRemove(e.children, id) }
        : e
    );

// Deep find
const deepFind = (elements: FlexElement[], id: string): FlexElement | undefined => {
  for (const e of elements) {
    if (e.id === id) return e;
    if (e.type === "box" && e.children) {
      const found = deepFind(e.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

// Insert element at index in a flat list (top level)
const insertAt = (elements: FlexElement[], el: FlexElement, idx: number): FlexElement[] => {
  const copy = [...elements];
  copy.splice(idx, 0, el);
  return copy;
};

// Deep insert into a box's children
const deepInsertIntoBox = (
  elements: FlexElement[],
  boxId: string,
  el: FlexElement,
  idx: number
): FlexElement[] =>
  elements.map((e) => {
    if (e.id === boxId && e.type === "box") {
      const kids = [...(e.children || [])];
      kids.splice(idx, 0, el);
      return { ...e, children: kids };
    }
    if (e.type === "box" && e.children) {
      return { ...e, children: deepInsertIntoBox(e.children, boxId, el, idx) };
    }
    return e;
  });

// Deep update direction
const deepUpdateDirection = (elements: FlexElement[], boxId: string): FlexElement[] =>
  elements.map((e) => {
    if (e.id === boxId && e.type === "box") {
      return { ...e, direction: e.direction === "horizontal" ? "vertical" : "horizontal" };
    }
    if (e.type === "box" && e.children) {
      return { ...e, children: deepUpdateDirection(e.children, boxId) };
    }
    return e;
  });

// Deep update element
const deepUpdate = (elements: FlexElement[], id: string, patch: Partial<FlexElement>): FlexElement[] =>
  elements.map((e) => {
    if (e.id === id) return { ...e, ...patch };
    if (e.type === "box" && e.children) {
      return { ...e, children: deepUpdate(e.children, id, patch) };
    }
    return e;
  });

// Check if targetId is a descendant of sourceId
const isDescendant = (elements: FlexElement[], sourceId: string, targetId: string): boolean => {
  const source = deepFind(elements, sourceId);
  if (!source || source.type !== "box" || !source.children) return false;
  return !!deepFind(source.children, targetId);
};

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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [collapsedBoxes, setCollapsedBoxes] = useState<Set<string>>(new Set());
  const expandedBeforeDragRef = useRef<Set<string>>(new Set());

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
    updateSection(deepRemove(currentElements, id));
  };

  // Collect all box IDs that are NOT collapsed (i.e., expanded)
  const collectExpandedBoxes = (elements: FlexElement[]): Set<string> => {
    const result = new Set<string>();
    for (const e of elements) {
      if (e.type === "box") {
        if (!collapsedBoxes.has(e.id)) result.add(e.id);
        if (e.children) {
          collectExpandedBoxes(e.children).forEach((id) => result.add(id));
        }
      }
    }
    return result;
  };

  // Collect all box IDs
  const collectAllBoxIds = (elements: FlexElement[]): string[] => {
    const ids: string[] = [];
    for (const e of elements) {
      if (e.type === "box") {
        ids.push(e.id);
        if (e.children) ids.push(...collectAllBoxIds(e.children));
      }
    }
    return ids;
  };

  const handleDragStart = (id: string) => {
    setDraggingId(id);
    // Save currently expanded boxes and collapse all
    const expanded = collectExpandedBoxes(currentElements);
    expandedBeforeDragRef.current = expanded;
    const allBoxIds = collectAllBoxIds(currentElements);
    setCollapsedBoxes(new Set(allBoxIds));
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
    // Restore previously expanded boxes
    const wasExpanded = expandedBeforeDragRef.current;
    setCollapsedBoxes((prev) => {
      const next = new Set(prev);
      wasExpanded.forEach((id) => next.delete(id));
      return next;
    });
  };

  const handleDropOnBox = (boxId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetId(null);
    if (!draggingId || draggingId === boxId) return;
    // Prevent dropping a parent into its own child
    if (isDescendant(currentElements, draggingId, boxId)) return;

    const el = deepFind(currentElements, draggingId);
    if (!el) return;
    let updated = deepRemove(currentElements, draggingId);
    updated = deepInsertIntoBox(updated, boxId, el, 999);
    updateSection(updated);
    // Auto-expand the target box
    setCollapsedBoxes((prev) => {
      const next = new Set(prev);
      next.delete(boxId);
      return next;
    });
    expandedBeforeDragRef.current.add(boxId);
  };

  const handleDropOnGap = (idx: number, e: React.DragEvent, parentBoxId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetId(null);
    if (!draggingId) return;

    const el = deepFind(currentElements, draggingId);
    if (!el) return;
    let updated = deepRemove(currentElements, draggingId);
    if (parentBoxId) {
      updated = deepInsertIntoBox(updated, parentBoxId, el, idx);
    } else {
      updated = insertAt(updated, el, idx);
    }
    updateSection(updated);
  };

  const handleFileUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      updateSection(deepUpdate(currentElements, id, { content: url }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (id: string, e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFileUpload(id, file);
  };

  const toggleBoxCollapse = (id: string) => {
    setCollapsedBoxes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Render drop zone line
  const renderDropGap = (idx: number, parentBoxId?: string) => (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => handleDropOnGap(idx, e, parentBoxId)}
      className="h-1 rounded-full transition-colors mx-1"
    />
  );

  // Render element row (recursive for boxes)
  const renderElement = (el: FlexElement, depth: number = 0, parentBoxId?: string) => {
    const isBox = el.type === "box";
    const isCollapsed = collapsedBoxes.has(el.id);
    const isDragging = draggingId === el.id;
    const isDropTarget = dropTargetId === el.id;

    return (
      <div
        key={el.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.effectAllowed = "move";
          handleDragStart(el.id);
        }}
        onDragEnd={handleDragEnd}
        className={`transition-opacity ${isDragging ? "opacity-30" : ""}`}
      >
        {isBox ? (
          // Box: overlay badge on border
          <div
            className={`relative rounded-md border-2 transition-colors ${
              isDropTarget
                ? "border-primary bg-primary/5"
                : "border-amber-300/60 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropTargetId(el.id);
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              if (dropTargetId === el.id) setDropTargetId(null);
            }}
            onDrop={(e) => handleDropOnBox(el.id, e)}
          >
            {/* Overlay badge */}
            <div className="absolute -top-2 left-2 flex items-center gap-1 z-10">
              <Badge className={`text-[9px] px-1.5 py-0 leading-4 ${TYPE_COLORS.box} border border-amber-300/60 dark:border-amber-500/30`}>
                box
              </Badge>
              <button
                onClick={() => toggleBoxCollapse(el.id)}
                className="text-[9px] px-1 py-0 rounded bg-background border border-border text-muted-foreground hover:text-foreground"
              >
                {isCollapsed ? "▸" : "▾"}
              </button>
            </div>
            {/* Top bar: drag handle, direction toggle, delete */}
            <div className="flex items-center gap-1 px-2 pt-2.5 pb-1">
              <GripVertical size={12} className="text-muted-foreground cursor-grab shrink-0" />
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => updateSection(deepUpdateDirection(currentElements, el.id))}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                    el.direction === "horizontal"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <ArrowRightLeft size={9} />
                  橫
                </button>
                <button
                  onClick={() => updateSection(deepUpdateDirection(currentElements, el.id))}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                    el.direction === "vertical"
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  <ArrowDownUp size={9} />
                  直
                </button>
              </div>
              <div className="flex-1" />
              <button
                onClick={() => removeElement(el.id)}
                className="p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={11} />
              </button>
            </div>
            {/* Children */}
            {!isCollapsed && (
              <div className="px-2 pb-2 space-y-1">
                {(el.children || []).length === 0 ? (
                  <p className="text-[10px] text-muted-foreground py-2 text-center">
                    拖放元件至此
                  </p>
                ) : (
                  <>
                    {renderDropGap(0, el.id)}
                    {(el.children || []).map((child, ci) => (
                      <div key={child.id}>
                        {renderElement(child, depth + 1, el.id)}
                        {renderDropGap(ci + 1, el.id)}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          // Non-box element
          <div className="flex items-start gap-1.5 rounded-md border border-border p-1.5 bg-background group">
            <GripVertical size={12} className="text-muted-foreground cursor-grab shrink-0 mt-0.5" />
            <Badge className={`shrink-0 text-[10px] px-1.5 py-0 mt-0.5 ${TYPE_COLORS[el.type]}`}>
              {el.type}
            </Badge>
            <div className="flex-1 min-w-0">
              {el.type === "image" ? (
                <div className="space-y-1">
                  <Input
                    value={el.content}
                    onChange={(e) => updateSection(deepUpdate(currentElements, el.id, { content: e.target.value }))}
                    placeholder="貼上圖片網址..."
                    className="h-6 text-xs"
                  />
                  <div
                    onDrop={(e) => {
                      e.stopPropagation();
                      handleFileDrop(el.id, e);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => {
                      setUploadingId(el.id);
                      fileInputRef.current?.click();
                    }}
                    className="border border-dashed border-border rounded p-1.5 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                  >
                    <Upload size={10} className="mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-[9px] text-muted-foreground">拖放或點擊上傳</p>
                  </div>
                </div>
              ) : el.type === "separator" ? (
                <hr className="border-border mt-1.5" />
              ) : editingId === el.id ? (
                <Input
                  autoFocus
                  value={el.content}
                  onChange={(e) => updateSection(deepUpdate(currentElements, el.id, { content: e.target.value }))}
                  onBlur={() => setEditingId(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                  className="h-6 text-xs"
                />
              ) : (
                <span
                  className="text-xs truncate block pt-0.5 cursor-pointer"
                  onClick={() => setEditingId(el.id)}
                >
                  {el.content}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              {el.type !== "separator" && el.type !== "image" && (
                <button
                  onClick={() => setEditingId(el.id)}
                  className="p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <Pencil size={11} />
                </button>
              )}
              <button
                onClick={() => removeElement(el.id)}
                className="p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Preview renderer (recursive)
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
        <div className="flex-1 overflow-auto px-3 py-2 space-y-1">
          {currentElements.length === 0 && (
            <p className="text-xs text-muted-foreground py-8 text-center">
              點擊上方按鈕新增元件
            </p>
          )}
          {renderDropGap(0)}
          {currentElements.map((el, idx) => (
            <div key={el.id}>
              {renderElement(el)}
              {renderDropGap(idx + 1)}
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
