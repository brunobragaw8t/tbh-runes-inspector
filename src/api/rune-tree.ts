import z from "zod";
import { localizedStringSchema } from "./locale";

const boundsSchema = z.object({
  minX: z.number(),
  maxX: z.number(),
  minY: z.number(),
  maxY: z.number(),
});

const levelSchema = z.object({
  level: z.number(),
  stat: z.string(),
  value: z.number(),
  costItem: z.number(),
  costValue: z.number(),
});

const edgeSchema = z.object({
  from: z.number(),
  to: z.number(),
});

const runeNodeSchema = z.object({
  key: z.number(),
  x: z.number(),
  y: z.number(),
  name: localizedStringSchema,
  icon: z.string(),
  maxLevel: z.number(),
  prevReq: z.number().nullable(),
  stat: z.string(),
  effect: localizedStringSchema,
  levels: z.array(levelSchema),
  preview: z.array(z.string()),
});

const runeTreeSchema = z.object({
  startNodes: z.array(z.number()),
  bounds: boundsSchema,
  nodes: z.array(runeNodeSchema),
  edges: z.array(edgeSchema),
});

type RuneTree = z.infer<typeof runeTreeSchema>;

export async function getRuneTree(): Promise<RuneTree> {
  const res = await fetch("/data/rune_tree.json");
  const json = await res.json();
  const parsed = runeTreeSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
