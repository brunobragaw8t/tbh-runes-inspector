import type { RuneTree } from "@/api/rune-tree";
import type { Rune } from "@/api/runes";
import type { ParsedSaveData } from "@/api/save";
import { useSelectedRunes } from "@/contexts/selected-runes-context";

interface RuneTreeProps {
  data: RuneTree;
  runes: Rune[];
  saveData: ParsedSaveData;
}

function getHiddenNodes(data: RuneTree, runes: Rune[], saveData: ParsedSaveData): Set<number> {
  const parentByChild = new Map(data.edges.map((e) => [e.to, e.from]));
  const runeKeyByLevelData = new Map(runes.map((r) => [r.LevelDataKey, r.RuneKey]));
  const startNodes = new Set(data.startNodes);

  const levelByRuneKey = new Map(
    saveData.PlayerSaveData.value.RuneSaveData.map((e) => [e.RuneKey, e.Level]),
  );

  const dimmed = new Set<number>();

  for (const node of data.nodes) {
    if (startNodes.has(node.key)) continue;

    const runeKey = runeKeyByLevelData.get(node.key);
    if (runeKey == null) {
      dimmed.add(node.key);
      continue;
    }

    const level = levelByRuneKey.get(runeKey) ?? 0;

    if (level > 0) continue;

    const parentKey = parentByChild.get(node.key);
    if (parentKey == null) {
      dimmed.add(node.key);
      continue;
    }

    const parentRuneKey = runeKeyByLevelData.get(parentKey);
    if (parentRuneKey == null) {
      dimmed.add(node.key);
      continue;
    }

    const parentLevel = levelByRuneKey.get(parentRuneKey) ?? 0;

    if (parentLevel > 0 && parentLevel >= (node.prevReq ?? 1)) continue;

    dimmed.add(node.key);
  }

  return dimmed;
}

export function RuneTree({ data, runes, saveData }: RuneTreeProps) {
  const viewBoxPadding = 100;
  const viewBoxWidth = data.bounds.maxX - data.bounds.minX + viewBoxPadding * 2;
  const viewBoxHeight = data.bounds.maxY - data.bounds.minY + viewBoxPadding * 2;
  const viewBoxMinX = data.bounds.minX - viewBoxPadding;
  const viewBoxMinY = data.bounds.minY - viewBoxPadding;

  const dimmedNodes = getHiddenNodes(data, runes, saveData);
  const { selectedRunesKeys } = useSelectedRunes();

  return (
    <svg
      className="h-full w-full"
      viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {data.edges.map((edge) => {
        const from = data.nodes.find((n) => n.key === edge.from);
        const to = data.nodes.find((n) => n.key === edge.to);

        if (!from || !to) return null;

        const isDimmed = dimmedNodes.has(edge.to);

        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-muted"
            strokeWidth={4}
            opacity={isDimmed ? 0.25 : undefined}
          />
        );
      })}

      {data.nodes.map((node) => {
        const radius = 24;

        const isDimmed = dimmedNodes.has(node.key);

        return (
          <g
            key={node.key}
            transform={`translate(${node.x},${node.y})`}
            style={{ cursor: "pointer" }}
            opacity={isDimmed ? 0.25 : undefined}
          >
            {selectedRunesKeys.has(node.key) && (
              <circle r={radius + 6} fill="none" className="stroke-primary" strokeWidth={3} />
            )}

            <image
              href={node.icon}
              x={-radius + 4}
              y={-radius + 4}
              width={radius * 2 - 8}
              height={radius * 2 - 8}
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        );
      })}
    </svg>
  );
}
