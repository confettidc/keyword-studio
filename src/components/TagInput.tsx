import { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput = ({ tags, onChange, placeholder }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const handleChange = (value: string) => {
    if (value.includes(",")) {
      const parts = value.split(",");
      parts.slice(0, -1).forEach((p) => addTag(p));
      setInputValue(parts[parts.length - 1]);
    } else {
      setInputValue(value);
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1 min-h-[36px]">
      {tags.map((tag, i) => (
        <Badge key={i} variant="secondary" className="gap-1 text-xs py-0.5 px-2">
          {tag}
          <button type="button" onClick={() => removeTag(i)} className="ml-0.5 hover:text-destructive">
            <X size={12} />
          </button>
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] border-0 p-0 h-7 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};

export default TagInput;
