import { HelpCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import manualContent from "../../user_manual.json?raw";

export function UserManual() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-stone-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-amber-600 transition-all"
        >
          <HelpCircle className="h-5 w-5 text-stone-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-stone-200">
        <ScrollArea className="max-h-[60vh] pr-4">
          <pre className="whitespace-pre-wrap font-mono text-sm text-stone-700">{manualContent}</pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
