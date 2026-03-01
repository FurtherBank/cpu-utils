import { capitalise, isDefined, unique } from '@monorepo-template/utils';

const names = ['alice', 'bob', 'alice', 'charlie'];
const uniqueNames = unique(names);

console.log('Unique names:', uniqueNames.map(capitalise));

const values: (string | null | undefined)[] = ['hello', null, 'world', undefined];
const defined = values.filter(isDefined);

console.log('Defined values:', defined);
