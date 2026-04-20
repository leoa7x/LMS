import { Injectable } from "@nestjs/common";

@Injectable()
export class I18nService {
  resolveLang(requested?: string, preferred?: string) {
    if (requested === "es" || requested === "en") {
      return requested;
    }

    if (preferred === "es" || preferred === "en") {
      return preferred;
    }

    return "es";
  }

  pick(es?: string | null, en?: string | null, lang: string = "es") {
    if (lang === "en") {
      return en ?? es ?? null;
    }

    return es ?? en ?? null;
  }
}
