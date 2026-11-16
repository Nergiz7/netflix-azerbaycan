import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const filename = new URL('../lib/movies.ts', import.meta.url);
const sourceText = readFileSync(filename, 'utf8');
const sourceFile = ts.createSourceFile(filename.pathname, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
const constants = new Map();
let catalog;

function keyName(property) {
  return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : undefined;
}
function readValue(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isIdentifier(node)) return constants.get(node.text);
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(readValue);
  return undefined;
}
function findCatalog(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
    if (node.name.text !== 'catalog' && node.initializer) constants.set(node.name.text, readValue(node.initializer));
    if (node.name.text === 'catalog' && node.initializer && ts.isArrayLiteralExpression(node.initializer)) catalog = node.initializer.elements;
  }
  ts.forEachChild(node, findCatalog);
}
findCatalog(sourceFile);
assert.ok(catalog, 'movies array should be present');
const movies = catalog.map(element => {
  assert.ok(ts.isObjectLiteralExpression(element), 'each catalog entry should be an object');
  const fields = {};
  for (const property of element.properties) {
    if (ts.isPropertyAssignment(property)) fields[keyName(property)] = readValue(property.initializer);
  }
  return fields;
});

test('catalog has at least 30 films and unique IDs', () => {
  assert.ok(movies.length >= 30);
  const ids = movies.map(movie => movie.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('every film has a title, valid year, genre, description, and HTTPS source', () => {
  for (const movie of movies) {
    assert.ok(movie.title?.trim());
    assert.ok(Number.isInteger(movie.year) && movie.year > 1890 && movie.year <= new Date().getFullYear());
    assert.ok(Array.isArray(movie.genres) && movie.genres.length > 0);
    assert.ok(movie.description?.trim());
    assert.ok(/^https:\/\//.test(movie.source));
  }
});

test('classics are all before 1991 and the collection includes newer cinema', () => {
  const classics = movies.filter(movie => movie.kind === 'classic');
  const modern = movies.filter(movie => movie.kind === 'modern');
  assert.ok(classics.length > 0);
  assert.ok(modern.length > 0);
  assert.ok(classics.every(movie => movie.year < 1991));
  assert.ok(modern.every(movie => movie.year >= 1991));
});

test('full-film sources use the verified YouTube provider metadata', () => {
  const films = movies.filter(movie => movie.fullFilm);
  assert.equal(films.length, 26);
  for (const movie of films) {
    assert.equal(movie.provider, 'youtube');
    assert.match(movie.fullFilm, /^https:\/\/www\.youtube\.com\/watch\?v=/);
  }
});

test('every catalog film has its own original, local illustration asset', () => {
  const artwork = movies.map(movie => {
    const file = new URL(`../public/posters/${movie.id}.svg`, import.meta.url);
    const svg = readFileSync(file, 'utf8');
    assert.match(svg, /<svg\s/);
    assert.match(svg, /ORİJİNAL İLLÜSTRASİYA/);
    assert.doesNotMatch(svg, /AZƏRBAYCAN KİNOSU/);
    return svg;
  });
  assert.equal(new Set(artwork).size, movies.length, 'illustrations must not repeat');
});
