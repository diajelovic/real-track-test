'use strict';

import * as fs from 'fs';
import { parseTrack } from './track';

const HEROES_FOLDER_NAME = 'heroes'

class Hero {
    constructor(name, house, track) {
        this.name = name;
        this.house = house;
        this.track = track;
    }
}

function parseHero(heroJson) {
    return new Hero(heroJson.name, heroJson.house, parseTrack(heroJson.wayPoints));
}

export function loadHeroes() {
    const files = fs.readdirSync(HEROES_FOLDER_NAME);
    const heroes = [];

    files.forEach(file => {
        const buffer = fs.readFileSync(HEROES_FOLDER_NAME + "/" + file);
        heroes.push(parseHero(JSON.parse(buffer)));
    });

    return heroes;
}
