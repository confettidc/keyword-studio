import { MessageSquare, Key, Send, Tag, MessagesSquare } from "lucide-react";

const menuItems = [
  { label: "歡迎訊息", icon: MessageSquare },
  { label: "關鍵字回應", icon: Key, active: true },
  { label: "單封群發", icon: Send },
  { label: "標籤觸發", icon: Tag },
  { label: "聊天室", icon: MessagesSquare },
];

const LineSidebar = () => {
  return (
    <nav className="w-48 shrink-0 border-r border-border bg-card">
      <ul className="py-2">
        {menuItems.map((item) => (
          <li key={item.label}>
            <button
              className={`flex w-full items-center gap-2 px-5 py-3 text-sm transition-colors ${
                item.active
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-accent"
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default LineSidebar;
