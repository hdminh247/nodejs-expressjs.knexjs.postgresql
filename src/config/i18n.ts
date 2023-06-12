import i18nService from "../services/i18n";

export default function i18n() {
  // @ts-ignore
  global.i18n = new i18nService(
    {
      defaultLanguage: process.env.DEFAULT_LANGUAGE as string,
      availableLanguages: process.env.AVAILABLE_LANGUAGE_LIST as string,
    },
    process.env.NODE_ENV,
  );
}
