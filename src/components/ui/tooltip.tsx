import { Info } from "lucide-react";
import { useState } from "react";

const ToolTipIcon = ({ message, Icon = Info, size = 20, cursor = "default" }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <Icon
        className={`cursor-${cursor} text-secondary-900 transition-colors hover:text-secondary-700`}
        size={size}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div
          className="animate-in fade-in absolute -left-28 top-8 z-50 w-96 rounded-md border border-secondary-200 bg-background p-2 text-sm text-foreground shadow-lg duration-200"
          role="tooltip"
        >
          <div className="absolute -top-2 left-1/2 -ml-1 size-2 rotate-45 border-l border-t border-secondary-200 bg-background" />
          {message}
        </div>
      )}
    </div>
  );
};

export default ToolTipIcon;
