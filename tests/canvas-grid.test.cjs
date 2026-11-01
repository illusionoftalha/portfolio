const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

test('canvas grid reuses its geometry across frames and rebuilds on resize', () => {
    const source = readFileSync(require.resolve('../script.js'), 'utf8');
    const section = source.slice(source.indexOf("const canvas ="), source.indexOf('// 4. GSAP'));
    const paths = [];
    const strokes = [];
    const listeners = {};
    const ctx = { clearRect() {}, beginPath() {}, arc() {}, fill() {}, stroke(p) { strokes.push(p); } };
    const context = {
        Path2D: class {
            constructor() { this.commands = []; paths.push(this); }
            moveTo(...args) { this.commands.push(['move', ...args]); }
            lineTo(...args) { this.commands.push(['line', ...args]); }
        },
        document: { getElementById: () => ({ getContext: () => ctx }) },
        window: { innerWidth: 100, innerHeight: 100, addEventListener: (name, fn) => listeners[name] = fn },
        lenis: { on() {} }, requestAnimationFrame() {}
    };
    vm.createContext(context);
    vm.runInContext(section, context);
    assert.equal(paths.length, 1);
    assert.deepEqual(paths[0].commands, [
        ['move', 0, 0], ['line', 0, 100], ['move', 50, 0], ['line', 50, 100],
        ['move', 0, 0], ['line', 100, 0], ['move', 0, 50], ['line', 100, 50]
    ]);
    vm.runInContext('drawMagma(); drawMagma();', context);
    assert.equal(paths.length, 1);
    assert.equal(strokes.length, 3);
    assert.ok(strokes.every(p => p === paths[0]));
    context.window.innerWidth = 200;
    listeners.resize();
    assert.equal(paths.length, 2);
    assert.equal(paths[1].commands.length, 12);
    vm.runInContext('drawMagma()', context);
    assert.equal(strokes.at(-1), paths[1]);
});
