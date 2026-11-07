// @ts-check
// Los animales de las escenas, todos mirando a la derecha y con los pies en
// y = 0, dibujados como son de verdad y sin contorno: la forma la hacen la luz,
// la sombra y el pelo (o las plumas). Cada uno en su modulo: el perro (cuatro
// posturas) en dog.js, el gatito en cat.js, las aves en birds.js y la vaca y la
// cabra en livestock.js; lo que comparten (pelaje, ojos, patas) en fur.js. Cada
// uno ocupa lo mismo que su dibujo anterior, para que las escenas sigan
// diciendo la verdad ("the dog is under the table").

import { dog } from './dog.js';
import { kitten } from './cat.js';
import { duck, chicken, bird } from './birds.js';
import { cow, goat } from './livestock.js';

export const ANIMALS = { dog, kitten, duck, bird, chicken, cow, goat };
