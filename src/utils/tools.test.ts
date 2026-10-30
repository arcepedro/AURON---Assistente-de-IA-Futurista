import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSafeMath, formatSystemTime, requiresSecurityAuthorization } from './tools.ts';
import { filterMemories, categorizeMemoryText, INITIAL_SEED_MEMORIES } from './memory.ts';

test('evaluateSafeMath computes standard arithmetic expressions correctly', () => {
  const res1 = evaluateSafeMath('25 * 4 + 10');
  assert.equal(res1.success, true);
  assert.equal(res1.result, 110);

  const res2 = evaluateSafeMath('(100 - 20) / 4');
  assert.equal(res2.success, true);
  assert.equal(res2.result, 20);

  const res3 = evaluateSafeMath('Math.sqrt(144) + 8');
  assert.equal(res3.success, true);
  assert.equal(res3.result, 20);
});

test('evaluateSafeMath handles Brazilian comma decimal syntax and symbols', () => {
  const res = evaluateSafeMath('10,5 * 2');
  assert.equal(res.success, true);
  assert.equal(res.result, 21);
});

test('evaluateSafeMath rejects invalid characters or dangerous tokens', () => {
  const res1 = evaluateSafeMath('alert(1)');
  assert.equal(res1.success, false);

  const res2 = evaluateSafeMath('process.exit()');
  assert.equal(res2.success, false);

  const res3 = evaluateSafeMath('');
  assert.equal(res3.success, false);
});

test('formatSystemTime returns structured Brazilian Portuguese time info', () => {
  const t = formatSystemTime(new Date('2026-10-30T12:00:00Z'));
  assert.ok(t.timeStr.length > 0);
  assert.ok(t.dateStr.length > 0);
  assert.ok(t.fullDescription.includes('Brasília'));
});

test('requiresSecurityAuthorization flags high-risk destructive actions', () => {
  assert.equal(requiresSecurityAuthorization('system_purge'), true);
  assert.equal(requiresSecurityAuthorization('manage_memory', { action: 'delete_all' }), true);
  assert.equal(requiresSecurityAuthorization('get_system_time_and_date'), false);
  assert.equal(requiresSecurityAuthorization('calculate_expression', { expr: '2+2' }), false);
});

test('filterMemories filters correctly by query and category', () => {
  const results1 = filterMemories(INITIAL_SEED_MEMORIES, 'AURON');
  assert.ok(results1.length >= 1);
  assert.equal(results1[0].id, 'mem_proj_1');

  const results2 = filterMemories(INITIAL_SEED_MEMORIES, '', 'instrucoes');
  assert.equal(results2.length, 1);
  assert.equal(results2[0].category, 'instrucoes');
});

test('categorizeMemoryText infers appropriate category', () => {
  assert.equal(categorizeMemoryText('Sempre prefiro que me chame de Comandante'), 'preferencias');
  assert.equal(categorizeMemoryText('Novo projeto de automação residencial'), 'projetos');
  assert.equal(categorizeMemoryText('Nunca execute ações sem confirmação'), 'instrucoes');
});
