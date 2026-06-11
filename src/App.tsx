import { getRuneTree, type RuneTree as RuneTreeData } from "@/api/rune-tree";
import { getRunes, type Rune } from "@/api/runes";
import { extractSaveData, type ParsedSaveData } from "@/api/save";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Alert, AlertTitle } from "@/components/ui/alert";
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
import { AlertCircleIcon, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RuneList } from "./components/rune-list";
import { RuneTree } from "./components/rune-tree";
import { SelectedRunesProvider } from "./contexts/selected-runes-context";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [saveData, setSaveData] = useState<ParsedSaveData | null>(null);

  const [runes, setRunes] = useState<Rune[] | null>(null);
  const [runeTreeData, setRuneTreeData] = useState<RuneTreeData | null>(null);
  const [runeDataLoading, setRuneDataLoading] = useState(false);
  const [runeDataError, setRuneDataError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const data = await extractSaveData(file);
    setSaveData(data);
  }

  useEffect(() => {
    if (!saveData) return;

    async function loadRuneData() {
      setRuneDataLoading(true);
      setRuneDataError(null);

      try {
        const [r, t] = await Promise.all([getRunes(), getRuneTree()]);
        setRunes(r);
        setRuneTreeData(t);
      } catch (err) {
        setRuneDataError(err instanceof Error ? err.message : "Unknown error");
      }

      setRuneDataLoading(false);
    }

    loadRuneData();
  }, [saveData]);

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

  if (runeDataError) {
    return (
      <div className="flex h-dvh w-full items-center justify-center">
        <Alert variant="destructive" className="w-full max-w-lg">
          <AlertCircleIcon />
          <AlertTitle>Failed to load game data: {runeDataError}</AlertTitle>
        </Alert>
      </div>
    );
  }

  if (runeDataLoading || !runes || !runeTreeData) {
    return <LoadingSpinner />;
  }

  return (
    <SelectedRunesProvider>
      <SidebarProvider defaultOpen className="h-dvh">
        <SidebarInset>
          <RuneTree data={runeTreeData} runes={runes} saveData={saveData} />
        </SidebarInset>

        <Sidebar side="right" collapsible="none">
          <SidebarHeader className="border-b px-4 text-sm font-medium">
            Incomplete runes
          </SidebarHeader>
          <RuneList runes={runes} treeData={runeTreeData} saveData={saveData} />
        </Sidebar>
      </SidebarProvider>
    </SelectedRunesProvider>
  );
}

export default App;
