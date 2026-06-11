import z from "zod";

const localeSchema = z.enum([
  "zh-Hans",
  "zh-Hant",
  "en-US",
  "fr-FR",
  "de-DE",
  "id-ID",
  "ja-JP",
  "ko-KR",
  "pl-PL",
  "pt-BR",
  "ru-RU",
  "es-ES",
  "th-TH",
  "tr-TR",
  "uk-UA",
  "vi-VN",
]);

export const localizedStringSchema = z.record(localeSchema, z.string());
