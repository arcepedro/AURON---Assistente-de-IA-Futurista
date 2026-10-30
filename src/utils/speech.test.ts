import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_VOICE_CONFIG,
  isMaleVoiceName,
  selectBestPtVoiceFromList,
  cleanTextForSpeech,
  categorizeVoices,
} from './speech.ts';

test('DEFAULT_VOICE_CONFIG has futuristic AI profile parameters', () => {
  assert.equal(DEFAULT_VOICE_CONFIG.rate, 0.90);
  assert.equal(DEFAULT_VOICE_CONFIG.pitch, 0.85);
  assert.equal(DEFAULT_VOICE_CONFIG.profileName, 'Inteligência Artificial Futurista');
  assert.ok(DEFAULT_VOICE_CONFIG.demoPhrase.includes('AURON'));
});

test('isMaleVoiceName accurately detects male identifiers', () => {
  assert.equal(isMaleVoiceName('Microsoft Daniel - Portuguese (Brazil)'), true);
  assert.equal(isMaleVoiceName('Google Felipe (pt-BR)'), true);
  assert.equal(isMaleVoiceName('pt-br-standard-b-male'), true);
  assert.equal(isMaleVoiceName('Ricardo Natural'), true);
  assert.equal(isMaleVoiceName('Microsoft Maria - Portuguese (Brazil)'), false);
  assert.equal(isMaleVoiceName('Google Luciana pt-BR'), false);
  assert.equal(isMaleVoiceName('Victoria (en-US)'), false);
});

test('selectBestPtVoiceFromList prioritizes male Brazilian Portuguese voice', () => {
  const mockVoices: any[] = [
    { name: 'Google US English', lang: 'en-US', voiceURI: 'en_1', default: true },
    { name: 'Google Luciana', lang: 'pt-BR', voiceURI: 'pt_female_1', default: false },
    { name: 'Microsoft Daniel', lang: 'pt-BR', voiceURI: 'pt_male_1', default: false },
    { name: 'Joana', lang: 'pt-PT', voiceURI: 'pt_pt_1', default: false },
  ];

  const best = selectBestPtVoiceFromList(mockVoices);
  assert.ok(best !== null);
  assert.equal(best.voiceURI, 'pt_male_1');
  assert.equal(best.name, 'Microsoft Daniel');
});

test('selectBestPtVoiceFromList honors explicit user selectedURI', () => {
  const mockVoices: any[] = [
    { name: 'Google US English', lang: 'en-US', voiceURI: 'en_1', default: true },
    { name: 'Google Luciana', lang: 'pt-BR', voiceURI: 'pt_female_1', default: false },
    { name: 'Microsoft Daniel', lang: 'pt-BR', voiceURI: 'pt_male_1', default: false },
  ];

  const selected = selectBestPtVoiceFromList(mockVoices, 'pt_female_1');
  assert.ok(selected !== null);
  assert.equal(selected.voiceURI, 'pt_female_1');
});

test('selectBestPtVoiceFromList falls back gracefully if no male voice exists', () => {
  const mockVoices: any[] = [
    { name: 'Google US English', lang: 'en-US', voiceURI: 'en_1', default: true },
    { name: 'Google Luciana', lang: 'pt-BR', voiceURI: 'pt_female_1', default: false },
  ];

  const best = selectBestPtVoiceFromList(mockVoices);
  assert.ok(best !== null);
  assert.equal(best.voiceURI, 'pt_female_1');
});

test('cleanTextForSpeech cleans markdown, code blocks and URLs for speech synthesis', () => {
  const raw = 'Olá **Comandante**! Veja este link: https://google.com e o código: ```console.log(1)```. *Operação* #concluída.';
  const cleaned = cleanTextForSpeech(raw);
  assert.ok(!cleaned.includes('**'));
  assert.ok(!cleaned.includes('https://google.com'));
  assert.ok(!cleaned.includes('console.log'));
  assert.ok(cleaned.includes('Comandante'));
  assert.ok(cleaned.includes('link da web'));
  assert.ok(cleaned.includes('Bloco de código'));
});

test('categorizeVoices classifies and annotates voices correctly', () => {
  const mockVoices: any[] = [
    { name: 'Microsoft Daniel', lang: 'pt-BR', voiceURI: 'pt_1', default: false },
    { name: 'Google Luciana', lang: 'pt-BR', voiceURI: 'pt_2', default: false },
    { name: 'David', lang: 'en-US', voiceURI: 'en_1', default: false },
  ];

  const categorized = categorizeVoices(mockVoices);
  assert.equal(categorized.length, 3);
  assert.equal(categorized[0].recommended, true);
  assert.ok(categorized[0].displayName.includes('Recomendado'));
  assert.equal(categorized[1].recommended, false);
});
