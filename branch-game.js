// 会話ツリーの状態。UIや既存の一本道シナリオとは独立して扱う。
window.BranchGame = {
  start(scenario) {
    return { nodeId: scenario.startNode, depth: 1, calm: 100, history: [] };
  },
  current(scenario, session) {
    return scenario.nodes[session.nodeId];
  },
  reply(scenario, session, choiceIndex) {
    const node = this.current(scenario, session);
    const choice = node.choices[choiceIndex];
    if (!choice) throw new Error("存在しない選択肢です");
    const next = choice.next ? scenario.nodes[choice.next] : null;
    if (choice.next && (!next || session.depth >= 3)) throw new Error("不正な会話分岐です");
    session.history.push({ nodeId: session.nodeId, message: node.text, choiceIndex, reply: choice.label });
    if (next) {
      session.nodeId = choice.next;
      session.depth += 1;
      session.calm = Math.max(0, session.calm - 15);
      return null;
    }
    if (!choice.outcome) throw new Error("会話の終わりが未定義です");
    return choice.outcome;
  }
};
