import { exit } from 'node:process';
import { setTimeout } from 'node:timers/promises';
import { parentPort, workerData } from 'node:worker_threads';
import { constants } from 'node:fs';
import { access } from 'node:fs/promises';
import { join } from 'node:path';
import { unit, runCLI, integration } from '@atls/code-runtime/jest';

/// <reference types="../types/index.d.ts" />

// (c) 2020-present Andrea Giammarchi

const {parse: $parse, stringify: $stringify} = JSON;
const {keys} = Object;

const Primitive = String;   // it could be Number
const primitive = 'string'; // it could be 'number'

const ignore = {};
const object = 'object';

const noop = (_, value) => value;

const primitives = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const Primitives = (_, value) => (
  typeof value === primitive ? new Primitive(value) : value
);

const revive = (input, parsed, output, $) => {
  const lazy = [];
  for (let ke = keys(output), {length} = ke, y = 0; y < length; y++) {
    const k = ke[y];
    const value = output[k];
    if (value instanceof Primitive) {
      const tmp = input[value];
      if (typeof tmp === object && !parsed.has(tmp)) {
        parsed.add(tmp);
        output[k] = ignore;
        lazy.push({k, a: [input, parsed, tmp, $]});
      }
      else
        output[k] = $.call(output, k, tmp);
    }
    else if (output[k] !== ignore)
      output[k] = $.call(output, k, value);
  }
  for (let {length} = lazy, i = 0; i < length; i++) {
    const {k, a} = lazy[i];
    output[k] = $.call(output, k, revive.apply(null, a));
  }
  return output;
};

const set = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

/**
 * Converts a specialized flatted string into a JS value.
 * @param {string} text
 * @param {(this: any, key: string, value: any) => any} [reviver]
 * @returns {any}
 */
const parse = (text, reviver) => {
  const input = $parse(text, Primitives).map(primitives);
  const value = input[0];
  const $ = reviver || noop;
  const tmp = typeof value === object && value ?
              revive(input, new Set, value, $) :
              value;
  return $.call({'': tmp}, '', tmp);
};

/**
 * Converts a JS value into a specialized flatted string.
 * @param {any} value
 * @param {((this: any, key: string, value: any) => any) | (string | number)[] | null | undefined} [replacer]
 * @param {string | number | undefined} [space]
 * @returns {string}
 */
const stringify = (value, replacer, space) => {
  const $ = replacer && typeof replacer === object ?
            (k, v) => (k === '' || -1 < replacer.indexOf(k) ? v : void 0) :
            (replacer || noop);
  const known = new Map;
  const input = [];
  const output = [];
  let i = +set(known, input, $.call({'': value}, '', value));
  let firstRun = !i;
  while (i < input.length) {
    firstRun = true;
    output[i] = $stringify(input[i++], replace, space);
  }
  return '[' + output.join(',') + ']';
  function replace(key, value) {
    if (firstRun) {
      firstRun = !firstRun;
      return value;
    }
    const after = $.call(this, key, value);
    switch (typeof after) {
      case object:
        if (after === null) return after;
      case primitive:
        return known.get(after) || set(known, input, after);
    }
    return after;
  }
};

class Tester {
  constructor(cwd) {
    this.cwd = cwd;
  }
  async unit(options, files) {
    process.env.TS_JEST_DISABLE_VER_CHECKER = "true";
    const setup = {
      globalSetup: await this.isConfigExists(".config/test/unit/global-setup.ts") ? join(this.cwd, ".config/test/unit/global-setup.ts") : void 0,
      globalTeardown: await this.isConfigExists(".config/test/unit/global-teardown.ts") ? join(this.cwd, ".config/test/unit/global-teardown.ts") : void 0,
      setupFilesAfterEnv: await this.isConfigExists(".config/test/unit/setup.ts") ? [join(this.cwd, ".config/test/unit/setup.ts")] : []
    };
    const argv = {
      rootDir: this.cwd,
      ci: false,
      detectLeaks: false,
      detectOpenHandles: false,
      errorOnDeprecated: false,
      listTests: false,
      passWithNoTests: true,
      runTestsByPath: false,
      testLocationInResults: true,
      config: JSON.stringify({ ...unit, ...setup }),
      maxConcurrency: 5,
      notifyMode: "failure-change",
      _: files || [],
      $0: "",
      ...options
    };
    const { results } = await runCLI(argv, [this.cwd]);
    return results;
  }
  async integration(options, files) {
    process.env.TS_JEST_DISABLE_VER_CHECKER = "true";
    const setup = {
      globalSetup: await this.isConfigExists(".config/test/integration/global-setup.ts") ? join(this.cwd, ".config/test/integration/global-setup.ts") : void 0,
      globalTeardown: await this.isConfigExists(".config/test/integration/global-teardown.ts") ? join(this.cwd, ".config/test/integration/global-teardown.ts") : void 0,
      setupFilesAfterEnv: await this.isConfigExists(".config/test/integration/setup.ts") ? [join(this.cwd, ".config/test/integration/setup.ts")] : []
    };
    const argv = {
      rootDir: this.cwd,
      ci: false,
      detectLeaks: false,
      detectOpenHandles: false,
      errorOnDeprecated: false,
      listTests: false,
      passWithNoTests: true,
      runTestsByPath: false,
      testLocationInResults: true,
      config: JSON.stringify({ ...integration, ...setup }),
      maxConcurrency: 5,
      notifyMode: "failure-change",
      _: files || [],
      $0: "",
      ...options
    };
    const { results } = await runCLI(argv, [this.cwd]);
    return results;
  }
  async isConfigExists(file) {
    try {
      await access(join(this.cwd, file), constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }
}

const {
  type,
  cwd,
  options,
  files = []
} = workerData;
const execute = async () => {
  const results = type === "unit" ? await new Tester(cwd).unit(options, files) : await new Tester(cwd).integration(options, files);
  try {
    parentPort.postMessage(results);
  } catch {
    parentPort.postMessage(
      parse(
        stringify(results, (_, value) => typeof value === "bigint" ? value.toString() : value)
      )
    );
  }
};
await execute();
await setTimeout(180);
exit(0);
