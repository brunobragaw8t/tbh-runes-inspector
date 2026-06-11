import type { RuneTree } from "@/api/rune-tree";

interface RuneTreeProps {
  data: RuneTree;
}

export function RuneTree({ data }: RuneTreeProps) {
  const viewBoxPadding = 100;
  const viewBoxWidth = data.bounds.maxX - data.bounds.minX + viewBoxPadding * 2;
  const viewBoxHeight = data.bounds.maxY - data.bounds.minY + viewBoxPadding * 2;
  const viewBoxMinX = data.bounds.minX - viewBoxPadding;
  const viewBoxMinY = data.bounds.minY - viewBoxPadding;

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

        return (
          <line
            key={`${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            className="stroke-muted"
            strokeWidth={4}
          />
        );
      })}

      {data.nodes.map((node) => {
        const radius = 24;

        return (
          <g
            key={node.key}
            transform={`translate(${node.x},${node.y})`}
            style={{ cursor: "pointer" }}
          >
            <image
              href={node.icon}
              x={-radius + 4}
              y={-radius + 4}
              width={radius * 2 - 8}
              height={radius * 2 - 8}
              preserveAspectRatio="xMidYMid meet"
              className="pointer-events-none"
            />
          </g>
        );
      })}
    </svg>
  );
}
