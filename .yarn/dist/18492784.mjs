import { parentPort, workerData } from 'node:worker_threads';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ts } from '@atls/code-runtime/typescript';

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

const tsconfig = {
  compilerOptions: {
    lib: ["dom", "dom.iterable", "esnext"],
    declaration: false,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    importHelpers: false,
    isolatedModules: false,
    moduleResolution: "NodeNext",
    noFallthroughCasesInSwitch: true,
    noImplicitAny: true,
    noImplicitReturns: true,
    noImplicitThis: true,
    noUnusedLocals: false,
    noUnusedParameters: false,
    pretty: true,
    removeComments: true,
    resolveJsonModule: true,
    strict: true,
    strictPropertyInitialization: false,
    sourceMap: false,
    module: "NodeNext",
    target: "es2022",
    jsx: "react",
    outDir: "./dist"
  },
  exclude: [
    "**/*/next-env.d.ts",
    "integration",
    "node_modules",
    "src/**/*.spec.ts",
    "src/**/*.test.ts",
    "src/**/*.story.ts",
    "src/**/*.stories.ts",
    "**/*/dist/**/*.d.ts",
    "integration/**/*.test.ts",
    ".idea"
  ]
};

const transformJsxToJsExtension = (ctx) => {
  const visitor = (node) => {
    const { moduleSpecifier } = node;
    if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
      if (ts.isImportDeclaration(node)) {
        if (moduleSpecifier.text.endsWith(".jsx")) {
          return ctx.factory.updateImportDeclaration(
            node,
            node.modifiers,
            node.importClause,
            ctx.factory.createStringLiteral(moduleSpecifier.text.replace(".jsx", ".js")),
            node.assertClause
          );
        }
      }
      if (ts.isExportDeclaration(node)) {
        return ctx.factory.updateExportDeclaration(
          node,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          ctx.factory.createStringLiteral(moduleSpecifier.text.replace(".jsx", ".js")),
          node.assertClause
        );
      }
    }
    return ts.visitEachChild(node, visitor, ctx);
  };
  return (sf) => ts.visitNode(sf, visitor);
};

class TypeScript {
  constructor(cwd) {
    this.cwd = cwd;
  }
  async check(include = []) {
    return this.run(include);
  }
  async build(include = [], override = {}) {
    return this.run(include, override, false);
  }
  async run(include = [], override = {}, noEmit = true) {
    const projectIgnorePatterns = this.getProjectIgnorePatterns();
    const skipLibCheck = this.getLibCheckOption();
    const config = {
      ...tsconfig,
      compilerOptions: {
        ...tsconfig.compilerOptions,
        ...override,
        skipLibCheck
      },
      include,
      exclude: [...tsconfig.exclude, ...projectIgnorePatterns]
    };
    const { fileNames, options, errors } = ts.parseJsonConfigFileContent(config, ts.sys, this.cwd);
    if (errors.length > 0) {
      return errors;
    }
    const program = ts.createProgram(fileNames, {
      ...options,
      noEmit
    });
    const result = program.emit(void 0, void 0, void 0, void 0, {
      after: [transformJsxToJsExtension]
    });
    return this.filterDiagnostics(ts.getPreEmitDiagnostics(program).concat(result.diagnostics));
  }
  filterDiagnostics(diagnostics) {
    return diagnostics.filter((diagnostic) => diagnostic.code !== 2209).filter(
      (diagnostic) => !(diagnostic.code === 1479 && diagnostic.file?.fileName.includes("/.yarn/"))
    ).filter(
      (diagnostic) => !(diagnostic.code === 2834 && diagnostic.file?.fileName.includes("/.yarn/"))
    ).filter(
      (diagnostic) => !(diagnostic.code === 7016 && diagnostic.file?.fileName.includes("/lexical/"))
    ).filter(
      (diagnostic) => !(diagnostic.code === 6133 && diagnostic.file?.fileName.includes("/@yarnpkg/libui/"))
    ).filter(
      (diagnostic) => !([2315, 2411, 2304, 7006, 7016].includes(diagnostic.code) && diagnostic.file?.fileName.includes("/@strapi/"))
    ).filter(
      (diagnostic) => !([2688, 2307, 2503].includes(diagnostic.code) && diagnostic.file?.fileName.includes("/pkg-tests-core/"))
    ).filter(
      (diagnostics2) => !([2307].includes(diagnostics2.code) && diagnostics2.file?.fileName.includes("/@nestjs/testing/"))
    );
  }
  getProjectIgnorePatterns() {
    const content = readFileSync(join(this.cwd, "package.json"), "utf-8");
    const { typecheckIgnorePatterns = [] } = JSON.parse(content);
    return typecheckIgnorePatterns;
  }
  getLibCheckOption() {
    const content = readFileSync(join(this.cwd, "package.json"), "utf-8");
    const { typecheckSkipLibCheck = false } = JSON.parse(content);
    return typecheckSkipLibCheck;
  }
}

const {
  type,
  cwd,
  include,
  override
} = workerData;
const execute = async () => {
  if (type === "check") {
    parentPort.postMessage(parse(stringify(await new TypeScript(cwd).check(include))));
  }
  if (type === "build") {
    parentPort.postMessage(parse(stringify(await new TypeScript(cwd).build(include, override))));
  }
};
await execute();
