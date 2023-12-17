import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import saveFile from './helper/saveFile.js';

const url = 'https://wiki.hoyolab.com/pc/genshin/entry/49';

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
    let icon = galleryContainer ? document.querySelector('.detail-header-cover-avatar > .d-img-show').getAttribute('src') : 'N/A';
    icon = icon ? icon.replace('/_ipx/f_webp/', '') : 'N/A';
    let gacha = galleryContainer ? galleryContainer.querySelector('.d-gallery-img > img').getAttribute('origin-src') : 'N/A';
    let card = galleryContainer ? galleryContainer.querySelector('.d-gallery-card > img').getAttribute('origin-src') : 'N/A';

    let images = {
      gacha,
      card,
      icon
    }
    let cData = [];
    if (characterMiniData) {
      cData = Array.from(characterMiniData).map(item => item.innerText);
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
    let mainObj = {
      ...modifiedObj,
      images,
      desc,
      wikiUrl,
      cData,
      rarity: "N/A",
      weapon: "N/A",
      region: "N/A",
      model: "N/A"
    }

    // return {baseInfoData, images};
    return mainObj

  }, url);

  console.log(mainContent);
  const name = mainContent.name;

    // const mainTitle = await page.evaluate(() => {
      // const titleNode = document.querySelectorAll('.detail-header-cover-name');
      // return titleNode ? titleNode.innerText : 'N/A';
    // })

  // await saveFile(mainContent, `./data/character/${name}.json`)
  await saveFile(mainContent, `./data/character/${name}.json`)
  await browser.close();
};

scraper();
