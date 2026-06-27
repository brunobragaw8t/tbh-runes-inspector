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

const systemInfoSchema = z.string();

const commonSaveDataSchema = z.object({
  version: z.string(),
  lastSavedTime: z.number(),
  playTime: z.number(),
  isFirstPlay: z.boolean(),
  LastRollingBackUpTime: z.number(),
  SendSteamId: z.boolean(),
  TutorialCleared: z.array(z.boolean()),
  ArrangedPetKey: z.number(),
  arrangedHeroKey: z.array(z.number()),
  maxCompletedStage: z.number(),
  currentStageKey: z.number(),
  currentStageWave: z.number(),
  useStorage: z.boolean(),
  isOpeningDirectionPlayed: z.boolean(),
  FirstUnlockHeroKey: z.number(),
});

const settingSaveDataSchema = z.object({
  language: z.number(),
  isAlwaysOnTop: z.boolean(),
  maxFps: z.number(),
  windowZoomRate: z.number(),
  windowLayoutPreset: z.number(),
  FixingLog: z.boolean(),
  LogFilter: z.number(),
  LogShowTime: z.boolean(),
  isAutoStart: z.boolean(),
  StageRepeatStageFailed: z.boolean(),
  RepeatActBossDuringConsumeAllStone: z.boolean(),
  AskWarningAlchemy: z.boolean(),
  BoxAlphaValue: z.number(),
  BoxShowWhenHover: z.boolean(),
  ShowQuickMenu: z.boolean(),
  ForceSynthesisOnCubeOpen: z.boolean(),
  AlwaysShowCoolTimeSlider: z.boolean(),
  IsTooltipExpanded: z.boolean(),
});

const boxDataSchema = z.object({
  BoxTypes: z.array(z.number()),
  BoxUniqueId: z.array(z.number()),
  BoxQuantity: z.array(z.number()),
});

const currencySaveDataSchema = z.object({
  Key: z.number(),
  Quantity: z.number(),
});

const heroSaveDataSchema = z.object({
  heroKey: z.number(),
  HeroLevel: z.number(),
  IsUnLock: z.boolean(),
  HeroExp: z.number(),
  AbilityPoint: z.number(),
  AllocatedHeroAbilityPoint: z.number(),
  equippedItemIds: z.array(z.number()),
  equippedSKillKey: z.array(z.number()),
  unlockedAttributeGroupKeys: z.array(z.number()),
});

const mailSaveDatasSchema = z.object({
  Keys: z.array(z.unknown()),
  MailData: z.array(z.unknown()),
});

const attributeSaveDataSchema = z.object({
  Key: z.number(),
  Level: z.number(),
});

const petSaveDataSchema = z.object({
  PetKey: z.number(),
  IsUnlock: z.boolean(),
  IsViewed: z.boolean(),
});

const runeSaveDataSchema = z.object({
  RuneKey: z.number(),
  Level: z.number(),
});

const inventorySaveDataSchema = z.object({
  Index: z.number(),
  ItemUniqueId: z.number(),
  IsUnlock: z.boolean(),
  IsUnlockedByRune: z.boolean(),
});

const stashSaveDataSchema = z.object({
  Index: z.number(),
  ItemUniqueId: z.number(),
  IsUnLock: z.boolean(),
});

const tradingStashSaveDataSchema = z.object({
  Index: z.number(),
  ItemUniqueId: z.number(),
  IsUnLock: z.boolean(),
});

const cubeRecipeSaveDataSchema = z.object({
  CubeRecipeTypeInt: z.number(),
  CubeKey: z.number(),
  MaxUnlockRecipeKey: z.number(),
});

const cubeSaveLevelDataSchema = z.object({
  Level: z.number(),
  Exp: z.number(),
});

const enchantDataSchema = z.object({
  StatModKey: z.number(),
  Tier: z.number(),
  Value: z.number(),
  RecipeType: z.number(),
  ModType: z.number(),
  MaterialKey: z.number(),
  StatType: z.number(),
});

const itemSaveDataSchema = z.object({
  ItemKey: z.number(),
  UniqueId: z.number(),
  IsChaotic: z.boolean(),
  IsBlocked: z.boolean(),
  IsServerPendingItem: z.boolean(),
  EnchantCount: z.array(z.number()),
  EnchantData: z.array(enchantDataSchema),
  DecorationAppliedTotalCount: z.number(),
  EngravingAppliedTotalCount: z.number(),
  InscriptionAppliedTotalCount: z.number(),
});

const aggregateSaveDataSchema = z.object({
  Type: z.number(),
  SubKey: z.number(),
  Value: z.number(),
});

const playerSaveDataSchema = z.object({
  commonSaveData: commonSaveDataSchema,
  settingSaveData: settingSaveDataSchema,
  BoxData: boxDataSchema,
  currenySaveDatas: z.array(currencySaveDataSchema),
  heroSaveDatas: z.array(heroSaveDataSchema),
  mailSaveDatas: mailSaveDatasSchema,
  attributeSaveDatas: z.array(attributeSaveDataSchema),
  PetSaveData: z.array(petSaveDataSchema),
  RuneSaveData: z.array(runeSaveDataSchema),
  inventorySaveDatas: z.array(inventorySaveDataSchema),
  stashSaveDatas: z.array(stashSaveDataSchema),
  tradingStashSaveDatas: z.array(tradingStashSaveDataSchema).default([]),
  cubeRecipeSaveDatas: z.array(cubeRecipeSaveDataSchema),
  cubeSaveLevelData: cubeSaveLevelDataSchema,
  itemSaveDatas: z.array(itemSaveDataSchema),
  aggregateSaveDatas: z.array(aggregateSaveDataSchema),
});

const accountSaveDataSchema = z.object({
  version: z.string(),
  isFirstRun: z.boolean(),
  forceApplyServerData: z.boolean(),
  lastSavedTime: z.number(),
  playTime: z.number(),
  lastExitSteamUnixSecEncrypted: z.number(),
  lastExitSteamUnixSecKey: z.number(),
  sessionCounter: z.number(),
  ownerSteamId: z.string(),
  playerId: z.string(),
});

const parsedSaveSchema = z.object({
  SystemInfo: z.object({
    __type: z.string(),
    value: systemInfoSchema,
  }),
  PlayerSaveData: z.object({
    __type: z.string(),
    value: playerSaveDataSchema,
  }),
  AccountSaveData: z.object({
    __type: z.string(),
    value: accountSaveDataSchema,
  }),
});

export type ParsedSaveData = z.infer<typeof parsedSaveSchema>;

export async function extractSaveData(file: File) {
  const buffer = await file.arrayBuffer();
  const decrypted = await decryptES3(buffer);
  const raw = saveSchema.parse(decrypted);

  const playerSaveData = JSON.parse(raw.PlayerSaveData.value) as unknown;
  const accountSaveData = JSON.parse(raw.AccountSaveData.value) as unknown;

  return parsedSaveSchema.parse({
    SystemInfo: raw.SystemInfo,
    PlayerSaveData: { __type: raw.PlayerSaveData.__type, value: playerSaveData },
    AccountSaveData: { __type: raw.AccountSaveData.__type, value: accountSaveData },
  });
}
