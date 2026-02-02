import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import manualContent from "../../user_manual.json?raw";

const GOLD = "#d4af37";

export function UserManual() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-lg backdrop-blur-sm transition-all"
          style={{ 
            backgroundColor: 'rgba(38,38,38,0.8)', 
            border: `1px solid ${GOLD}33`,
          }}
        >
          <HelpCircle className="h-5 w-5 text-stone-300 hover:text-amber-500" />
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="max-w-2xl backdrop-blur-xl text-stone-100"
        style={{ backgroundColor: 'rgba(23,23,23,0.95)', border: `1px solid ${GOLD}4d` }}
      >
        <ScrollArea className="max-h-[60vh] pr-4 scrollbar-mystical">
          <pre className="whitespace-pre-wrap font-mono text-sm text-stone-300 leading-relaxed">{manualContent}</pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
