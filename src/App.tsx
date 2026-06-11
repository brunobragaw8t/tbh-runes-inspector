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
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { RuneTreeWrapper } from "./components/rune-tree-wrapper";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [saveData, setSaveData] = useState<ParsedSaveData | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    const data = await extractSaveData(file);
    setSaveData(data);
  }

  return (
    <div className="flex flex-col gap-8">
      <Card className="mt-12 w-full max-w-lg">
        <CardHeader>
          <CardTitle>Task Bar Hero Runes Inspector</CardTitle>
          <CardDescription>First, load your Task Bar Hero save file</CardDescription>
        </CardHeader>

        <CardContent>
          {!saveData ? (
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
          ) : (
            <div>
              <p className="text-muted-foreground mb-2 text-sm">Loaded: {fileName}</p>

              <pre className="bg-muted max-h-96 overflow-auto rounded-lg p-4 text-xs">
                {JSON.stringify(saveData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>

        <input ref={inputRef} type="file" accept=".es3" onChange={handleFile} className="hidden" />
      </Card>

      <RuneTreeWrapper />
    </div>
  );
}

export default App;
