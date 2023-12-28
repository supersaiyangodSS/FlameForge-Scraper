import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import saveFile from './helper/saveFile.js';

const url = 'https://wiki.hoyolab.com/pc/genshin/entry/5'

const scraper = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  const mainContent = await page.evaluate((wikiUrl) => {
    const baseinfo = document.querySelectorAll('.base-info-item');
    const galleryContainer = document.querySelector('.d-gallery-content');
    const descContainer = document.querySelector('.ENTRY_SHARE_DESC_SELECTOR');
    const characterMiniData = document.querySelectorAll('.c-entry-tag-item');

    let desc = descContainer ? descContainer.querySelector('.et-text-tiptap-editor > div > p').innerText : 'N/A';
    let profile = galleryContainer ? 'https://wiki.hoyolab.com' + document.querySelector('.detail-header-cover-avatar > .d-img-show').getAttribute('src') : 'N/A';
    let gacha = galleryContainer ? galleryContainer.querySelector('.d-gallery-img > img').getAttribute('origin-src') : 'N/A';
    let card = galleryContainer ? galleryContainer.querySelector('.d-gallery-card > img').getAttribute('origin-src') : 'N/A';

    let images = {
      gacha,
      card,
      profile
    }
    let cdata = [];
    if (characterMiniData) {
      cdata = Array.from(characterMiniData).map(item => item.innerText);
    }

    const baseInfoData = Array.from(baseinfo).reduce((acc, node) => {
      const keyNode = node.querySelector('.base-info-item-key');
      const valueNode = node.querySelector('.et-text-tiptap-editor > div > p');

      if (keyNode) {
        const key = keyNode.innerText.toLowerCase().trim();
        const value = (valueNode && valueNode.innerText.trim()) ? valueNode.innerText.trim() : 'N/A';
        acc[key] = value;
      }
      return acc;
    }, {});
    const keysToRemove = ['chinese va', 'english va', 'korean va', 'japanese va', 'special dish', 'tcg character card'];
    let modifiedObj = Object.fromEntries(
      Object.entries(baseInfoData).filter(([key]) => !keysToRemove.includes(key))
    );
    modifiedObj['versionRelease'] = modifiedObj['version released'];
    delete modifiedObj['version released'];
    modifiedObj['versionRelease'] = parseFloat(modifiedObj['versionRelease']);

    const rarityPattern = /\b(\d)-Star\b/;
    const rarityMatch = cdata.find(item => rarityPattern.test(item));
    let rarity = 'N/A';
    if (rarityMatch) {
      const matchResult = rarityPattern.exec(rarityMatch);
      if (matchResult && matchResult[1]) {
        rarity = parseInt(matchResult[1], 10);
      }
    }

    const weaponTypes = ['Polearm', 'Bow', 'Catalyst', 'Claymore', 'Sword'];

    const weaponMatch = cdata.find(item => weaponTypes.includes(item));
    let weapon = 'N/A'
    if (weaponMatch) {
      weapon = weaponMatch;
    }

    const regionNames = ['Mondstadt', 'Liyue Harbor', 'Inazuma City', 'Sumeru', 'Fontaine'];

    const regionMatch = cdata.find(item => regionNames.includes(item));
    let region = 'N/A';
    if (regionMatch) {
      region = regionMatch;
    }

    let finalObj = modifiedObj['gnosis'] ? { ...modifiedObj, ['vision']: modifiedObj['gnosis'], gnosis: undefined } : { ...modifiedObj };
    let mainObj = {
      ...finalObj,
      images,
      desc,
      wikiUrl,
      cdata,
      rarity,
      weapon,
      region
    }

    // return {baseInfoData, images};
    resultArray = [];
    resultArray.push(mainObj);
    return resultArray;
    // return mainObj

  }, url);

  console.log(mainContent);
  const name = mainContent[0].name;

    // const mainTitle = await page.evaluate(() => {
      // const titleNode = document.querySelectorAll('.detail-header-cover-name');
      // return titleNode ? titleNode.innerText : 'N/A';
    // })

  // await saveFile(mainContent, `./data/character/${name}.json`)
  await saveFile(mainContent, `./data/character/${name}.json`)
  await browser.close();
};

scraper();
