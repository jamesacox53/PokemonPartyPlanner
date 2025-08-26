import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPartyTxtFile } from '../PokemonPartyPlanner/index.js';

const directoryPathStr = dirname(fileURLToPath(import.meta.url));
const partyFileNameStr = 'Blaziken1.txt';
const pokedexURLStr = 'https://pokemondb.net/pokedex/game/ruby-sapphire-emerald';
const typeOrderURLStr = 'https://pokemondb.net/type';

// const ludicoloObj = {
//     name: 'Ludicolo',
//     attackType: 'Water'
// };

const pokemonPartyArr = ['Blaziken', 'Walrein', 'Shiftry', 'Manectric', 'Rhydon', 'Pelipper'];

const argsObj = {
    directoryPathStr: directoryPathStr,
    partyFileNameStr: partyFileNameStr,
    pokedexURLStr: pokedexURLStr,
    typeOrderURLStr: typeOrderURLStr,
    pokemonPartyArr: pokemonPartyArr
};

createPartyTxtFile(argsObj);