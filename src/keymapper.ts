export function keymapper(key: string): string {
  const mappedKey = mapKey(key);
  if (mappedKey) return mappedKey;
  console.error("WARNING, unrecognised:", key);
  return "&none";
}

function mapKey(key: string): string | null {
  const normalKey = mapNormalKey(key);
  if (normalKey) return normalKey;
  const functionKey = mapFunctions(key);
  if (functionKey) return functionKey;
  return null;
}

function mapNormalKey(key: string) {
  if (key in miscMap) {
    return miscMap[key as keyof typeof miscMap];
  }
  const normalKey = mapNormalKeyWithoutBehaviour(key);
  if (normalKey) {
    return `&kp ${normalKey}`;
  }
}
function mapNormalKeyWithoutBehaviour(key: string) {
  const functionMatch = /^KC_(F\d+)$/.exec(key);
  if (functionMatch) {
    return functionMatch[1];
  }
  const result = /^KC_(\w+)$/.exec(key);
  if (!result) {
    return null;
  }
  const normalKey = result[1];
  if (normalKey.length === 1) {
    if (/[A-Z]/.test(normalKey)) {
      return normalKey;
    }
    return `N${normalKey}`;
  } else if (normalKey in normalMap) {
    return normalMap[normalKey as keyof typeof normalMap];
  }
  return null;
}
const miscMap = {
  KC_NO: "&none",
  KC_TRNS: "&trans",
  RESET: "&reset",
  QK_BOOT: "&reset",
};
const normalMap = {
  EXLM: "EXCLAMATION",
  DLR: "DOLLAR",
  PERC: "PERCENT",
  CIRC: "CARET",
  AMPR: "AMPERSAND",
  ASTR: "ASTERISK",
  EQL: "EQUAL",
  MINS: "MINUS",
  GRV: "GRAVE",
  BSPC: "BACKSPACE",
  TILD: "TILDE",
  BSLS: "BACKSLASH",
  LCBR: "LEFT_BRACE",
  RCBR: "RIGHT_BRACE",
  LBRC: "LEFT_BRACKET",
  RBRC: "RIGHT_BRACKET",
  LPRN: "LEFT_PARENTHESIS",
  RPRN: "RIGHT_PARENTHESIS",
  UNDS: "UNDERSCORE",
  COMM: "COMMA",
  QUOT: "SINGLE_QUOTE",
  DQUO: "DOUBLE_QUOTES",
  SCLN: "SEMICOLON",
  LCTL: "LCTRL",
  RCTL: "RCTRL",
  LSFT: "LSHIFT",
  RSFT: "RSHIFT",
  SPC: "SPACE",
  SLSH: "SLASH",
  PAST: "KP_MULTIPLY",
  PPLS: "KP_PLUS",
  PSLS: "KP_SLASH",
  PMNS: "KP_MINUS",
  PEQL: "KP_EQUAL",
  PDOT: "KP_DOT",

  VOLD: "C_VOLUME_DOWN",
  MUTE: "K_MUTE",
  VOLU: "C_VOLUME_UP",
  MRWD: "C_REWIND",
  MPRV: "C_PREVIOUS",
  MPLY: "C_PLAY_PAUSE",
  MNXT: "C_NEXT",
  MFFD: "C_FAST_FORWARD",
  SLEP: "C_SLEEP",
  BRIU: "C_BRIGHTNESS_INC",
  BRID: "C_BRIGHTNESS_DEC",

  // same
  TAB: "TAB",
  ESC: "ESCAPE",
  DOT: "DOT",
  ENT: "ENTER",
  LGUI: "LGUI",
  RGUI: "RGUI",
  LALT: "LALT",
  RALT: "RALT",
  DEL: "DELETE",
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RGHT: "RIGHT",
  AT: "AT",
  HASH: "HASH",
  PLUS: "PLUS",
  LT: "LESS_THAN",
  GT: "GREATER_THAN",
  PIPE: "PIPE",
  HOME: "HOME",
  END: "END",
};

function mapFunctions(key: string) {
  const result = /^([\w_]+)\((\w+)\)$/.exec(key);
  if (!result) {
    const multiResult = /^([\w_]+)\((\w+),(\w+)\)$/.exec(key);
    if (!multiResult) return null;
    const layerModResult = mapLayerMod(
      multiResult[1],
      multiResult[2].trim(),
      multiResult[3].trim()
    );
    if (layerModResult) return layerModResult;
    return null;
  }
  const layerResult = mapLayer(result[1], result[2]);
  if (layerResult) return layerResult;
  const specialResult = mapSpecial(result[1], result[2]);
  if (specialResult) return specialResult;
  return null;
}

function mapLayer(func: string, layer: string) {
  if (func in layerFuncMap) {
    return `${layerFuncMap[func as keyof typeof layerFuncMap]} ${layer}`;
  }
  return null;
}
const layerFuncMap = {
  MO: "&mo",
  TO: "&to",
  TG: "&tog",
  DF: "&to",
};

function mapLayerMod(func: string, layer: string, key: string): string | null {
  if (func in layerModFuncMap) {
    const mappedKey = mapNormalKeyWithoutBehaviour(key);
    if (!mappedKey) return null;
    return layerModFuncMap[func as keyof typeof layerModFuncMap](
      layer,
      mappedKey
    );
  }
  return null;
}
const layerModFuncMap = {
  LT: (layer: string, key: string) => `&lt ${layer} ${key}`,
};

function mapSpecial(func: string, key: string): string | null {
  if (func in modifierRawMap && key === "KC_NO") {
    return modifierRawMap[func as keyof typeof modifierRawMap];
  }
  if (func in modifierMap) {
    const mappedKey = mapNormalKeyWithoutBehaviour(key);
    if (!mappedKey) return null;
    return modifierMap[func as keyof typeof modifierMap](mappedKey);
  }

  if (func in specialMap) {
    const mappedKey = mapNormalKeyWithoutBehaviour(key);
    if (!mappedKey) return null;
    return specialMap[func as keyof typeof specialMap](mappedKey);
  }

  if (func in specialModMap) {
    const mappedKey = mapNormalKeyWithoutBehaviour(key) || mapModKey(key);
    if (!mappedKey) return null;
    return specialModMap[func as keyof typeof specialModMap](mappedKey);
  }
  return null;
}
const modifierMap = {
  LCA: (key: string) => `&kp LC(LA(${key}))`,
  RCA: (key: string) => `&kp RC(RA(${key}))`,
  HYPR: (key: string) => `&kp LG(LS(LA(LC(${key}))))`,
  MEH: (key: string) => `&kp LS(LA(LC(${key}))))`,
  LGUI: (key: string) => `&kp LG(${key})`,
  RGUI: (key: string) => `&kp RG(${key})`,
  SGUI: (key: string) => `&kp LG(LS(${key}))`,
};
const modifierRawMap = {
  LCA: `&kp LC(LALT)`,
  RCA: `&kp RC(RALT)`,
  HYPR: `&kp LG(LS(LA(LCTRL)))`,
  MEH: `&kp LS(LA(LCTRL)))`,
  LGUI: `&kp LGUI`,
  RGUI: `&kp RGUI`,
  SGUI: `&kp LG(LSHIFT)`,
};
const specialMap = {
  LGUI_T: (key: string) => `&mt LGUI ${key}`,
  RGUI_T: (key: string) => `&mt RGUI ${key}`,
  LCAG_T: (key: string) => `&mt LC(LA(LGUI)) ${key}`,
  RCAG_T: (key: string) => `&mt RC(RA(RGUI)) ${key}`,
  LCTL_T: (key: string) => `&mt LCTRL ${key}`,
  RCTL_T: (key: string) => `&mt LCTRL ${key}`,
  LALT_T: (key: string) => `&mt LALT ${key}`,
  RALT_T: (key: string) => `&mt RALT ${key}`,
};
const specialModMap = {
  OSM: (key: string) => `&sk ${key}`,
};

function mapModKey(key: string) {
  const result = /^MOD_(\w+)$/.exec(key);
  if (!result) {
    return null;
  }
  const modKey = result[1];
  if (modKey in modMap) {
    return `${modMap[modKey as keyof typeof modMap]}`;
  }
  return null;
}
// A subset of the normalMap!
const modMap = {
  LGUI: "LGUI",
  RGUI: "RGUI",
  LALT: "LALT",
  RALT: "RALT",
  LCTL: "LCTRL",
  RCTL: "RCTRL",
  LSFT: "LSHIFT",
  RSFT: "RSHIFT",
};
