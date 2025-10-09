import { createPartyTxtFile } from './PartyTxtFileWriter.js';

export async function createTxtFile(argsObj) {
    const wasPopulated = populateTypesForParty(argsObj);
    if (!wasPopulated) return false;

    const wasCreated = await createPartyTxtFile(argsObj);
    return wasCreated;
}

function populateTypesForParty(argsObj) {
    const wasAdded = addPartyArr(argsObj);
    if (!wasAdded) return false;

    const wasPopulated = populateTypes(argsObj);
    return wasPopulated;
}

function addPartyArr(argsObj) {
    const pokemonPartyArr = argsObj['pokemonPartyArr'];
    const partyArr = [];

    for (let i = 0; i < pokemonPartyArr.length; i++) {
        const pokemon = pokemonPartyArr[i];
        
        const pokemonObj = getPokemonObj(i, pokemon, argsObj);
        if (pokemonObj) partyArr.push(pokemonObj);
    }

    argsObj['partyArr'] = partyArr;
    return true;
}

function getPokemonObj(i, pokemon, argsObj) {
    if (typeof pokemon == 'string') {
        return getPokemonObjForStr(i, pokemon, argsObj);

    } else if (typeof pokemon == 'object') {
        return getPokemonObjForObj(i, pokemon, argsObj);
    }
}

function getPokemonObjForStr(i, pokemon, argsObj) {
    const pokedexObj = argsObj['pokedexObj'];
    const typesObj = argsObj['typesObj'];
    
    const pokemonObj = pokedexObj[pokemon];
    const defenseTypeObj = typesObj[pokemonObj['type']];

    return {
        name: pokemonObj['name'],
        attackTypes: pokemonObj['types'],
        defenseType: pokemonObj['type'],
        defense: defenseTypeObj['defense'],
        order: i
    };
}

function getPokemonObjForObj(i, pokemon, argsObj) {
    const pokedexObj = argsObj['pokedexObj'];
    const typesObj = argsObj['typesObj'];
    
    const pokemonObj = pokedexObj[pokemon['name']];
    const defenseTypeObj = typesObj[pokemonObj['type']];

    return {
        name: pokemonObj['name'],
        attackTypes: pokemon['attackTypeArr'],
        defenseType: pokemonObj['type'],
        defense: defenseTypeObj['defense'],
        order: i
    };
}

function populateTypes(argsObj) {
    const typesObj = argsObj['typesObj'];
    const partyArr = argsObj['partyArr'];

    for (let typeNameStr in typesObj) {
        const typeObj = typesObj[typeNameStr];
        addVsTypes(typeObj);

        for (let pokemonObj of partyArr) {
            populateTypeObj(pokemonObj, typeObj);
        }
    }

    return true;
}

function addVsTypes(typeObj) {
    typeObj['typeVsParty'] = {
        superEffective: {},
        normalEffective: {},
        notVeryEffective: {},
        notEffective: {}
    };

    typeObj['partyVsType'] = {
        superEffective: {},
        normalEffective: {},
        notVeryEffective: {},
        notEffective: {}
    };
}

function populateTypeObj(pokemonObj, typeObj) {
    populateTypeVsParty(pokemonObj, typeObj);

    populatePartyVsType(pokemonObj, typeObj);
}

function populateTypeVsParty(pokemonObj, typeObj) {
    const pokemonDefenseObj = pokemonObj['defense'];

    const attackTypeArr = typeObj['types'];
    const typeVsPartyObj = typeObj['typeVsParty'];

    for (let attackTypeStr of attackTypeArr) {
        const valFlt = pokemonDefenseObj[attackTypeStr];
        
        const argsObj = {
            valFlt: valFlt,
            pokemonObj: pokemonObj,
            typeStr: attackTypeStr,
            vsObj: typeVsPartyObj
        };
        
        populateVsObj(argsObj);
    }
}

function populateVsObj(argsObj) {
    const valFlt = argsObj['valFlt'];
    
    if (valFlt > 1.0) {
        populateEffectiveObj('superEffective', argsObj);

    } else if (valFlt == 1.0) {
        populateEffectiveObj('normalEffective', argsObj);

    } else if (valFlt < 1.0 && valFlt > 0.0) {
        populateEffectiveObj('notVeryEffective', argsObj);

    } else if (valFlt == 0.0) {
        populateEffectiveObj('notEffective', argsObj);
    }
}

function populateEffectiveObj( effectiveStr, { pokemonObj, typeStr, vsObj }) {
    const effectiveObj = vsObj[effectiveStr];
    const pokemonArr = effectiveObj[typeStr];

    if (pokemonArr) {
        pokemonArr.push(pokemonObj);
    
    } else {
        effectiveObj[typeStr] = [pokemonObj];
    }
}

function populatePartyVsType(pokemonObj, typeObj) {
    const typeDefenseObj = typeObj['defense'];

    const attackTypeArr = pokemonObj['attackTypes'];
    const partyVsTypeObj = typeObj['partyVsType'];

    for (let attackTypeStr of attackTypeArr) {
        const valFlt = typeDefenseObj[attackTypeStr];
        
        const argsObj = {
            valFlt: valFlt,
            pokemonObj: pokemonObj,
            typeStr: attackTypeStr,
            vsObj: partyVsTypeObj
        };
        
        populateVsObj(argsObj);
    }
}