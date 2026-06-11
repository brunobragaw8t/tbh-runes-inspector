import { getRuneTree, type RuneTree } from "@/api/rune-tree";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export function RuneTreeViewerOld() {
  const [tree, setTree] = useState<RuneTree | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialAspect = useRef(1);
  const [viewBox, setViewBox] = useState<ViewBox>({ minX: 0, minY: 0, width: 1000, height: 800 });

  const [hoveredNode, setHoveredNode] = useState<{
    key: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  const isDragging = useRef(false);
  const dragStart = useRef({ clientX: 0, clientY: 0 });
  const viewBoxAtDragStart = useRef<ViewBox>({ minX: 0, minY: 0, width: 1000, height: 800 });
  const dragMoved = useRef(false);

  useEffect(() => {
    getRuneTree()
      .then((data) => {
        setTree(data);
        const pad = 100;
        const w = data.bounds.maxX - data.bounds.minX + pad * 2;
        const h = data.bounds.maxY - data.bounds.minY + pad * 2;
        initialAspect.current = w / h;
        setViewBox({
          minX: data.bounds.minX - pad,
          minY: data.bounds.minY - pad,
          width: w,
          height: h,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const resetView = useCallback(() => {
    if (!tree) return;
    const pad = 100;
    const w = tree.bounds.maxX - tree.bounds.minX + pad * 2;
    const h = tree.bounds.maxY - tree.bounds.minY + pad * 2;
    setViewBox({
      minX: tree.bounds.minX - pad,
      minY: tree.bounds.minY - pad,
      width: w,
      height: h,
    });
  }, [tree]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as Element;
      if (target.closest("[data-node]")) return;
      isDragging.current = true;
      dragMoved.current = false;
      dragStart.current = { clientX: e.clientX, clientY: e.clientY };
      viewBoxAtDragStart.current = { ...viewBox };
    },
    [viewBox],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const dx =
      ((e.clientX - dragStart.current.clientX) / rect.width) * viewBoxAtDragStart.current.width;
    const dy =
      ((e.clientY - dragStart.current.clientY) / rect.height) * viewBoxAtDragStart.current.height;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) dragMoved.current = true;
    setViewBox({
      ...viewBoxAtDragStart.current,
      minX: viewBoxAtDragStart.current.minX - dx,
      minY: viewBoxAtDragStart.current.minY - dy,
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();

      const mouseDataX = viewBox.minX + ((e.clientX - rect.left) / rect.width) * viewBox.width;
      const mouseDataY = viewBox.minY + ((e.clientY - rect.top) / rect.height) * viewBox.height;

      const factor = e.deltaY > 0 ? 1.15 : 0.85;
      let newWidth = viewBox.width * factor;
      newWidth = Math.max(150, Math.min(initialAspect.current * 7000, newWidth));

      const newAspect = rect.width / rect.height;
      const newHeight = newWidth / newAspect;

      const newMinX = mouseDataX - ((e.clientX - rect.left) / rect.width) * newWidth;
      const newMinY = mouseDataY - ((e.clientY - rect.top) / rect.height) * newHeight;

      setViewBox({ minX: newMinX, minY: newMinY, width: newWidth, height: newHeight });
    },
    [viewBox],
  );

  const zoomIn = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = viewBox.minX + viewBox.width / 2;
    const cy = viewBox.minY + viewBox.height / 2;
    let newWidth = viewBox.width * 0.8;
    newWidth = Math.max(150, newWidth);
    const newH = newWidth / (rect.width / rect.height);
    setViewBox({ minX: cx - newWidth / 2, minY: cy - newH / 2, width: newWidth, height: newH });
  }, [viewBox]);

  const zoomOut = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = viewBox.minX + viewBox.width / 2;
    const cy = viewBox.minY + viewBox.height / 2;
    let newWidth = viewBox.width * 1.25;
    newWidth = Math.min(initialAspect.current * 7000, newWidth);
    const newH = newWidth / (rect.width / rect.height);
    setViewBox({ minX: cx - newWidth / 2, minY: cy - newH / 2, width: newWidth, height: newH });
  }, [viewBox]);

  const handleNodePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      const el = (e.target as Element).closest("[data-node]");
      if (!el || !tree) return;
      const key = Number(el.getAttribute("data-key"));
      const tn = tree.nodes.find((n) => n.key === key);
      if (!tn) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const sx = rect.left + ((tn.x - viewBox.minX) / viewBox.width) * rect.width;
      const sy = rect.top + ((tn.y - viewBox.minY) / viewBox.height) * rect.height;
      setHoveredNode({ key, screenX: sx - rect.left, screenY: sy - rect.top });
    },
    [viewBox, tree],
  );

  const handleNodePointerLeave = useCallback(() => {
    setHoveredNode(null);
  }, []);

  const handleNodeClick = useCallback(
    (e: React.MouseEvent) => {
      if (dragMoved.current) return;
      const el = (e.target as Element).closest("[data-node]");
      if (!el || !tree) return;
      const key = Number(el.getAttribute("data-key"));
      const tn = tree.nodes.find((n) => n.key === key);
      if (!tn) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const sx = rect.left + ((tn.x - viewBox.minX) / viewBox.width) * rect.width;
      const sy = rect.top + ((tn.y - viewBox.minY) / viewBox.height) * rect.height;
      if (hoveredNode?.key === key && Math.abs(sx - rect.left - hoveredNode.screenX) < 2) {
        setHoveredNode(null);
      } else {
        setHoveredNode({ key, screenX: sx - rect.left, screenY: sy - rect.top });
      }
    },
    [viewBox, tree, hoveredNode],
  );

  if (loading) {
    return (
      <div className="text-muted-foreground flex h-96 items-center justify-center">
        Loading rune tree...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive flex h-96 items-center justify-center">
        Failed to load rune tree: {error}
      </div>
    );
  }

  if (!tree) return null;

  const hoveredNodeData = hoveredNode ? tree.nodes.find((n) => n.key === hoveredNode.key) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="border-border bg-background inline-flex rounded-lg border p-0.5">
            <button
              onClick={() => setViewMode("tree")}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                viewMode === "tree"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ⊹ Tree
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              ☰ List
            </button>
          </div>
          <span className="text-muted-foreground text-xs">
            {tree.nodes.length} rune nodes | {tree.edges.length} connections
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomIn}
            className="border-border bg-background hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border text-sm"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={zoomOut}
            className="border-border bg-background hover:bg-muted inline-flex size-7 items-center justify-center rounded-md border text-sm"
            title="Zoom out"
          >
            −
          </button>
          <button
            onClick={resetView}
            className="border-border bg-background hover:bg-muted inline-flex h-7 items-center justify-center rounded-md border px-2 text-xs"
            title="Reset view"
          >
            Reset
          </button>
        </div>
      </div>

      {viewMode === "tree" ? (
        <div
          ref={containerRef}
          className="border-border bg-card relative overflow-hidden rounded-lg border select-none"
          style={{ height: "min(80vh, 700px)" }}
        >
          <svg
            ref={svgRef}
            className="h-full w-full"
            viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
          >
            <defs>
              <filter id="node-glow">
                <feDropShadow dx={0} dy={0} stdDeviation={3} floodOpacity={0.4} />
              </filter>
            </defs>

            {tree.edges.map((edge) => {
              const from = tree.nodes.find((n) => n.key === edge.from);
              const to = tree.nodes.find((n) => n.key === edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="stroke-muted-foreground/25"
                  strokeWidth={2.5}
                />
              );
            })}

            {tree.nodes.map((node) => {
              const isStart = tree.startNodes.includes(node.key);
              const r = isStart ? 28 : 18;
              const isHovered = hoveredNode?.key === node.key;

              return (
                <g
                  key={node.key}
                  data-node="true"
                  data-key={node.key}
                  transform={`translate(${node.x},${node.y})`}
                  className="transition-opacity"
                  onPointerEnter={handleNodePointerEnter}
                  onPointerLeave={handleNodePointerLeave}
                  onClick={handleNodeClick}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    r={isHovered ? r + 4 : r}
                    fill={
                      isStart
                        ? "var(--color-primary)"
                        : isHovered
                          ? "var(--color-accent)"
                          : "var(--color-muted)"
                    }
                    stroke={
                      isStart
                        ? "var(--color-primary-foreground)"
                        : isHovered
                          ? "var(--color-accent-foreground)"
                          : "var(--color-muted-foreground)"
                    }
                    strokeWidth={isHovered ? 3 : 2}
                    filter={isHovered ? "url(#node-glow)" : undefined}
                    className="transition-all"
                  />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={
                      isStart
                        ? "var(--color-primary-foreground)"
                        : isHovered
                          ? "var(--color-accent-foreground)"
                          : "var(--color-foreground)"
                    }
                    className="pointer-events-none text-[9px] font-bold"
                  >
                    {isStart ? "★" : node.maxLevel}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoveredNodeData && hoveredNode && (
            <div
              className="border-border bg-popover pointer-events-none absolute z-50 w-64 rounded-lg border p-3 text-sm shadow-xl"
              style={{
                left: hoveredNode.screenX,
                top: hoveredNode.screenY,
                transform: "translate(-50%, calc(-100% - 16px))",
              }}
            >
              <div className="text-popover-foreground font-medium">
                {hoveredNodeData.name["en-US"]}
              </div>
              <div className="text-muted-foreground mt-0.5 text-xs">
                {hoveredNodeData.effect["en-US"]}
              </div>
              <div className="text-muted-foreground mt-1.5 flex items-center gap-2 text-xs">
                <span>Max Level: {hoveredNodeData.maxLevel}</span>
                {hoveredNodeData.prevReq != null && <span>Req: Lv.{hoveredNodeData.prevReq}</span>}
              </div>
              {hoveredNodeData.levels.length > 0 && (
                <div className="border-border mt-2 space-y-0.5 border-t pt-2">
                  {hoveredNodeData.levels.slice(0, 3).map((lv) => (
                    <div
                      key={lv.level}
                      className="text-muted-foreground flex justify-between text-xs"
                    >
                      <span>Lv.{lv.level}</span>
                      <span>+{lv.value}</span>
                    </div>
                  ))}
                  {hoveredNodeData.levels.length > 3 && (
                    <div className="text-muted-foreground/60 text-xs">
                      +{hoveredNodeData.levels.length - 3} more levels
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-background/80 text-muted-foreground/60 pointer-events-none absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full px-3 py-1 text-xs backdrop-blur-sm">
            Drag to pan | Scroll to zoom | Hover a node
          </div>
        </div>
      ) : (
        <div className="border-border bg-card rounded-lg border">
          <div className="max-h-150 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border text-muted-foreground border-b text-left text-xs">
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Effect</th>
                  <th className="px-3 py-2 font-medium">Max Level</th>
                </tr>
              </thead>
              <tbody>
                {tree.nodes.map((node) => (
                  <tr
                    key={node.key}
                    className="border-border/50 hover:bg-muted/50 border-b last:border-0"
                  >
                    <td className="text-foreground px-3 py-2 font-medium">{node.name["en-US"]}</td>
                    <td className="text-muted-foreground px-3 py-2">{node.effect["en-US"]}</td>
                    <td className="text-muted-foreground px-3 py-2">{node.maxLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
