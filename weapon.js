import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import saveFile from './helper/saveFile.js';

const weaponUrl = 'https://genshin.honeyhunterworld.com/i_n14409/?lang=EN';
const extraUrl = 'https://wiki.hoyolab.com/pc/genshin/entry/1980';


const weaponExtraScraper = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(extraUrl);

  const weaponExtraContent = await page.evaluate(() => {
    const baseinfo = document.querySelectorAll('.base-info-item');
    const galleryContainer = document.querySelector('.d-gallery-content');
    const weaponExtraMiniData = document.querySelectorAll('.c-entry-tag-item');

    // const imageContainers = document.querySelectorAll('.d-gallery-list-item');hoyowiki-slider

const galleryList = document.querySelector('.d-gallery-list');
    let allImages = [];
    if (galleryList) {
      let galleryListItems = galleryList.querySelectorAll('.d-gallery-list-item');
      allImages = Array.from(galleryListItems).map(item => item.querySelector('div > img').getAttribute('origin-src'));
    }
    // let icon = galleryContainer ? 'https://wiki.hoyolab.com' + document.querySelector('.d-gallery-img > img').getAttribute('src') : 'N/A';
    // let original = galleryContainer ? galleryContainer.querySelector('.d-gallery-img > img').getAttribute('origin-src') : 'N/A';
    // let awakened = galleryContainer ? galleryContainer.querySelector('.d-gallery-img > img').getAttribute('origin-src') : 'N/A';

    let images = {
      original: allImages[0],
      awakened: allImages[1],
      // icon
      // allImages
    }
    let cdata = [];
    if (weaponExtraMiniData) {
      cdata = Array.from(weaponExtraMiniData).map(item => item.innerText);
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

    delete baseInfoData['type'];

    let mainObj = {
      ...baseInfoData,
      images,
      cdata
    }

    return mainObj;
  });

  await browser.close();
  return weaponExtraContent;

};

const weaponScraper = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(weaponUrl);

  const weaponInfo = await page.evaluate((wikiUrl) => {
    const tableRows = Array.from(document.querySelectorAll('.genshin_table.main_table tbody tr'));
    const galleryCont = document.querySelectorAll('.gallery_cont');
    const weaponInfo = {};

    tableRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const key = cells[0].textContent.trim();
      let value;

      if (key === 'Rarity') {
        const stars = Array.from(cells[1].querySelectorAll('.cur_icon')).length;
        value = stars;
      }
      else {
        value = cells[1].textContent.trim();
      }
      weaponInfo[key] = value;
    });

    let gachaArtPic = [];
    if (galleryCont) {
      gachaArtPic = Array.from(galleryCont).map(item => 'https://genshin.honeyhunterworld.com' + item.querySelector('img').getAttribute('src'));
    }
    gachaArtPic = gachaArtPic.map(url => url.replace('_70', ''));

    weaponInfo['gacha-art'] = gachaArtPic
    weaponInfo['desc'] = weaponInfo['Description'];
    weaponInfo['affix'] = weaponInfo['Weapon Affix']
    weaponInfo['passive'] = weaponInfo['Affix Description']
    weaponInfo['baseAtk'] = parseFloat(weaponInfo['Base Attack'])
    weaponInfo['baseSubStat'] = parseFloat(weaponInfo['Base Substat'])
    weaponInfo['subStatType'] = weaponInfo['Substat Type']
    weaponInfo['rarity'] = weaponInfo['Rarity'];
    weaponInfo['family'] = weaponInfo['Family'].split(',')[1].trim();

    const keysToRemove = ['Conversion Exp', 'Description', 'Weapon Affix', 'Affix Description', 'Rarity','Substat Type', 'Base Substat', 'Base Attack', 'Weapon Ascension Materials', 'if(screenwidth<1000){document.getElementsByClassName("main_image")[0].remove();}'];
    let modifiedObj = Object.fromEntries(
      Object.entries(weaponInfo).filter(([key]) => !keysToRemove.includes(key))
    );

    let mainObj = {
      ...modifiedObj,
      wikiUrl
    }

    return mainObj;
  }, weaponUrl);

  await browser.close();
  return weaponInfo;

};
const runScrapers = async () => {
  try {
    const weaponExtraDataPromise = weaponExtraScraper();
    const weaponDataPromise = weaponScraper();

    const weaponExtraData = await weaponExtraDataPromise;
    const weaponData = await weaponDataPromise;

    const combinedData = {
      weaponExtra: weaponExtraData,
      weapon: weaponData,
    };

    const weaponObject = {
      name: weaponExtraData['name'],
      desc: weaponData['desc'],
      rarity: weaponData['rarity'],
      source: weaponExtraData['source'],
      passive: weaponData['passive'],
      versionRelease: weaponExtraData['version released'],
      region: weaponExtraData['region'],
      family: weaponData['family'],
      wikiUrl: weaponData['wikiUrl'],
      affix: weaponData['affix'],
      baseAtk: weaponData['baseAtk'],
      baseSubStat: weaponData['baseSubStat'],
      subStatType: weaponData['subStatType'],
      images: {
        icon: weaponData['gacha-art'][0],
        original: weaponExtraData.images['original'],
        awakened: weaponExtraData.images['awakened'],
        gacha: weaponData['gacha-art'][2]
      }
    }
    console.log(weaponObject);
    await saveFile([weaponObject], `./data/weapon/${weaponObject.name}.json`);
    console.log('rerun script if fields are undefined');
  } catch (error) {
    console.error('Error:', error);
  }
};

runScrapers();
// characterScraper();
// weaponScraper();
