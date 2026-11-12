const polishPlural = new Intl.PluralRules("pl-PL");

export interface PolishForms {
  /** 1 mieszkanie */
  one: string;
  /** 2–4, 22–24… mieszkania */
  few: string;
  /** 0, 5–21… mieszkań */
  many: string;
}

/** "3 pokoje", "5 pokoi", "1 pokój" — Polish noun agreement for a count. */
export const pluralPl = (count: number, forms: PolishForms) => {
  const category = polishPlural.select(count);
  const noun = "one" === category ? forms.one : "few" === category ? forms.few : forms.many;
  return `${count} ${noun}`;
};

export const APARTMENT_FORMS: PolishForms = { one: "mieszkanie", few: "mieszkania", many: "mieszkań" };
export const ROOM_FORMS: PolishForms = { one: "pokój", few: "pokoje", many: "pokoi" };
