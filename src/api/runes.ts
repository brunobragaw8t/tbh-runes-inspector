import z from "zod";
import { localizedStringSchema } from "./locale";

const runeSchema = z.object({
  RuneKey: z.number(),
  NameKey: z.string(),
  NameKey_i18n: localizedStringSchema,
  MaxLevel: z.number(),
  PrevNodeRequiredLevel: z.number().nullable(),
  NextRuneKey: z.union([z.number(), z.string()]).nullable(),
  PreviewRuneKey: z.union([z.number(), z.string()]).nullable(),
  LevelDataKey: z.number(),
  IconPath: z.string(),
  icon: z.string(),
  next_runes: z.array(
    z.object({
      key: z.string(),
      name_i18n: localizedStringSchema,
    }),
  ),
  slug: z.string(),
});

export type Rune = z.infer<typeof runeSchema>;

export async function getRunes(): Promise<Rune[]> {
  const res = await fetch("/data/runes.json");
  const json = await res.json();
  const parsed = z.array(runeSchema).safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
