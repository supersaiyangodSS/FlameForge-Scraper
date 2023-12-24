import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import saveFile from './helper/saveFile.js';

const urlArtifact = 'https://wiki.hoyolab.com/pc/genshin/aggregate/artifact';
const urlCharacter = 'https://wiki.hoyolab.com/pc/genshin/aggregate/character';
const urlWeapon = 'https://wiki.hoyolab.com/pc/genshin/aggregate/weapon';

const counterArtifacts = async () => {
  const browser = await puppeteer.launch({ headless: 'new' }); // 'new' should be replaced with 'true' for headless mode
  const page = await browser.newPage();
  await page.goto(urlArtifact);

  const getAllItems = () => {
    const wrapper = document.querySelector('.genshin-show-artifact-wrapper'); // Use document instead of mainContainer
    const allListItems = Array.from(wrapper.querySelectorAll('.genshin-show-artifact-item'));
    return 'Artifacts: ' + allListItems.length;
  };

  const mainContent = await page.evaluate(getAllItems, () => {
    window.scrollTo(0, document.body.scrollHeight)
  });

    if (mainContent) {
    console.log(mainContent);
  } else {
    console.log('Error: Main container not found.');
  }
  await page.waitForTimeout(1000)
  await browser.close();
};

const counterCharacters = async () => {
  const browser = await puppeteer.launch({ headless: 'new' }); // 'new' should be replaced with 'true' for headless mode
  const page = await browser.newPage();
  await page.goto(urlCharacter);

  const getAllItems = () => {
    const wrapper = document.querySelector('.genshin-show-character-wrapper'); // Use document instead of mainContainer
    const allListItems = Array.from(wrapper.querySelectorAll('.character-card .pc'));
    return 'Characters: ' + allListItems.length;
  };

  const mainContent = await page.evaluate(getAllItems, () => {
    window.scrollTo(0, document.body.scrollHeight)
  });

  if (mainContent) {
    console.log(mainContent);
  } else {
    console.log('Error: Main container not found.');
  }

  await browser.close();
};

const counterWeapons = async () => {
  const browser = await puppeteer.launch({ headless: 'new' }); // 'new' should be replaced with 'true' for headless mode
  const page = await browser.newPage();
  await page.goto(urlWeapon);

  const getAllItems = () => {
    const wrapper = document.querySelector('.genshin-show-weapon-wrapper');
    const allListItems = Array.from(wrapper.querySelectorAll('.genshin-show-weapon-item'));
    return 'Weapons: ' + allListItems.length;
  };

  // Scroll to the bottom of the page
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  const mainContent = await page.evaluate(getAllItems);

  if (mainContent) {
    console.log(mainContent);
  } else {
    console.log('Error: Main container not found.');
  }

  await browser.close();
};



await counterCharacters();
await counterWeapons();
await counterArtifacts();
