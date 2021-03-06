import { FreeStuffBot } from "../index";
import * as fs from "fs";
import { GuildData } from "types";


export default class LanguageManager {

  private static readonly BASE_URI = './resources/lang/';

  private list = [];
  private idmap = {};
  private texts = {};

  public constructor(bot: FreeStuffBot) {
    this.load();
  }

  public async load() {
    this.list = [];
    this.texts = {};

    const index = fs.readFileSync(LanguageManager.BASE_URI + 'language-index.json').toString();
    this.list = JSON.parse(index).languages;
    this.idmap = JSON.parse(index).idmap;

    for (let langCode of this.list) {
      const raw = fs.readFileSync(LanguageManager.BASE_URI + langCode + '.json').toString();
      this.texts[langCode] = JSON.parse(raw);
    }
  }

  public get(d: GuildData, key: string): string {
    return this.getRaw(d.language, key, true);
  }

  public getRaw(language: string, key: string, fallback = true): string {
    if (!this.list.length) return key;
    if (!fallback) this.getText(language, key);
    if (!this.texts[language]) return this.getText(this.list[0], key);
    return this.getText(language, key) || this.getText(this.list[0], key);
  }

  private getText(language: string, key: string): string {
    return this.texts[language][key];
  }

  public languageById(id: number | string): string {
    return this.idmap[id + ''] || this.list[0];
  }

  public languageToId(lang: string): number {
    for (const key in this.idmap) {
      if (this.idmap[key] == lang)
        return parseInt(key);
    }
    return -1;
  }

  public languageByName(query: string): string {
    query = query.toLowerCase();
    for (const lang of this.list) {
      if (this.getText(lang, 'lang_name').toLowerCase() == query) return lang;
      if (this.getText(lang, 'lang_name_en').toLowerCase() == query) return lang;
    }
    for (const lang of this.list) {
      if (lang.startsWith(query)) return lang;
    }
    for (const lang of this.list) {
      if (this.getText(lang, 'lang_name').toLowerCase().includes(query)) return lang;
      if (this.getText(lang, 'lang_name_en').toLowerCase().includes(query)) return lang;
    }
    return '';
  }

  public displayLangList(): string[] {
    const out: string[] = [];
    for (const lang of this.list)
      out.push(`**${this.getText(lang, 'lang_name')}** (${this.getText(lang, 'lang_name_en')})`);
    return out;
  }

}