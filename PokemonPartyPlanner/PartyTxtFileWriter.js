import { writeFile } from 'fs/promises';

export async function createPartyTxtFile(argsObj) {
    const wasAdded = addPartyTxtStr(argsObj);
    if (!wasAdded) return;

    const wasCreated = await createTxtFile(argsObj);
    return wasCreated;
}

function addPartyTxtStr(argsObj) {
    let txtStr = getPartyInfoTextStr(argsObj);
    txtStr += '\n';

    txtStr += getWhatToGoForTxtStr(argsObj);
    txtStr += '\n';

    txtStr += getTypesSummaryTxtStr(argsObj);
    txtStr += '\n'

    txtStr += getTypesFullTxtStr(argsObj);

    argsObj['partyTxtStr'] = txtStr;
    return true;
}

function getPartyInfoTextStr(argsObj) {
    const partyArr = argsObj['partyArr'];
    let txtStr = 'Pokemon Party:\n';

    const nameArr = partyArr.map(pokemonObj => {
        return pokemonObj['name'];
    });

    txtStr += '[' + nameArr.join(', ') + ']\n';
    return txtStr;
}

function getWhatToGoForTxtStr(argsObj) {
    let txtStr = 'What To Go For:\n';
    addWhatToGoForTxtObj(argsObj);

    txtStr += getPartyWhatToGoForTxt(argsObj);
    txtStr += '\n';

    txtStr += getTypesWhatToGoForTxt(argsObj);
    return txtStr;
}

function addWhatToGoForTxtObj(argsObj) {
    addTypeSummaryObj(argsObj);

    addPartyWhatToGoForObj(argsObj);

    addTypesWhatToGoForObj(argsObj);
}

function addTypeSummaryObj(argsObj) {
    const typesObj = argsObj['typesObj'];

    const typeSummaryObj = {};

    for (let nameStr in typesObj) {
        const typeObj = typesObj[nameStr];

        const summaryObj = getSummaryObj(typeObj);
        typeSummaryObj[nameStr] = summaryObj;
    }

    argsObj['typeSummaryObj'] = typeSummaryObj;
}

function getSummaryObj(typeObj) {
    const partyVsTypeObj = typeObj['partyVsType'];
    const pvtPokemonObj = getPVTJustPokemonVsObj(partyVsTypeObj);

    const typeVsPartyObj = typeObj['typeVsParty'];
    const tvpPokemonObj = getTVPJustPokemonVsObj(typeVsPartyObj);

    const summaryObj = getEffectiveSummaryObj(pvtPokemonObj, tvpPokemonObj);
    return summaryObj;
}

function getPVTJustPokemonVsObj(vsObj) {
    const resObj = {};

    for (let effectiveStr in vsObj) {
        resObj[effectiveStr] = getJustPokemonObj(effectiveStr, vsObj);
    }

    return resObj;
}

function getJustPokemonObj(effectiveStr, vsObj) {
    const effectObj = vsObj[effectiveStr];

    const resObj = {};
    const pokemonArrs = Object.values(effectObj);

    for (let pokemonArr of pokemonArrs) {
        for (let pokemon of pokemonArr) {
            resObj[pokemon['name']] = pokemon;
        }
    }

    return resObj;
}

function getTVPJustPokemonVsObj(vsObj) {
    return {
        'superEffective': getJustPokemonObj('superEffective', vsObj)
    };
}

function getEffectiveSummaryObj(pvtPokemonObj, tvpPokemonObj) {
    const summaryObj = {};

    for (let effectiveStr in pvtPokemonObj) {
        const effectiveObj = pvtPokemonObj[effectiveStr];

        const obj = {
            pvtPokemon: [],
            tvpSupEffPokemon: []
        };

        for (let pokemonNameStr in effectiveObj) {
            const pokemonObj = effectiveObj[pokemonNameStr];

            if (tvpPokemonObj['superEffective'][pokemonNameStr]) {
                obj['tvpSupEffPokemon'].push(pokemonObj);

            } else {
                obj['pvtPokemon'].push(pokemonObj);
            }
        }

        summaryObj[effectiveStr] = obj;
    }

    return summaryObj;
}

function addPartyWhatToGoForObj(argsObj) {
    const typeSummaryObj = argsObj['typeSummaryObj'];
    const partyArr = argsObj['partyArr'];

    const partyObj = {};

    for (let pokemonObj of partyArr) {
        partyObj[pokemonObj['name']] = [];
    }

    for (let typeNameStr in typeSummaryObj) {
        const summaryObj = typeSummaryObj[typeNameStr];

        const pokemonObj = getWhatToGoForPokemonObj(summaryObj);
        if (!pokemonObj) continue;

        partyObj[pokemonObj['name']].push(typeNameStr);
    }

    argsObj['partyWhatToGoForObj'] = partyObj;
}

function getWhatToGoForPokemonObj(summaryObj) {
    const pokemonOrderArr = [
        ['superEffective', 'pvtPokemon'],
        ['normalEffective', 'pvtPokemon'],
        ['superEffective', 'tvpSupEffPokemon'],
        ['notVeryEffective', 'pvtPokemon'],
        ['notEffective', 'pvtPokemon'],
        ['normalEffective', 'tvpSupEffPokemon'],
        ['notVeryEffective', 'tvpSupEffPokemon'],
        ['notEffective', 'tvpSupEffPokemon']
    ];

    for (let orderArr of pokemonOrderArr) {
        const pokemonArr = summaryObj[orderArr[0]][orderArr[1]];
        if (pokemonArr.length > 0) return pokemonArr[0];
    }
}

function addTypesWhatToGoForObj(argsObj) {
    const typeSummaryObj = argsObj['typeSummaryObj'];

    const typesObj = {};

    for (let typeNameStr in typeSummaryObj) {
        const summaryObj = typeSummaryObj[typeNameStr];

        const pokemonObj = getWhatToGoForPokemonObj(summaryObj);
        if (!pokemonObj) continue;

        typesObj[typeNameStr] = pokemonObj['name'];
    }

    argsObj['typesWhatToGoForObj'] = typesObj;
}

function getPartyWhatToGoForTxt(argsObj) {
    let txtStr = 'Party:\n';
    const txtArr = [];

    const partyObj = argsObj['partyWhatToGoForObj'];

    for (let pokemonNameStr in partyObj) {
        const typeNameArr = partyObj[pokemonNameStr];
        if (typeNameArr.length < 1) continue;

        const typeNameStr = `[${typeNameArr.join(', ')}]`;
        txtArr.push(pokemonNameStr + ': ' + typeNameStr);
    }

    txtStr += txtArr.join('\n') + '\n';
    return txtStr;
}

function getTypesWhatToGoForTxt(argsObj) {
    let txtStr = 'Types:\n';
    const txtArr = [];

    const typesObj = argsObj['typesWhatToGoForObj'];

    for (let typeNameStr in typesObj) {
        const pokemonNameStr = typesObj[typeNameStr];
        if (!pokemonNameStr) continue;

        txtArr.push(typeNameStr + ' -> ' + pokemonNameStr);
    }

    txtStr += txtArr.join('\n') + '\n';
    return txtStr;
}

function getTypesSummaryTxtStr(argsObj) {
    let txtStr = 'Type Summary:\n';
    const txtArr = [];

    addSummaryTxtObj(argsObj);
    const summaryTxtObj = argsObj['summaryTxtObj'];

    for (let nameStr in summaryTxtObj) {
        const summaryTxtStr = summaryTxtObj[nameStr];
        txtArr.push(nameStr + ' -> ' + summaryTxtStr);
    }

    txtStr += txtArr.join('\n') + '\n';
    return txtStr;
}

function addSummaryTxtObj(argsObj) {
    const typeSummaryObj = argsObj['typeSummaryObj'];

    const summaryTxtObj = {};

    for (let typeNameStr in typeSummaryObj) {
        const summaryObj = typeSummaryObj[typeNameStr];

        const summaryTxtStr = getSummaryTxtStr(summaryObj);
        summaryTxtObj[typeNameStr] = summaryTxtStr;
    }

    argsObj['summaryTxtObj'] = summaryTxtObj;
}

function getSummaryTxtStr(summaryObj) {
    const bestOptionStr = getSummaryBestOptionStr(summaryObj);
    if (bestOptionStr) return bestOptionStr;

    const secondOptionStr = getSummarySecondOptionStr(summaryObj);
    if (secondOptionStr) return secondOptionStr;

    const thirdOptionStr = getSummaryThirdOptionStr(summaryObj);
    if (thirdOptionStr) return thirdOptionStr;

    const lastOptionStr = getSummaryLastOptionStr(summaryObj);
    if (lastOptionStr) return lastOptionStr;

    return 'No Sup Eff. No Nor Eff. No Not Very Eff.';
}

function getSummaryBestOptionStr(summaryObj) {
    const supEffObj = summaryObj['superEffective'];
    const supEffPokemonArr = supEffObj['pvtPokemon'];

    if (supEffPokemonArr.length < 1) return;

    supEffPokemonArr.sort((a, b) => a['order'] - b['order']);
    const supEffNameArr = supEffPokemonArr.map(obj => obj['name']);

    return '[' + supEffNameArr.join(', ') + ']';
}

function getSummarySecondOptionStr(summaryObj) {
    const supEffObj = summaryObj['superEffective'];
    const supEffAgPokemonArr = supEffObj['tvpSupEffPokemon'];

    if (supEffAgPokemonArr.length < 1) return;

    supEffAgPokemonArr.sort((a, b) => a['order'] - b['order']);
    const supEffAgNameArr = supEffAgPokemonArr.map(obj => obj['name']);

    const norEffObj = summaryObj['normalEffective'];
    const norEffPokemonArr = norEffObj['pvtPokemon'];

    norEffPokemonArr.sort((a, b) => a['order'] - b['order']);
    const norEffNameArr = norEffPokemonArr.map(obj => obj['name']);

    return 'Sup Eff A/E: [' + supEffAgNameArr.join(', ') + '] ' +
        'Nor Eff: [' + norEffNameArr.join(', ') + ']';
}

function getSummaryThirdOptionStr(summaryObj) {
    const norEffObj = summaryObj['normalEffective'];
    const norEffPokemonArr = norEffObj['pvtPokemon'];

    if (norEffPokemonArr.length < 1) return;

    norEffPokemonArr.sort((a, b) => a['order'] - b['order']);
    const norEffNameArr = norEffPokemonArr.map(obj => obj['name']);

    return 'No Sup Eff. Nor Eff: [' + norEffNameArr.join(', ') + ']';
}

function getSummaryLastOptionStr(summaryObj) {
    const notVeryEffObj = summaryObj['notVeryEffective'];
    const notVeryEffPokemonArr = notVeryEffObj['pvtPokemon'];

    if (notVeryEffPokemonArr.length < 1) return;

    notVeryEffPokemonArr.sort((a, b) => a['order'] - b['order']);
    const notVeryEffNameArr = notVeryEffPokemonArr.map(obj => obj['name']);

    return 'No Sup Eff. No Nor Eff. Not Very Eff: [' + notVeryEffNameArr.join(', ') + ']';
}

function getTypesFullTxtStr(argsObj) {
    addFullTxtObj(argsObj);

    let txtStr = 'Full Type Breakdown:\n';
    const fullTxtObj = argsObj['fullTxtObj'];

    const txtArr = [];
    const sepStr = `\n${'-'.repeat(80)}\n`;

    for (let typeNameStr in fullTxtObj) {
        const typeTxtObj = fullTxtObj[typeNameStr];

        const typeStr = getDFSFullTxtStr(typeTxtObj, 1);
        txtArr.push(typeNameStr += ':\n' + typeStr);
    }

    txtStr += txtArr.join(sepStr);
    return txtStr;
}

function addFullTxtObj(argsObj) {
    const fullTxtObj = {};
    const typesObj = argsObj['typesObj'];

    for (let nameStr in typesObj) {
        const typeObj = typesObj[nameStr];

        const typeTxtObj = getTypeTxtObj(typeObj, argsObj);
        fullTxtObj[nameStr] = typeTxtObj;
    }

    argsObj['fullTxtObj'] = fullTxtObj;
}

function getTypeTxtObj(typeObj, argsObj) {
    const txtObj = {};
    const typeNameStr = typeObj['name'];

    const summary = 'Summary Text';
    txtObj[summary] = getFullSummaryTxtStr(typeObj, argsObj);

    const pvt = `Party vs ${typeNameStr}`;
    txtObj[pvt] = getVsTypeTxtObj('partyVsType', typeObj, argsObj);

    const tvp = `${typeNameStr} vs Party`;
    txtObj[tvp] = getVsTypeTxtObj('typeVsParty', typeObj, argsObj);

    const pokemon = `${typeNameStr} Pokemon`;
    txtObj[pokemon] = typeObj['pokemonNames'];

    return txtObj;
}

function getFullSummaryTxtStr(typeObj, argsObj) {
    const summaryTxtObj = argsObj['summaryTxtObj'];
    const nameStr = typeObj['name'];

    return summaryTxtObj[nameStr];
}

function getVsTypeTxtObj(vsStr, typeObj, argsObj) {
    const vsTxtObj = {};
    const vsObj = typeObj[vsStr];

    const effectiveTxtObj = {
        superEffective: 'Super Effective',
        normalEffective: 'Normal Effective',
        notVeryEffective: 'Not Very Effective',
        notEffective: 'Not Effective'
    };

    for (let effStr in effectiveTxtObj) {
        const txtStr = effectiveTxtObj[effStr];
        vsTxtObj[txtStr] = getEffTxtArr(effStr, vsObj, argsObj);
    }

    return vsTxtObj;
}

function getEffTxtArr(effStr, vsObj, argsObj) {
    const effObj = vsObj[effStr];

    const typeKVArr = Object.entries(effObj);
    const typeOrderObj = argsObj['typeOrderObj'];
    typeKVArr.sort((a, b) => typeOrderObj[a[0]] - typeOrderObj[b[0]]);

    const strArr = getTypeKVStrArr(typeKVArr);
    return strArr;
}

function getTypeKVStrArr(typeKVArr) {
    const strArr = typeKVArr.map(([typeStr, pokemonArr]) => {
        const pokemonNameArr = pokemonArr.map(obj => obj['name']);
        return typeStr + ': [' + pokemonNameArr.join(', ') + ']';
    });

    return strArr;
}

function getDFSFullTxtStr(elem, depthInt) {
    if (Array.isArray(elem)) {
        return getDFSArrStr(elem, depthInt);

    } else if (typeof elem == 'object') {
        return getDFSObjStr(elem, depthInt);

    } else if (typeof elem == 'string') {
        return '\t'.repeat(depthInt) + elem;

    } else {
        return '';
    }
}

function getDFSArrStr(arr, depthInt) {
    let resArr = [];

    for (let child of arr) {
        const childStr = getDFSFullTxtStr(child, depthInt);
        if (!childStr) continue;

        resArr.push(childStr);
    }

    if (resArr.length < 1) return '';

    return resArr.join('\n');
}

function getDFSObjStr(obj, depthInt) {
    let resArr = [];

    for (let childKey in obj) {
        const childVal = obj[childKey];

        const childStr = getDFSFullTxtStr(childVal, depthInt + 1);
        if (!childStr) continue;

        resArr.push('\t'.repeat(depthInt) + childKey + ':\n' + childStr);
    }

    if (resArr.length < 1) return '';

    return resArr.join('\n');
}

async function createTxtFile({ partyTxtPathStr, partyTxtStr }) {
    try {
        console.log(partyTxtStr);
        await writeFile(partyTxtPathStr, partyTxtStr);
        return true;

    } catch (err) {
        return false;
    }
}