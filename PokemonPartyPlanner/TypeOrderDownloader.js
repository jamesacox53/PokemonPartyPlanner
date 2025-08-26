import { readFile, writeFile } from 'fs/promises';
import puppeteer from 'puppeteer';

export async function downloadTypeOrderJSONFile(argsObj) {
    const wasLoaded = await loadTypeOrderJSONFile(argsObj);
    if (wasLoaded) return true;

    const wasAdded = await addTypeOrderJSONObj(argsObj);
    if (!wasAdded) return false;

    const wasCreated = await createTypeOrderJSONFile(argsObj);
    return wasCreated;
}

async function loadTypeOrderJSONFile(argsObj) {
    try {
        const typeOrderPathStr = argsObj['typeOrderPathStr'];

        const data = await readFile(typeOrderPathStr, 'utf8');
        if (!data) return;

        const dataStr = data.toString();
        if (!dataStr) return;

        const jsonObj = JSON.parse(dataStr);
        argsObj['typeOrderObj'] = jsonObj;
        
        return true;

    } catch (err) {
        return false;
    }
}

async function addTypeOrderJSONObj(argsObj) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1080, height: 1024 });
    await page.goto(argsObj['typeOrderURLStr']);

    const typeOrderObj = await getTypeOrderObj(page);
    argsObj['typeOrderObj'] = typeOrderObj;
    
    await browser.close();
    return true;
}

async function getTypeOrderObj(page) {
    const mainHandle = await page.waitForSelector('#main');
    const typeGridHandle = await mainHandle.$('.grid-col');
    const typeHandleArr = await typeGridHandle.$$('.type-icon');

    const typeOrderObj = getTypeObj(typeHandleArr, page);
    return typeOrderObj;
}

async function getTypeObj(typeHandleArr, page) {
    const typeOrderObj = {};
    
    for (let i = 0; i < typeHandleArr.length; i++) {
        const typeHandle = typeHandleArr[i];
        const textStr = await page.evaluate(h => h.textContent, typeHandle);
        
        typeOrderObj[textStr] = i;
    }

    return typeOrderObj;
}

async function createTypeOrderJSONFile({ typeOrderPathStr, typeOrderObj }) {
    try {
        const jsonStr = JSON.stringify(typeOrderObj, null, '\t');
        if (!jsonStr) return false;

        await writeFile(typeOrderPathStr, jsonStr);
        return true;

    } catch (err) {
        return false;
    }
}