import { getRuneTree, type RuneTree as RuneTreeData } from "@/api/rune-tree";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { Alert, AlertTitle } from "./ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { RuneTree } from "./rune-tree";

export function RuneTreeWrapper() {
  const [treeData, setTreeData] = useState<RuneTreeData | null>(null);
  const [treeDataLoading, setTreeDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTreeData() {
      setTreeDataLoading(true);
      try {
        const data = await getRuneTree();
        setTreeData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setTreeDataLoading(false);
      }
    }

    fetchTreeData();
  }, []);

  if (treeDataLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Failed to load rune tree: {error}</AlertTitle>
      </Alert>
    );
  }

  if (!treeData) {
    return (
      <Alert variant="destructive">
        <AlertCircleIcon />
        <AlertTitle>Failed to load rune tree</AlertTitle>
      </Alert>
    );
  }

  return <RuneTree data={treeData} />;
}
