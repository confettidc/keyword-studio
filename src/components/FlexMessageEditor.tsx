import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Image, Type, MousePointer, Minus, Square } from "lucide-react";

type SectionName = "Header" | "Hero" | "Body" | "Footer";

const elementButtons = [
  { label: "Text", icon: Type },
  { label: "Button", icon: MousePointer },
  { label: "Image", icon: Image },
  { label: "Separator", icon: Minus },
  { label: "Box", icon: Square },
];

interface SectionProps {
  name: SectionName;
  extra?: string;
  children?: React.ReactNode;
}

const Section = ({ name, extra, children }: SectionProps) => (
  <div className="rounded-lg border border-border p-3">
    <div className="flex items-center justify-between mb-2">
      <span className="font-semibold text-sm">{name}</span>
      {extra && <span className="text-sm text-muted-foreground">{extra}</span>}
    </div>
    <div className="flex gap-3 mb-2 text-xs text-muted-foreground">
      {elementButtons.map((el) => (
        <button key={el.label} className="hover:text-foreground transition-colors">
          {el.label}
        </button>
      ))}
    </div>
    {children || (
      <p className="text-xs text-muted-foreground">點擊上方按鈕新增元件</p>
    )}
  </div>
);

const FlexMessageEditor = () => {
  const [jsonMode, setJsonMode] = useState(false);

  return (
    <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
      {/* Left: Element Editor */}
      <div className="flex-1 overflow-auto space-y-3 pr-2">
        <div className="flex justify-end">
          <button
            onClick={() => setJsonMode(!jsonMode)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            JSON
          </button>
        </div>
        <Section name="Header" />
        <Section name="Hero" extra="新增圖片">
          <p className="text-xs text-muted-foreground">選填，主圖</p>
        </Section>
        <Section name="Body">
          <p className="text-xs text-muted-foreground">點擊上方按鈕新增元件</p>
        </Section>
        <Section name="Footer">
          <p className="text-xs text-muted-foreground">點擊上方按鈕新增元件</p>
        </Section>
      </div>

      {/* Right: Preview */}
      <div className="w-[320px] shrink-0 overflow-auto">
        <h3 className="text-sm font-semibold mb-2">預覽</h3>
        <div className="rounded-lg border border-border bg-muted/30 min-h-[300px] p-4 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">訊息預覽區</p>
        </div>
      </div>
    </div>
  );
};

export default FlexMessageEditor;
