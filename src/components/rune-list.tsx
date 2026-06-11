import { type RuneTree } from "@/api/rune-tree";
import { type Rune } from "@/api/runes";
import { type ParsedSaveData } from "@/api/save";
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface RuneListProps {
  runes: Rune[];
  treeData: RuneTree;
  saveData: ParsedSaveData;
}

function formatCost(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toLocaleString("en-US");
}

export function RuneList({ runes, treeData, saveData }: RuneListProps) {
  const runeByKey = new Map(runes.map((r) => [r.RuneKey, r]));
  const nodeByKey = new Map(treeData.nodes.map((n) => [n.key, n]));
  const parentByChild = new Map(treeData.edges.map((e) => [e.to, e.from]));
  const runeKeyByLevelData = new Map(runes.map((r) => [r.LevelDataKey, r.RuneKey]));

  const startNodes = new Set(treeData.startNodes);
  const seen = new Set<number>();
  const incomplete = saveData.PlayerSaveData.value.RuneSaveData.map((entry) => {
    const rune = runeByKey.get(entry.RuneKey);
    if (!rune) return null;

    const node = nodeByKey.get(rune.LevelDataKey);
    if (!node) return null;

    if (entry.Level >= node.maxLevel) return null;

    if (!startNodes.has(node.key)) {
      const parentKey = parentByChild.get(node.key);
      if (parentKey == null) return null;

      const parentRuneKey = runeKeyByLevelData.get(parentKey);
      if (parentRuneKey == null) return null;

      const parentEntry = saveData.PlayerSaveData.value.RuneSaveData.find(
        (s) => s.RuneKey === parentRuneKey,
      );
      if (!parentEntry) return null;

      if (parentEntry.Level < (node.prevReq ?? 1)) return null;
    }

    const nextLevel = entry.Level + 1;

    const levelData = node.levels.find((l) => l.level === nextLevel);
    if (!levelData) return null;

    if (seen.has(node.key)) return null;
    seen.add(node.key);

    return {
      key: node.key,
      name: node.name["en-US"] ?? Object.values(node.name)[0] ?? "Unknown",
      icon: node.icon,
      currentLevel: entry.Level,
      maxLevel: node.maxLevel,
      cost: levelData.costValue,
    };
  })
    .filter((item) => item !== null)
    .sort((a, b) => a.cost - b.cost);

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {incomplete.map((rune) => (
              <SidebarMenuItem key={rune.key}>
                <div className="flex items-start gap-2 px-2 py-1.5 text-sm">
                  <img src={rune.icon} className="size-5 shrink-0 object-contain" />

                  <div className="grow">
                    <div className="truncate font-medium">{rune.name}</div>

                    <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                      <span>
                        Lv.{rune.currentLevel}/{rune.maxLevel}
                      </span>

                      <span>·</span>

                      <span>
                        <strong className="text-amber-500">{formatCost(rune.cost)}</strong> G
                      </span>
                    </div>

                    {/* <div>Node key: {rune.key}</div> */}
                  </div>
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
