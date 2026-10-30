const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const elements = new Map();
const htmlIds = new Set([...fs.readFileSync(path.join(root, "index.html"), "utf8").matchAll(/id="([^"]+)"/g)].map(match => match[1]));
function element() {
  return { textContent: "", innerHTML: "", hidden: false, children: [], style: { setProperty() {} },
    classList: { toggle() {}, add() {}, remove() {} }, setAttribute() {}, addEventListener() {},
    appendChild(child) { this.children.push(child); }, querySelector() { return element(); } };
}
let timers = [];
const ctx = { console, Date, window: {}, document: {
  getElementById(id) { if (!htmlIds.has(id)) return null; if (!elements.has(id)) elements.set(id, element()); return elements.get(id); },
  createElement: element, querySelectorAll() { return []; }
}, setTimeout(fn, delay) { timers.push({ fn, delay }); }, clearTimeout() {} };
vm.createContext(ctx);
for (const file of ["scenarios.js", "branch-game.js", "branch-scenarios.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx);
}
const cases = ctx.window.SCENARIOS.filter(item => item.nodes);
assert.equal(cases.length, 3);
assert.equal(ctx.window.PLAY_SETS[0].id, "branch-trial");
const engine = ctx.window.BranchGame;
let endings = 0;
for (const scenario of cases) {
  assert.equal(Object.keys(scenario.nodes).length, 13);
  assert.equal(new Set(Object.values(scenario.nodes).map(node => node.text)).size, 13);
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    const session = engine.start(scenario);
    assert.equal(session.calm, 100);
    for (const [index, calm, depth] of [[a, 85, 2], [b, 70, 3]]) {
      assert.equal(engine.current(scenario, session).choices.length, 3);
      assert.equal(engine.reply(scenario, session, index), null);
      assert.equal(session.calm, calm);
      assert.equal(session.depth, depth);
    }
    const node = engine.current(scenario, session);
    assert(node.choices.every(choice => !choice.next && choice.outcome));
    assert.equal(engine.reply(scenario, session, c), node.choices[c].outcome);
    assert.equal(session.depth, 3);
    assert.equal(session.calm, 70);
    assert.equal(session.history.length, 3);
    assert.equal(session.history[0].reply, scenario.nodes.start.choices[a].label);
    endings++;
  }
}
// 本物の画面処理と状態遷移を接続して検証。初期画面の起動だけを除外する。
const app = fs.readFileSync(path.join(root, "app.js"), "utf8").split("\nhydrateAccountState();")[0];
vm.runInContext(app, ctx);
vm.runInContext(`
  ensureAudioContext = playSfx = updateScorePill = updateTurnTimer = syncTutorialTargets =
  syncTutorialStepForScenario = renderDmList = clearFeedback = showFeedback = triggerScorePillFx = () => {};
`, ctx);
function run(code) { return vm.runInContext(code, ctx); }
function reset(scenario) {
  timers = [];
  ctx.testScenario = scenario;
  run(`state.activeScenarios = [testScenario]; state.currentIndex = 0; state.logs = [];
       state.actionCount = 0; state.runToken++; renderScenario();`);
}
function reply(index) { run(`chooseReply(normalizeChoice(currentTurn().choices[${index}]), ${index})`); }
function flush(delay) {
  const pending = timers.filter(timer => timer.delay === delay);
  timers = timers.filter(timer => timer.delay !== delay);
  pending.forEach(timer => timer.fn());
}
for (const scenario of cases) {
  // 全9ルートの最終3択をUI処理経由で確認。
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) for (let c = 0; c < 3; c++) {
    reset(scenario);
    reply(a);
    reply(a); // 連打しても1回分だけ処理される。
    run("pressFraudButton()"); // 相手の返信待ちに割り込んで二重終了しない。
    assert.equal(run("state.actionCount"), 1);
    flush(260);
    assert.equal(run("state.turnIndex"), 1);
    assert.equal(run("currentTurn().text"), scenario.nodes[`b${a}`].text);
    reply(b); flush(260);
    assert.equal(run("currentTurn().text"), scenario.nodes[`b${a}-${b}`].text);
    assert.equal(elements.get("branchCalmValue").textContent, "冷静さ 70 / 100");
    reply(c); flush(260);
    assert.equal(run("state.logs.length"), 1);
    assert.equal(run("state.logs[0].reachedTurn"), 3);
    assert.equal(run("state.logs[0].branchPath.length"), 3);
    assert.equal(run("state.logs[0].calmRemaining"), 70);
    const expected = !scenario.isFraud ? "correct_safe" : c < 2 ? "instant_scam" : "missed";
    assert.equal(run("state.logs[0].result"), expected);
    assert.equal(run("state.locked"), true);
  }
  // 全13ノードで詐欺ボタンが機能し、判定段階と経路を保存する。
  const paths = [[], [0], [1], [2]];
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) paths.push([a, b]);
  for (const route of paths) {
    reset(scenario);
    route.forEach(index => { reply(index); flush(260); });
    run("pressFraudButton()"); flush(90);
    assert.equal(run("state.logs.length"), 1);
    assert.equal(run("state.logs[0].judgedTurn"), route.length + 1);
    assert.equal(run("state.logs[0].branchPath.length"), route.length);
    assert.equal(run("state.logs[0].result"), !scenario.isFraud ? "false_positive" : route.length ? "correct_detected" : "early_detected");
    // 途中離脱やリスタートで古い返信タイマーが新しい会話へ混入しない。
  }
}
reset(cases[0]); reply(0); run("state.runToken++"); flush(260);
assert.equal(run("state.turnIndex"), 0);
// 従来の一本道は従来の次のメッセージへ進み、分岐ゲージを表示しない。
const legacy = ctx.window.SCENARIOS.find(item => item.id === "friend-001");
reset(legacy);
assert.equal(run("state.branchSession"), null);
assert.equal(elements.get("branchStatus").hidden, true);
reply(0); flush(260);
assert.equal(run("currentTurn().text"), legacy.messages[1].text);
assert.equal(run("state.locked"), false);
console.log(`PASS: ${endings} endings, 39 fraud-button positions, UI transitions, 3-message cap, calm, logs, double-click lock, stale timers, legacy compatibility`);
