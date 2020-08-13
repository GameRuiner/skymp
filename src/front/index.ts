import { SkympClient } from "./skympClient";
import { blockConsole } from "./console";
import * as browser from "./browser";
import * as loadGameManager from "./loadGameManager";
import {
  Game,
  Utility,
  on,
  once,
  GlobalVariable,
  printConsole,
  ObjectReference,
} from "skyrimPlatform";
import { verifyVersion } from "./version";
import { applyInventory } from "./components/inventory";
import { updateWc } from "./worldCleaner";

new SkympClient();

const enforceLimitations = () => {
  Game.setInChargen(true, true, false);
};

once("update", enforceLimitations);
loadGameManager.addLoadGameListener(enforceLimitations);

once("update", () => {
  Utility.setINIBool("bAlwaysActive:General", true);
});
on("update", () => {
  Utility.setINIInt("iDifficulty:GamePlay", 5);
});

loadGameManager.addLoadGameListener((e) => {
  if (!e.isCausedBySkyrimPlatform) return;

  applyInventory(Game.getPlayer(), { entries: [] }, false);
  Utility.wait(0.4).then(() => {
    [
      [0x00012e49, 1],
      [0x00012e4b, 1],
      [0x00012e46, 1],
      [0x00012e4d, 1],
      [0x00012eb6, 1],
      [0x0001397d, 100],
      [0x0003b562, 1],
      [0x0001359d, 1],
      [0x02000800, 1],
      [0x02000801, 2],
      [0x00012eb7, 1],
      [0x00013982, 1],
      [0x00029b8b, 1],
      [0x0004dee3, 1],
    ].forEach((p) => {
      Game.getPlayer().addItem(Game.getFormEx(p[0]), p[1], true);
    });
  });
});

browser.main();
blockConsole();

once("update", verifyVersion);

on("update", () => updateWc());

const gameHourId = 0x38;
const gameMonthId = 0x36;
const gameDayId = 0x37;
const gameYearId = 0x35;
const timeScaleId = 0x3a;
on("update", () => {
  /*const gameHour = GlobalVariable.from(Game.getFormEx(gameHourId));
  printConsole(gameHour.getValue());
  gameHour.setValue(21);

  const timeScale = GlobalVariable.from(Game.getFormEx(timeScaleId));
  timeScale.setValue(0);*/
});

let riftenUnlocked = false;
on("update", () => {
  if (riftenUnlocked) return;
  const refr = ObjectReference.from(Game.getFormEx(0x42284));
  if (!refr) return;
  refr.lock(false, false);
  riftenUnlocked = true;
});