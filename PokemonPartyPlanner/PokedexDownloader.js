import { readFile, writeFile } from 'fs/promises';
import puppeteer from 'puppeteer';

export async function downloadPokedexJSONFile(argsObj) {
    const wasLoaded = await loadPokedexJSONFile(argsObj);
    if (wasLoaded) return true;

    const wasAdded = await addPokedexJSONObj(argsObj);
    if (!wasAdded) return false;

    const wasCreated = await createPokedexJSONFile(argsObj);
    return wasCreated;
}

async function loadPokedexJSONFile(argsObj) {
    try {
        const pokedexPathStr = argsObj['pokedexPathStr'];

        const data = await readFile(pokedexPathStr, 'utf8');
        if (!data) return;

        const dataStr = data.toString();
        if (!dataStr) return;

        const jsonObj = JSON.parse(dataStr);
        argsObj['pokedexObj'] = jsonObj;
        
        return true;

    } catch (err) {
        return false;
    }
}

async function addPokedexJSONObj(argsObj) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(argsObj['pokedexURLStr']);

    const pokedexObj = await getPokdexObj(page, argsObj);
    argsObj['pokedexObj'] = pokedexObj;
    
    await browser.close();
    return true;
}

async function getPokdexObj(page, argsObj) {
    addPokedexBaseURL(argsObj);
    const pokedexObj = {};
    
    const infoCardListHandle = await page.waitForSelector('.infocard-list');
    const infoCardHandleArr = await infoCardListHandle.$$('.infocard');

    for (let infoCardHandle of infoCardHandleArr) {
        const pokemonObj = await getPokemonObj(infoCardHandle, page, argsObj);
        pokedexObj[pokemonObj['name']] = pokemonObj;
    }

    return pokedexObj;
}

function addPokedexBaseURL(argsObj) {
    const pokedexURLStr = argsObj['pokedexURLStr'];
    
    const urlPartsArr = pokedexURLStr.split('/');
    const baseURLStr = urlPartsArr[0] + '//' + urlPartsArr[2];

    argsObj['pokedexBaseURLstr'] = baseURLStr;
}

async function getPokemonObj(infoCardHandle, page, argsObj) {
    const pokemonObj = {
        name: '',
        number: '',
        url: '',
        type: '',
        types: []
    };

    const nameStr = await getPokemonNameStr(infoCardHandle, page);
    if (nameStr) pokemonObj['name'] = nameStr;

    const numberStr = await getPokemonNumberStr(infoCardHandle, page);
    if (numberStr) pokemonObj['number'] = numberStr;

    const urlStr = await getPokemonURLStr(infoCardHandle, page, argsObj);
    if (urlStr) pokemonObj['url'] = urlStr;
    
    const typeArr = await getPokemonTypeArr(infoCardHandle, page, argsObj);
    if (typeArr) {
        pokemonObj['type'] = typeArr.join('/');
        pokemonObj['types'] = typeArr;
    }

    return pokemonObj;
}

async function getPokemonNameStr(infoCardHandle, page) {
    const nameHandle = await infoCardHandle.$('.ent-name');
    const textStr = await page.evaluate(h => h.textContent, nameHandle);

    return textStr;
}

async function getPokemonNumberStr(infoCardHandle, page) {
    const numberHandle = await infoCardHandle.$('small');
    const textStr = await page.evaluate(h => h.textContent, numberHandle);

    return textStr;
}

async function getPokemonURLStr(infoCardHandle, page, argsObj) {
    const baseURLStr = argsObj['pokedexBaseURLstr'];
    const nameHandle = await infoCardHandle.$('.ent-name');
    const hrefStr = await page.evaluate(h => h.getAttribute('href'), nameHandle);

    return baseURLStr + hrefStr;
}

async function getPokemonTypeArr(infoCardHandle, page, argsObj) {
    const typeHandleArr = await infoCardHandle.$$('.itype');

    const typeArr = [];

    for (let typeHandle of typeHandleArr) {
        const typeStr = await page.evaluate(h => h.textContent, typeHandle);
        typeArr.push(typeStr);
    }

    const typeOrderObj = argsObj['typeOrderObj'];
    typeArr.sort((a,b) => typeOrderObj[a] - typeOrderObj[b]);
    
    return typeArr;
}

async function createPokedexJSONFile({ pokedexPathStr, pokedexObj }) {
    try {
        const jsonStr = JSON.stringify(pokedexObj, null, '\t');
        if (!jsonStr) return false;

        await writeFile(pokedexPathStr, jsonStr);
        return true;

    } catch (err) {
        return false;
    }
}