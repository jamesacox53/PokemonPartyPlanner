
import path from 'path';
import { downloadTypeOrderJSONFile } from './TypeOrderDownloader.js';
import { downloadPokedexJSONFile } from './PokedexDownloader.js';
import { downloadTypesJSONFile } from './TypeDownloader.js';
import { createTxtFile } from './PartyPlanner.js';

export async function createPartyTxtFile(inputArgsObj) {
    if (!checkInputArgsObj(inputArgsObj)) return;

    const argsObj = createArgsObj(inputArgsObj);

    let wasCreated = await downloadTypeOrderJSONFile(argsObj);
    if (!wasCreated) return;
    
    wasCreated = await downloadPokedexJSONFile(argsObj);
    if (!wasCreated) return;

    wasCreated = await downloadTypesJSONFile(argsObj);
    if (!wasCreated) return;

    wasCreated =  await createTxtFile(argsObj);
    if (!wasCreated) return;
    
    console.log('Successful');
}

function checkInputArgsObj(inputArgsObj) {
    if (!inputArgsObj || typeof inputArgsObj != 'object') {
        console.log('inputArgsObj needs to be an object');
        return false;
    }

    if (!checkTypeOrderURLStr(inputArgsObj)) return false;
    if (!checkPokedexURLStr(inputArgsObj)) return false;
    if (!checkDirectoryPathStr(inputArgsObj)) return false;
    if (!checkPartyFileNameStr(inputArgsObj)) return false;
    if (!checkPokemonPartyArr(inputArgsObj)) return false;

    return true;
}

function checkTypeOrderURLStr(inputArgsObj) {
    let typeOrderURLStr = inputArgsObj['typeOrderURLStr'];
    if (!typeOrderURLStr || typeof typeOrderURLStr != 'string') {
        console.log('typeOrderURLStr needs to be a string.');
        return false;
    }

    typeOrderURLStr = typeOrderURLStr.trim();
    if (!typeOrderURLStr) return false;

    inputArgsObj['typeOrderURLStr'] = typeOrderURLStr;
    return true;
}

function checkPokedexURLStr(inputArgsObj) {
    let pokedexURLStr = inputArgsObj['pokedexURLStr'];
    if (!pokedexURLStr || typeof pokedexURLStr != 'string') {
        console.log('pokedexURLStr needs to be a string.');
        return false;
    }

    pokedexURLStr = pokedexURLStr.trim();
    if (!pokedexURLStr) return false;

    inputArgsObj['pokedexURLStr'] = pokedexURLStr;
    return true;
}

function checkDirectoryPathStr(inputArgsObj) {
    let directoryPathStr = inputArgsObj['directoryPathStr'];
    if (!directoryPathStr || typeof directoryPathStr != 'string') {
        console.log('directoryPathStr needs to be a string.');
        return false;
    }

    directoryPathStr = directoryPathStr.trim();
    if (!directoryPathStr) return false;

    inputArgsObj['directoryPathStr'] = directoryPathStr;
    return true;
}

function checkPartyFileNameStr(inputArgsObj) {
    let partyFileNameStr = inputArgsObj['partyFileNameStr'];
    if (!partyFileNameStr || typeof partyFileNameStr != 'string') {
        console.log('partyFileNameStr needs to be a string.');
        return false;
    }

    partyFileNameStr = partyFileNameStr.trim();
    if (!partyFileNameStr) return false;

    inputArgsObj['partyFileNameStr'] = partyFileNameStr;
    return true;
}

function checkPokemonPartyArr(inputArgsObj) {
    const pokemonPartyArr = inputArgsObj['pokemonPartyArr'];
    if (!pokemonPartyArr || typeof pokemonPartyArr != 'object') {
        console.log('pokemonPartyArr needs to be an array.');
        return false;
    }

    return true;
}

function createArgsObj(inputArgsObj) {
    const argsObj = {...inputArgsObj};

    addTypeOrderPathStr(argsObj);
    addPokedexPathStr(argsObj);
    addTypesPathStr(argsObj);
    addPartyTxtPathStr(argsObj);

    return argsObj;
}

function addTypeOrderPathStr(argsObj) {
    const directoryPathStr = argsObj['directoryPathStr'];
    const typeOrderPathStr = path.join(directoryPathStr, 'typeOrder.json');

    argsObj['typeOrderPathStr'] = typeOrderPathStr;
}

function addPokedexPathStr(argsObj) {
    const directoryPathStr = argsObj['directoryPathStr'];
    const pokedexPathStr = path.join(directoryPathStr, 'pokedex.json');

    argsObj['pokedexPathStr'] = pokedexPathStr;
}

function addTypesPathStr(argsObj) {
    const directoryPathStr = argsObj['directoryPathStr'];
    const typesPathStr = path.join(directoryPathStr, 'types.json');
    
    argsObj['typesPathStr'] = typesPathStr;
}

function addPartyTxtPathStr(argsObj) {
    const directoryPathStr = argsObj['directoryPathStr'];
    const partyFileNameStr = argsObj['partyFileNameStr'];
    const partyTxtPathStr = path.join(directoryPathStr, partyFileNameStr);

    argsObj['partyTxtPathStr'] = partyTxtPathStr;
}