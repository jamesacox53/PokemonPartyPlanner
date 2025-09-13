import { readFile, writeFile } from 'fs/promises';
import puppeteer from 'puppeteer';

export async function downloadTypesJSONFile(argsObj) {
    const wasLoaded = await loadTypesJSONFile(argsObj);
    if (wasLoaded) return true;

    const wasAdded = await addTypesJSONObj(argsObj);
    if (!wasAdded) return false;

    const wasCreated = await createTypesJSONFile(argsObj);
    return wasCreated;
}

async function loadTypesJSONFile(argsObj) {
    try {
        const typesPathStr = argsObj['typesPathStr'];

        const data = await readFile(typesPathStr, 'utf8');
        if (!data) return;

        const dataStr = data.toString();
        if (!dataStr) return;

        const jsonObj = JSON.parse(dataStr);
        argsObj['typesObj'] = jsonObj;

        return true;

    } catch (err) {
        return false;
    }
}

async function addTypesJSONObj(argsObj) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });

    const typesObj = await getTypesObj(page, argsObj);
    argsObj['typesObj'] = typesObj;

    await browser.close();
    return true;
}

async function getTypesObj(page, argsObj) {
    const typesObj = {};
    const pokedexObj = argsObj['pokedexObj'];

    for (let pokemonNameStr in pokedexObj) {
        const pokemonObj = pokedexObj[pokemonNameStr];
        addPokemonObj(typesObj, pokemonObj);
    }

    await addTypeDefenses(typesObj, page, argsObj);

    const orderedTypesObj = getOrderedTypesObj(typesObj, argsObj);
    return orderedTypesObj;
}

function addPokemonObj(typesObj, pokemonObj) {
    const typeStr = pokemonObj['type'];
    const typeObj = typesObj[typeStr];

    if (typeObj) {
        typeObj['pokemonNames'].push(pokemonObj['name']);
        typeObj['pokemonUrls'].push(pokemonObj['url']);

    } else {
        typesObj[typeStr] = {
            name: typeStr,
            types: pokemonObj['types'],
            pokemonNames: [pokemonObj['name']],
            pokemonUrls: [pokemonObj['url']]
        };
    }
}

async function addTypeDefenses(typesObj, page, argsObj) {
    for (let typeStr in typesObj) {
        const typeObj = typesObj[typeStr];
        typeObj['defense'] = {};

        const defenseObj = await getTypeDefenseObj(typeObj, page, argsObj);
        if (defenseObj) typeObj['defense'] = defenseObj;
    }
}

async function getTypeDefenseObj(typeObj, page, argsObj) {
    const typeStr = typeObj['name'];
    const pokemonURLArr = typeObj['pokemonUrls'];

    for (let pokemonURLStr of pokemonURLArr) {
        const obj = await getDefenseObj(pokemonURLStr, typeStr, page, argsObj);
        if (obj) return obj;
    }
}

async function getDefenseObj(pokemonURLStr, typeStr, page, argsObj) {
    await page.goto(pokemonURLStr);
    const mainHandle = await page.waitForSelector('#main');

    const pokemonTypeStr = await getPokemonTypeStr(mainHandle, page, argsObj);
    if (pokemonTypeStr != typeStr) return;

    const defenseObj = await getDefenseObjFromPage(mainHandle, page);
    return defenseObj;
}

async function getPokemonTypeStr(mainHandle, page, argsObj) {
    const dataHandle = await mainHandle.$('.vitals-table');
    const typeHandleArr = await dataHandle.$$('.type-icon');

    const typeArr = [];

    for (let typeHandle of typeHandleArr) {
        const typeStr = await page.evaluate(h => h.textContent, typeHandle);
        typeArr.push(typeStr);
    }

    const typeOrderObj = argsObj['typeOrderObj'];
    typeArr.sort((a, b) => typeOrderObj[a] - typeOrderObj[b]);

    const resStr = typeArr.join('/');
    return resStr;
}

async function getDefenseObjFromPage(mainHandle, page) {
    const defenseObj = {};
    const typeTableHandleArr = await mainHandle.$$('.type-table');

    const topTypeTableHandle = typeTableHandleArr[0];
    const bottomTypeTableHandle = typeTableHandleArr[1];

    await populateDefenseObj(topTypeTableHandle, defenseObj, page);
    await populateDefenseObj(bottomTypeTableHandle, defenseObj, page);

    return defenseObj;
}

async function populateDefenseObj(typeTableHandle, defenseObj, page) {
    const typeNameArr = await getTypeNameArr(typeTableHandle, page);
    const typeValueArr = await getTypeValueArr(typeTableHandle, page);

    for (let i = 0; i < typeNameArr.length; i++) {
        const typeNameStr = typeNameArr[i];
        const typeValueFlt = typeValueArr[i];

        defenseObj[typeNameStr] = typeValueFlt;
    }
}

async function getTypeNameArr(typeTableHandle, page) {
    const typeNameArr = [];
    const typeHandleArr = await typeTableHandle.$$('.type-cell');

    for (let typeHandle of typeHandleArr) {
        const typeStr = await page.evaluate(h => h.getAttribute('title'), typeHandle);
        typeNameArr.push(typeStr);
    }

    return typeNameArr;
}

async function getTypeValueArr(typeTableHandle, page) {
    const typeValueArr = [];
    const typeFxHandleArr = await typeTableHandle.$$('.type-fx-cell');

    for (let typeFxHandle of typeFxHandleArr) {
        const valueStr = await page.evaluate(h => h.textContent, typeFxHandle);
        const valueFlt = getValueFlt(valueStr);
        typeValueArr.push(valueFlt);
    }

    return typeValueArr;
}

function getValueFlt(valueStr) {
    if (!valueStr) return 1.0;

    const valueFlt = parseFloat(valueStr);
    if (valueFlt) return valueFlt;

    if (valueStr == '½') return 0.5;
    if (valueStr == '¼') return 0.25;
    if (valueStr == '⅛') return 0.125;

    return 0.0;
}

function getOrderedTypesObj(typesObj, argsObj) {
    const keyArr = getKeyArr(typesObj, argsObj);
    keyArr.sort((a, b) => a[1] - b[1]);
    
    const orderedTypesObj = {};

    for (let key of keyArr) {
        const keyStr = key[0];
        orderedTypesObj[keyStr] = typesObj[keyStr];
    }

    return orderedTypesObj;
}

function getKeyArr(typesObj, argsObj) {
    const typeOrderObj = argsObj['typeOrderObj'];
    const keyArr = [];

    const baseInt = Object.keys(typeOrderObj).length + 1;

    for (let typeStr in typesObj) {
        const typeObj = typesObj[typeStr];
        const typesArr = typeObj['types'];
        
        let orderInt = 0;
        let powInt = 1;
        
        for (let typeStr of typesArr) {
            const typeInt = typeOrderObj[typeStr] + 1;
            orderInt += typeInt * (baseInt ** powInt);
            powInt--;
        }

        keyArr.push([typeStr, orderInt]);
    }

    return keyArr;
}

async function createTypesJSONFile({ typesPathStr, typesObj }) {
    try {
        const jsonStr = JSON.stringify(typesObj, null, '\t');
        if (!jsonStr) return false;

        await writeFile(typesPathStr, jsonStr);
        return true;

    } catch (err) {
        return false;
    }
}