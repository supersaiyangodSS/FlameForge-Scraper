import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import saveFile from './helper/saveFile.js';

const url = 'https://wiki.hoyolab.com/pc/genshin/entry/3321';

const scraper = async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url);

  const mainContent = await page.evaluate((wikiUrl) => {
    const baseinfo = document.querySelectorAll('.base-info-item');
    // const galleryContainer = document.querySelector('.d-gallery-content');
    const descContainer = document.querySelector('.ENTRY_SHARE_DESC_SELECTOR');
    const artifactContainer = document.querySelector('.e-artifact-list-content');



    let desc = descContainer ? descContainer.querySelector('.et-text-tiptap-editor > div > p').innerText : 'N/A';
    let piecesData = {};
    if (artifactContainer) {
      const artifacts = Array.from(artifactContainer.querySelectorAll('.e-artifact-list-item'));
  // Check if artifacts is an array before using map
  if (Array.isArray(artifacts)) {
    piecesData = artifacts.map(artifact => {
      const imgSrc =  artifact.querySelector('.d-img-show').getAttribute('src');
      const title = artifact.querySelector('.e-artifact-list-item-title').innerText;
      const position = artifact.querySelector('.e-artifact-list-item-pos').innerText;
      const artifactDesc = artifact.querySelector('.et-text-tiptap-editor > div > p').innerText;

      return {
        imgSrc,
        title,
        position,
        artifactDesc,
      };
    });
  } else {
    // Handle the case where artifacts is not an array
    console.error('Unexpected data structure for artifacts');
  }
} else {
  // Handle the case where artifactContainer is falsy
  console.error('No artifactContainer found');
}


    const transformedData = piecesData.map(item => ({
      title: item.title,
      piece: item.position,
      icon: item.imgSrc
    }))

    const baseInfoData = Array.from(baseinfo).reduce((acc, node) => {
      const keyNode = node.querySelector('.base-info-item-key');
      const valueNode = node.querySelector('.et-text-tiptap-editor > div > p');

      if (keyNode) {
        let key = keyNode.innerText.toLowerCase().trim();
        const value = (valueNode && valueNode.innerText.trim()) ? valueNode.innerText.trim() : 'N/A';

        if (key === '2-piece set') {
          key = 'twoPc'
        }
        else if (key === '4-piece set') {
          key = 'fourPc'
        }

        acc[key] = value;
      }
      return acc;
    }, {});

    // const keysToRemove = ['chinese va', 'english va', 'korean va', 'japanese va', 'special dish', 'tcg character card'];
    // let modifiedObj = Object.fromEntries(
    //   Object.entries(baseInfoData).filter(([key]) => !keysToRemove.includes(key))
    // );



    let updatedObj = {
      ...baseInfoData,
      desc,
      piecesData,
      wikiUrl,
    }

    let mainObj = {
      name : updatedObj['name'],
      effect: {
        twoPc: updatedObj['twoPc'],
        fourPc: updatedObj['fourPc']
      },
      fullSet: {
        flower: transformedData[0],
        sands: transformedData[1],
        plume: transformedData[2],
        circlet: transformedData[3],
        goblet: transformedData[4]
      }
    }

    return mainObj;

  }, url);

  console.log(mainContent);

  const name = mainContent.name;

  await saveFile([mainContent], `./data/artifacts/${name}.json`)
  await browser.close();
};

scraper();
