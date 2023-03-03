import { ChatMessage, ChatText } from '../props/chatProperty';
import { PlayerController } from './PlayerController';
import { getName } from '../mpApiInteractor';
import { getPossesedSkills } from './skillMenuLogic';
import { EvalProperty } from '..//props/evalProperty';
import { Ctx } from '../types/ctx';
import { Mp } from '../types/mp';
import { weaponTypes } from './skillDiceData';
import { ActorBase, Race } from 'skyrimPlatform';

declare const ctx: Ctx;
declare const eventString: string;
declare const weaponKeywords: {
  keyword: string;
  name: string;
}[];
declare const mp: Mp;

export const skillDice = (
  actorId: number,
  controller: PlayerController,
  neighbors: number[],
  inputText: string,
  masterApiId: number | undefined
) => {
  const actorName = getName(actorId);
  const [_, action, type, value, buff] = inputText.split(' ');
  const colors: {
    [key: string]: string;
  } = {
    yellow: '#BDBD7D',
    white: '#FFFFFF',
    green: '#5DAD60',
    red: '#F78C8C',
    blue: '#7175D6',
    purple: '#9159B6',
  };
  let text: ChatText[] = [];
  switch (action) {
    case 'init':
      const { possessedSkills } = getPossesedSkills(actorId);
      // const equipment = mp.get(actorId, 'equipment');
      // console.log(equipment);
      EvalProperty.eval(
        actorId,
        () => {
          const player = ctx.sp.Game.getPlayer()!;
          const leftHandedWeapon = player.getEquippedWeapon(true);
          const equippedWeapons = [] as string[];
          let armorType = null;
          weaponKeywords.forEach((type) => {
            const keyword = ctx.sp.Keyword.getKeyword(type.keyword);
            if (player.wornHasKeyword(keyword)) {
              equippedWeapons.push(type.name);
              if (equippedWeapons.length == 2) {
                // put left hand weapon in left slot
                if (leftHandedWeapon?.hasKeyword(keyword)) {
                  equippedWeapons.reverse();
                }
                return;
              }
            }
          });
          if (equippedWeapons.length === 0) {
            const clawRaces = [0x00013745, 0x00013740];
            const base = ctx.sp.ActorBase.from(player.getBaseObject()) as ActorBase;
            const raceId = base.getRace() ? (base.getRace() as Race).getFormID() : 0;
            if (clawRaces.includes(raceId)) {
              equippedWeapons.push('claw');
            } else {
              equippedWeapons.push('fist');
            }
          }
          // TODO: add other types of armor
          const keyword = ctx.sp.Keyword.getKeyword('ArmorMageRobe');
          if (player.wornHasKeyword(keyword)) {
            armorType = 'robe';
          }
          const src = `
          window.dispatchEvent(new CustomEvent('initSkillDices', { detail: { skills: ${eventString}, weapons: ${JSON.stringify(
            equippedWeapons
          )}, armor: ${JSON.stringify(armorType)}}}))
          `;
          ctx.sp.browser.executeJavaScript(src);
        },
        { eventString: JSON.stringify(possessedSkills), weaponKeywords: weaponTypes }
      );
      break;
    case 'initiative':
      text = [
        {
          text: `${actorName} имеет инциативу `,
          color: colors['yellow'],
          type: ['plain'],
        },
        {
          text: `- ${Math.floor(Math.random() * 100 + 1)}`,
          color: colors['white'],
          type: ['plain'],
        },
      ];
      break;
    case 'heal':
      text = [
        {
          text: `${actorName} восстанавливает единицу здоровья`,
          color: colors['green'],
          type: ['plain'],
        },
      ];
      break;
    case 'self-attack':
      text = [
        {
          text: `${actorName} теряет единицу здоровья`,
          color: colors['red'],
          type: ['plain'],
        },
      ];
      break;
    case 'heal':
      text = [
        {
          text: `${actorName} восстанавливает единицу здоровья`,
          color: colors['green'],
          type: ['plain'],
        },
      ];
      break;
    case 'magic':
      const magicNames = {
        conjuration: 'колдовства',
        destruction: 'разрушения',
        restoration: 'восстановления',
        alteration: 'изменения',
        illusion: 'иллюзии',
      } as { [key: string]: string };
      if (type === 'select') {
        text = [
          {
            text: `${actorName} использует магию ${magicNames[value]}`,
            color: colors['purple'],
            type: ['plain'],
          },
        ];
        break;
      }
      text = [];
      const magicBuff = +buff;
      if (magicBuff < 0) {
        text.push({
          text: `${actorName} под ослаблением. Сила воли снижена на ${Math.abs(magicBuff)}\n`,
          color: colors['purple'],
          type: ['plain'],
        });
      }
      if (magicBuff > 0) {
        text.push({
          text: `${actorName} под усилением. Сила воли повышена на ${buff}\n`,
          color: colors['purple'],
          type: ['plain'],
        });
      }
      text.push({
        text: `${actorName} использует магию ${magicNames[type] || ''} `,
        color: colors['purple'],
        type: ['plain'],
      });
      text.push({
        text: `- ${Math.floor(Math.random() * 20 + 1) + (+value + magicBuff)}`,
        color: colors['white'],
        type: ['plain'],
      });
      break;
    case 'weapon':
      const weaponNames = {
        daggers: 'кинжал',
        shortswords: 'короткий меч',
        swords: 'меч',
        scimitar: 'скимитар',
        katana: 'катану',
        mace: 'булаву',
        axes: 'топор',
        hammer: 'молоток',
        bows: 'лук или арбалет',
        longsword: 'двуручный меч',
        greatkatana: 'нодати',
        battleaxe: 'двуручный топор',
        warhammer: 'молот',
        staff: 'боевой посох',
        pike: 'копье',
        halberd: 'алебарду',
        fist: 'дерется в рукопашную',
        claw: 'когти',
        magicstaff: 'магический посох',
        different: 'парное оружие',
      } as { [key: string]: string };

      if (type === 'select') {
        text = [
          {
            text: `${actorName} ${
              value === 'fist' ? weaponNames[value] : `будет использовать в бою ${weaponNames[value]}`
            }`,
            color: colors['blue'],
            type: ['plain'],
          },
        ];
        break;
      }
      text = [];
      const attackBuff = +buff;
      if (attackBuff < 0) {
        text.push({
          text: `${actorName} под ослаблением. Сила атаки снижена на ${Math.abs(attackBuff)}\n`,
          color: colors['blue'],
          type: ['plain'],
        });
      }
      if (attackBuff > 0) {
        text.push({
          text: `${actorName} под усилением. Сила атаки повышена на ${buff}\n`,
          color: colors['blue'],
          type: ['plain'],
        });
      }
      text.push({
        text: `${actorName} ${type === 'fist' ? weaponNames[type] : `использует ${weaponNames[type]}`} `,
        color: colors['blue'],
        type: ['plain'],
      });
      text.push({
        text: `- ${Math.floor(Math.random() * 20 + 1) + (+value + attackBuff)}`,
        color: colors['white'],
        type: ['plain'],
      });
      break;
    case 'defence':
      text = [];
      const defenceBuff = +buff;
      if (defenceBuff < 0) {
        text.push({
          text: `${actorName} под ослаблением. Защита снижена на ${Math.abs(defenceBuff)}\n`,
          color: colors['yellow'],
          type: ['plain'],
        });
      }
      if (defenceBuff > 0) {
        text.push({
          text: `${actorName} под усилением. Защита повышена на ${buff}\n`,
          color: colors['yellow'],
          type: ['plain'],
        });
      }
      text.push({
        text: `${actorName} защищается `,
        color: colors['yellow'],
        type: ['plain'],
      });
      text.push({
        text: `- ${Math.floor(Math.random() * 20 + 1) + (+value + +buff)}`,
        color: colors['white'],
        type: ['plain'],
      });
    default:
      break;
  }
  const message = new ChatMessage(actorId, masterApiId || controller.getProfileId(actorId), text, 'dice', controller);
  for (const neighbor of neighbors) {
    controller.sendChatMessage(neighbor, message);
  }
};
