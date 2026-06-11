import z from "zod";
import { decryptES3 } from "../lib/decrypt-es3";

const saveSchema = z.object({
  SystemInfo: z.object({
    __type: z.string(),
    value: z.string(),
  }),
  PlayerSaveData: z.object({
    __type: z.string(),
    value: z.string(),
  }),
  AccountSaveData: z.object({
    __type: z.string(),
    value: z.string(),
  }),
});

export type SaveData = z.infer<typeof saveSchema>;

export async function extractSaveData(file: File) {
  const buffer = await file.arrayBuffer();
  const decrypted = await decryptES3(buffer);
  const parsed = saveSchema.safeParse(decrypted);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
}
