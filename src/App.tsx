import { extractSaveData, type ParsedSaveData } from "@/api/save";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Sidebar, SidebarHeader, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { RuneList } from "./components/rune-list";
import { RuneTreeWrapper } from "./components/rune-tree-wrapper";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [saveData, setSaveData] = useState<ParsedSaveData | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const data = await extractSaveData(file);
    setSaveData(data);
  }

  if (!saveData) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Card className="mt-12 w-full max-w-lg">
          <CardHeader>
            <CardTitle>Task Bar Hero Runes Inspector</CardTitle>
            <CardDescription>First, load your Task Bar Hero save file</CardDescription>
          </CardHeader>

          <CardContent>
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Upload />
                </EmptyMedia>

                <EmptyTitle>Select a save file</EmptyTitle>

                <EmptyDescription>
                  Choose a <code>.es3</code> save file from your computer
                </EmptyDescription>
              </EmptyHeader>

              <EmptyContent>
                <Button onClick={() => inputRef.current?.click()}>
                  <Upload data-icon="inline-start" />
                  Browse files
                </Button>
              </EmptyContent>
            </Empty>
          </CardContent>

          <input
            ref={inputRef}
            type="file"
            accept=".es3"
            onChange={handleFile}
            className="hidden"
          />
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <SidebarInset>
        <RuneTreeWrapper />
      </SidebarInset>

      <Sidebar side="right" collapsible="none">
        <SidebarHeader className="text-sm font-medium">Next Runes</SidebarHeader>

        <RuneList />
      </Sidebar>
    </SidebarProvider>
  );
}

export default App;
