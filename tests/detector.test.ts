const fs = require('fs');
const path = require('path');
const { NudeNetDetector } = require('../dist/core/detector');

describe('NudeNetDetector', () => {
  let detector: NudeNetDetector;

  beforeAll(async () => {
    detector = new NudeNetDetector({ debug: false, minScore: 0.5 });
  });

  afterAll(async () => {
    detector.dispose();
  });

  test('detector should be created', () => {
    expect(detector).toBeDefined();
  });

  test('loadModel should exist', () => {
    expect(typeof detector.loadModel).toBe('function');
  });

  test('isLoaded should return false before loading', () => {
    expect(detector.isLoaded()).toBe(false);
  });

  test('getVersion should return unknown before loading', () => {
    expect(detector.getVersion()).toBe('unknown');
  });

  test('detect should throw if model not loaded', async () => {
    await expect(detector.detect('nonexistent.jpg')).rejects.toThrow();
  });
});

describe('Config', () => {
  test('defaultOptions should have required fields', () => {
    const { defaultOptions } = require('../dist/core/config');
    expect(defaultOptions.minScore).toBeDefined();
    expect(defaultOptions.maxResults).toBeDefined();
    expect(defaultOptions.outputNodes).toBeDefined();
  });

  test('defaultModelConfig should have base and default models', () => {
    const { defaultModelConfig } = require('../dist/core/config');
    expect(defaultModelConfig.base).toBeDefined();
    expect(defaultModelConfig.default).toBeDefined();
    expect(defaultModelConfig.base.classes.length).toBeGreaterThan(0);
    expect(defaultModelConfig.default.classes.length).toBeGreaterThan(0);
  });
});
