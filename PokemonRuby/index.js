import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPartyTxtFile } from '../PokemonPartyPlanner/index.js';

const directoryPathStr = dirname(fileURLToPath(import.meta.url));
const partyFileNameStr = 'EarlyGame1.txt';
const pokedexURLStr = 'https://pokemondb.net/pokedex/game/ruby-sapphire-emerald';
const typeOrderURLStr = 'https://pokemondb.net/type';

const groudonObj = {
    name: 'Groudon',
    attackTypeArr: ['Ground', 'Fire']
};

const gyaradosObj = {
    name: 'Gyarados',
    attackTypeArr: ['Water', 'Ice']
};

const sceptileObj = {
    name: 'Sceptile',
    attackTypeArr: ['Grass', 'Fighting']
};

const magnetonObj = {
    name: 'Magneton',
    attackTypeArr: ['Electric']
};

const salamenceObj = {
    name: 'Salamence',
    attackTypeArr: ['Flying', 'Dragon', 'Dark']
};

const pokemonPartyArr = ['Camerupt', gyaradosObj, sceptileObj, magnetonObj, 'Gardevoir', salamenceObj];

const argsObj = {
    directoryPathStr: directoryPathStr,
    partyFileNameStr: partyFileNameStr,
    pokedexURLStr: pokedexURLStr,
    typeOrderURLStr: typeOrderURLStr,
    pokemonPartyArr: pokemonPartyArr
};

createPartyTxtFile(argsObj);