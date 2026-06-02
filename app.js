// あ，詐欺ね メイン処理
// このファイルは、画面の切り替え、選択肢の処理、結果集計を担当します。

const state = {
  currentIndex: 0,
  turnIndex: 0,
  actionCount: 0,
  logs: [],
  activeScenarios: [],
  selectedSetId: null,
  setSelectTab: "sets",
  lastSession: null,
  sessionHistory: [],
  resultSession: null,
  startedAt: null,
  scenarioStartedAt: null,
  scoreTicker: null,
  locked: false,
  selectedReviewIndex: 0,
  lastLiveScore: null,
  reviewLogs: [],
  resultReviewOpen: false,
  resultAnimationFrame: null,
  scoreFxTimer: null,
  countdownTimer: null,
  currentAccountId: null,
  accounts: {},
  guestHistory: [],
  gameMode: "normal",
  runToken: 0,
  tutorial: {
    active: false,
    stepIndex: 0,
    pendingStepIndex: null
  },
  ui: {
    fontScale: 1
  }
};

const audioState = {
  ctx: null,
  masterGain: null,
  bgmGain: null,
  sfxGain: null,
  muted: false,
  bgmVolume: 0.7,
  sfxVolume: 1,
  bgmTheme: "classic",
  sfxTheme: "classic",
  bgmTimer: null,
  bgmStep: 0,
  bgmNextAt: 0,
  currentTrack: null
};

const $ = (id) => document.getElementById(id);

const screens = {
  menu: $("menuScreen"),
  setSelect: $("setSelectScreen"),
  tutorial: $("tutorialScreen"),
  countdown: $("countdownScreen"),
  game: $("gameScreen"),
  result: $("resultScreen")
};

const FEEDBACK_COPY = {
  correct_detected: {
    tone: "good",
    shape: "shock",
    eyebrow: "SCAM BLOCKED",
    title: "あ，詐欺ね",
    text: "危ない流れに入る前で止められた。ここで切って正解。",
    stamp: "BLOCK",
    symbol: "!"
  },
  early_detected: {
    tone: "good",
    shape: "shock",
    eyebrow: "EARLY SAVE",
    title: "あ，詐欺ね",
    text: "少し早めでも問題なし。違和感で切れている。",
    stamp: "SAVE",
    symbol: "!"
  },
  late_detected: {
    tone: "warn",
    shape: "caution",
    eyebrow: "CLOSE CALL",
    title: "あ，詐欺ね",
    text: "正解だが少し遅い。次はもう一手早く切りたい。",
    stamp: "CLOSE",
    symbol: "!"
  },
  missed: {
    tone: "bad",
    shape: "danger",
    eyebrow: "MISSED",
    title: "見逃し",
    text: "止めるのが遅れた。怪しい流れは途中で切りたい。",
    stamp: "MISS",
    symbol: "×"
  },
  false_positive: {
    tone: "sad",
    shape: "droop",
    eyebrow: "FALSE ALARM",
    title: "絶縁（ToT）",
    text: "詐欺ではなかった。今回は切らなくても大丈夫だった。",
    stamp: "OOPS",
    symbol: "…"
  },
  instant_scam: {
    tone: "bad",
    shape: "danger",
    eyebrow: "INSTANT LOSS",
    title: "詐欺られた！",
    text: "その選択は危険。相手の誘導に乗ってしまっている。",
    stamp: "LOST",
    symbol: "×"
  },
  correct_safe: {
    tone: "good",
    shape: "reply",
    eyebrow: "SAFE CHAT",
    title: "返信完了！",
    text: "疑いすぎず、通常連絡として処理できている。",
    stamp: "OK",
    symbol: "✓"
  }
};

const BGM_STEP_MS = 170;
const BGM_BAR_STEPS = 8;
const SCORE_PER_SCENARIO = 100;
const ACTION_PENALTY_SECONDS = 10;
const MAX_VOLUME_MULTIPLIER = 2;
const RESULT_SCORE_PENALTIES = {
  missed: 90,
  instant_scam: 120,
  false_positive: 70
};
const BIG_SCORE_SWING_THRESHOLD = 60;
const BGM_THEMES = {
  classic: {
    label: "現在の曲",
    menu: {
      stepMs: 240,
      chordVolume: 0.02,
      melodyType: "triangle",
      melodyAccentType: "triangle",
      melodyAttack: 0.01,
      melodyDecay: 0.18,
      melodyLastDecay: 0.24,
      melodyVolume: 0.028,
      shimmerAttack: 0.008,
      shimmerDecay: 0.1,
      shimmerVolume: 0.008,
      bassAttack: 0.012,
      bassDecay: 0.34,
      bassVolume: 0.06,
      detuneEven: 0,
      detuneOdd: 0,
      shimmerDetune: 0,
      patterns: [
        { bass: [130.81, 130.81, 146.83, 146.83], chord: [261.63, 329.63, 392], melody: [523.25, 587.33, 659.25, 587.33, 523.25, 587.33, 659.25, 698.46] },
        { bass: [146.83, 146.83, 164.81, 164.81], chord: [293.66, 369.99, 440], melody: [587.33, 659.25, 698.46, 659.25, 587.33, 659.25, 739.99, 783.99] },
        { bass: [164.81, 164.81, 155.56, 155.56], chord: [329.63, 392, 493.88], melody: [659.25, 739.99, 783.99, 739.99, 659.25, 698.46, 783.99, 739.99] },
        { bass: [146.83, 146.83, 130.81, 130.81], chord: [293.66, 349.23, 440], melody: [587.33, 659.25, 698.46, 659.25, 587.33, 523.25, 587.33, 659.25], turnaround: [493.88, 523.25] }
      ]
    },
    game: {
      stepMs: 170,
      chordVolume: 0.028,
      melodyType: "square",
      melodyAccentType: "triangle",
      melodyAttack: 0.002,
      melodyDecay: 0.11,
      melodyLastDecay: 0.16,
      melodyVolume: 0.045,
      shimmerAttack: 0.002,
      shimmerDecay: 0.06,
      shimmerVolume: 0.015,
      bassAttack: 0.008,
      bassDecay: 0.24,
      bassVolume: 0.08,
      detuneEven: -3,
      detuneOdd: 2,
      shimmerDetune: 5,
      patterns: [
        { bass: [164.81, 164.81, 164.81, 146.83], chord: [329.63, 392, 493.88], melody: [659.25, 783.99, 880, 783.99, 659.25, 783.99, 987.77, 880] },
        { bass: [174.61, 174.61, 174.61, 155.56], chord: [349.23, 415.3, 523.25], melody: [698.46, 830.61, 932.33, 830.61, 698.46, 830.61, 1046.5, 932.33] },
        { bass: [146.83, 146.83, 146.83, 130.81], chord: [293.66, 369.99, 440], melody: [587.33, 739.99, 783.99, 739.99, 587.33, 659.25, 739.99, 783.99] },
        { bass: [155.56, 155.56, 174.61, 196], chord: [311.13, 392, 466.16], melody: [622.25, 739.99, 783.99, 739.99, 622.25, 783.99, 932.33, 1046.5], turnaround: [783.99, 659.25] }
      ]
    },
    result: {
      stepMs: 260,
      chordVolume: 0.024,
      melodyType: "triangle",
      melodyAccentType: "sine",
      melodyAttack: 0.01,
      melodyDecay: 0.26,
      melodyLastDecay: 0.4,
      melodyVolume: 0.028,
      shimmerAttack: 0.008,
      shimmerDecay: 0.16,
      shimmerVolume: 0.008,
      bassAttack: 0.009,
      bassDecay: 0.38,
      bassVolume: 0.052,
      detuneEven: 0,
      detuneOdd: 1,
      shimmerDetune: 1,
      patterns: [
        { bass: [130.81, 130.81, 164.81, 196], chord: [261.63, 329.63, 392], melody: [523.25, 587.33, 659.25, 783.99, 659.25, 698.46, 783.99, 880], turnaround: [659.25, 698.46] },
        { bass: [146.83, 146.83, 174.61, 220], chord: [293.66, 369.99, 440], melody: [587.33, 659.25, 698.46, 830.61, 698.46, 739.99, 830.61, 932.33], turnaround: [698.46, 739.99] },
        { bass: [164.81, 164.81, 196, 246.94], chord: [329.63, 415.3, 493.88], melody: [659.25, 698.46, 783.99, 880, 783.99, 830.61, 932.33, 1046.5], turnaround: [783.99, 830.61] },
        { bass: [146.83, 146.83, 196, 261.63], chord: [293.66, 392, 493.88], melody: [698.46, 739.99, 783.99, 932.33, 830.61, 783.99, 739.99, 698.46], turnaround: [659.25, 698.46] }
      ]
    }
  },
  fun: {
    label: "ポップ",
    menu: {
      stepMs: 210,
      chordVolume: 0.024,
      melodyType: "triangle",
      melodyAccentType: "sine",
      melodyAttack: 0.006,
      melodyDecay: 0.2,
      melodyLastDecay: 0.28,
      melodyVolume: 0.032,
      shimmerAttack: 0.004,
      shimmerDecay: 0.12,
      shimmerVolume: 0.01,
      bassAttack: 0.01,
      bassDecay: 0.32,
      bassVolume: 0.062,
      detuneEven: 0,
      detuneOdd: 1,
      shimmerDetune: 2,
      patterns: [
        { bass: [130.81, 130.81, 164.81, 164.81], chord: [261.63, 329.63, 392], melody: [659.25, 698.46, 783.99, 880, 783.99, 698.46, 659.25, 587.33] },
        { bass: [146.83, 146.83, 196, 196], chord: [293.66, 369.99, 440], melody: [587.33, 659.25, 739.99, 830.61, 739.99, 659.25, 587.33, 493.88] },
        { bass: [164.81, 164.81, 146.83, 146.83], chord: [329.63, 415.3, 493.88], melody: [659.25, 783.99, 880, 987.77, 880, 783.99, 739.99, 659.25] },
        { bass: [146.83, 146.83, 174.61, 174.61], chord: [293.66, 392, 493.88], melody: [587.33, 659.25, 783.99, 880, 783.99, 698.46, 659.25, 587.33], turnaround: [523.25, 587.33] }
      ]
    },
    game: {
      stepMs: 155,
      chordVolume: 0.03,
      melodyType: "square",
      melodyAccentType: "triangle",
      melodyAttack: 0.002,
      melodyDecay: 0.12,
      melodyLastDecay: 0.18,
      melodyVolume: 0.05,
      shimmerAttack: 0.002,
      shimmerDecay: 0.08,
      shimmerVolume: 0.016,
      bassAttack: 0.007,
      bassDecay: 0.24,
      bassVolume: 0.085,
      detuneEven: -2,
      detuneOdd: 3,
      shimmerDetune: 6,
      patterns: [
        { bass: [164.81, 164.81, 196, 196], chord: [329.63, 415.3, 493.88], melody: [659.25, 783.99, 987.77, 1046.5, 987.77, 880, 783.99, 659.25] },
        { bass: [174.61, 174.61, 220, 220], chord: [349.23, 440, 523.25], melody: [698.46, 830.61, 1046.5, 1174.66, 1046.5, 932.33, 830.61, 698.46] },
        { bass: [146.83, 146.83, 196, 196], chord: [293.66, 392, 493.88], melody: [587.33, 739.99, 932.33, 987.77, 932.33, 880, 739.99, 659.25] },
        { bass: [155.56, 155.56, 207.65, 207.65], chord: [311.13, 392, 523.25], melody: [622.25, 783.99, 987.77, 1108.73, 987.77, 932.33, 783.99, 698.46], turnaround: [622.25, 659.25] }
      ]
    },
    result: {
      stepMs: 240,
      chordVolume: 0.027,
      melodyType: "triangle",
      melodyAccentType: "sine",
      melodyAttack: 0.01,
      melodyDecay: 0.24,
      melodyLastDecay: 0.36,
      melodyVolume: 0.031,
      shimmerAttack: 0.004,
      shimmerDecay: 0.14,
      shimmerVolume: 0.01,
      bassAttack: 0.008,
      bassDecay: 0.34,
      bassVolume: 0.056,
      detuneEven: 0,
      detuneOdd: 2,
      shimmerDetune: 2,
      patterns: [
        { bass: [130.81, 130.81, 164.81, 220], chord: [261.63, 329.63, 392], melody: [659.25, 698.46, 783.99, 880, 783.99, 830.61, 880, 987.77], turnaround: [783.99, 830.61] },
        { bass: [146.83, 146.83, 196, 246.94], chord: [293.66, 369.99, 440], melody: [698.46, 739.99, 830.61, 932.33, 830.61, 880, 932.33, 1046.5], turnaround: [830.61, 880] },
        { bass: [164.81, 164.81, 220, 261.63], chord: [329.63, 415.3, 493.88], melody: [783.99, 830.61, 880, 987.77, 880, 932.33, 987.77, 1174.66], turnaround: [880, 830.61] },
        { bass: [146.83, 146.83, 196, 220], chord: [293.66, 392, 493.88], melody: [698.46, 739.99, 783.99, 932.33, 880, 830.61, 783.99, 739.99], turnaround: [698.46, 739.99] }
      ]
    }
  },
  studio: {
    label: "新しい曲",
    menu: {
      stepMs: 260,
      chordVolume: 0.022,
      melodyType: "sine",
      melodyAccentType: "triangle",
      melodyAttack: 0.012,
      melodyDecay: 0.26,
      melodyLastDecay: 0.34,
      melodyVolume: 0.024,
      shimmerAttack: 0.01,
      shimmerDecay: 0.16,
      shimmerVolume: 0.006,
      bassAttack: 0.014,
      bassDecay: 0.38,
      bassVolume: 0.05,
      detuneEven: 0,
      detuneOdd: 0,
      shimmerDetune: 1,
      patterns: [
        { bass: [130.81, 130.81, 110, 110], chord: [261.63, 329.63, 392], melody: [392, 440, 523.25, 587.33, 523.25, 440, 392, 349.23] },
        { bass: [146.83, 146.83, 123.47, 123.47], chord: [293.66, 369.99, 440], melody: [440, 493.88, 587.33, 659.25, 587.33, 493.88, 440, 392] },
        { bass: [164.81, 164.81, 130.81, 130.81], chord: [329.63, 415.3, 493.88], melody: [493.88, 523.25, 659.25, 698.46, 659.25, 587.33, 523.25, 493.88] },
        { bass: [146.83, 146.83, 130.81, 130.81], chord: [293.66, 349.23, 440], melody: [440, 493.88, 587.33, 523.25, 493.88, 440, 392, 349.23], turnaround: [329.63, 392] }
      ]
    },
    game: {
      stepMs: 185,
      chordVolume: 0.026,
      melodyType: "triangle",
      melodyAccentType: "sine",
      melodyAttack: 0.007,
      melodyDecay: 0.17,
      melodyLastDecay: 0.24,
      melodyVolume: 0.032,
      shimmerAttack: 0.004,
      shimmerDecay: 0.11,
      shimmerVolume: 0.01,
      bassAttack: 0.01,
      bassDecay: 0.28,
      bassVolume: 0.068,
      detuneEven: 0,
      detuneOdd: 1,
      shimmerDetune: 2,
      patterns: [
        { bass: [164.81, 164.81, 130.81, 130.81], chord: [329.63, 392, 493.88], melody: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88] },
        { bass: [174.61, 174.61, 146.83, 146.83], chord: [349.23, 440, 523.25], melody: [587.33, 659.25, 698.46, 830.61, 698.46, 659.25, 587.33, 523.25] },
        { bass: [146.83, 146.83, 123.47, 123.47], chord: [293.66, 392, 440], melody: [493.88, 523.25, 587.33, 698.46, 587.33, 523.25, 493.88, 440] },
        { bass: [155.56, 155.56, 130.81, 130.81], chord: [311.13, 392, 466.16], melody: [523.25, 587.33, 622.25, 739.99, 622.25, 587.33, 523.25, 466.16], turnaround: [392, 440] }
      ]
    },
    result: {
      stepMs: 270,
      chordVolume: 0.022,
      melodyType: "sine",
      melodyAccentType: "triangle",
      melodyAttack: 0.012,
      melodyDecay: 0.3,
      melodyLastDecay: 0.42,
      melodyVolume: 0.024,
      shimmerAttack: 0.01,
      shimmerDecay: 0.2,
      shimmerVolume: 0.007,
      bassAttack: 0.011,
      bassDecay: 0.42,
      bassVolume: 0.05,
      detuneEven: 0,
      detuneOdd: 0,
      shimmerDetune: 1,
      patterns: [
        { bass: [130.81, 130.81, 110, 130.81], chord: [261.63, 329.63, 392], melody: [392, 440, 493.88, 523.25, 587.33, 523.25, 493.88, 587.33], turnaround: [523.25, 493.88] },
        { bass: [146.83, 146.83, 123.47, 146.83], chord: [293.66, 369.99, 440], melody: [440, 493.88, 523.25, 587.33, 659.25, 587.33, 523.25, 659.25], turnaround: [587.33, 523.25] },
        { bass: [164.81, 164.81, 130.81, 164.81], chord: [329.63, 415.3, 493.88], melody: [493.88, 523.25, 587.33, 659.25, 698.46, 659.25, 587.33, 698.46], turnaround: [659.25, 587.33] },
        { bass: [146.83, 146.83, 130.81, 174.61], chord: [293.66, 349.23, 440], melody: [440, 493.88, 523.25, 587.33, 659.25, 587.33, 523.25, 698.46], turnaround: [587.33, 523.25] }
      ]
    }
  }
};

const SFX_THEMES = {
  classic: {
    label: "現在の音"
  },
  studio: {
    label: "新しい音"
  }
};

const STORAGE_KEY = "scam-judge-rta-storage-v1";
const FONT_SCALE_BASE = 1.69;
const FONT_SCALE_SCHEMA_VERSION = 2;
const TUTORIAL_SCENARIOS = [
  {
    id: "tutorial-safe",
    name: "大学サークル代表",
    handle: "@circle_rep",
    color: "#95d5b2",
    isFraud: false,
    type: "通常連絡",
    tags: ["参加確認", "公式確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "明日の新歓、人数確認したいです。参加できますか？",
        choices: ["参加します", "まだ未定です", "欠席します"]
      }
    ],
    explanation: "普通の連絡では、相手の確認に落ち着いて返せれば十分。詐欺でない会話まで切らないことも大切。"
  },
  {
    id: "tutorial-fraud",
    name: "市役所 給付金担当",
    handle: "@city_support",
    color: "#52a3ff",
    isFraud: true,
    type: "還付金詐欺",
    tags: ["権威性", "金銭要求", "外部誘導", "緊急性"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "突然失礼します。医療費の還付金について、未受け取り分があります。",
        choices: ["詳しく教えてください", "市役所に電話で確認します", "身に覚えがありません"]
      },
      {
        from: "them",
        text: "本日中ならATMで受け取り手続きができます。近くのATMに行けますか？",
        choices: [
          "今から行けます",
          "なぜATMなんですか？",
          { label: "言われた通りに進めます", instantLose: true }
        ]
      }
    ],
    explanation: "公的機関を名乗っていても、DMでATMへ誘導する時点で危険。違和感がそろったら途中で止めてよい。"
  }
];
const TUTORIAL_STEPS = [
  {
    id: "welcome",
    screen: "tutorial",
    badge: "STEP 1",
    title: "ゲームの目的",
    message: "やあ。僕は「サギカモ」だよ！サギでも，カモでもなく，カラスだよ．まちがえないでね！このゲームは、DMが詐欺か普通の連絡かを見分ける練習だよ。",
    hint: "危険なら止める。普通なら疑いすぎない。これが大事。",
    action: "next",
    buttonLabel: "つぎへ"
  },
  {
    id: "controls",
    screen: "tutorial",
    badge: "STEP 2",
    title: "ゲームの操作方法",
    message: "下の3択は返事を続ける操作。赤い『あ、詐欺ね』は、その場で止める操作だよ。",
    hint: "最後まで読まなくていい。危ないと思った時点で止めよう。",
    action: "next",
    buttonLabel: "つぎへ"
  },
  {
    id: "thinking",
    screen: "tutorial",
    badge: "STEP 3",
    title: "考え方のコツ",
    message: "見るポイントは5つ。急がせる、お金を求める、秘密にさせる、外部へ誘導する、認証コードや個人情報を聞く。",
    hint: "公式確認を勧め、機密情報をDMで求めない相手は安全寄り。",
    action: "next",
    buttonLabel: "練習へ"
  },
  {
    id: "start-practice",
    screen: "tutorial",
    badge: "STEP 4",
    title: "実際にやってみよう",
    message: "ここからは2件だけ、一緒に練習しよう。",
    hint: "まず安全なDM、その次に詐欺DMを止めるよ。",
    action: "start",
    buttonLabel: "練習スタート"
  },
  {
    id: "safe-practice",
    screen: "game",
    badge: "STEP 5",
    title: "まずは普通の連絡",
    message: "相手のDMを読んで、下の3択から1つ返してみて。",
    hint: "今回は赤いボタンを押さず、返事を選ぼう。",
    action: "wait-choice"
  },
  {
    id: "fraud-read",
    screen: "game",
    badge: "STEP 6",
    title: "怪しい返事を避ける",
    message: "次は怪しいDM。すぐ従わず、確認する返事を選んでみて。",
    hint: "前のめりに従う返事は危険になりやすいよ。",
    action: "wait-choice"
  },
  {
    id: "fraud-stop",
    screen: "game",
    badge: "STEP 7",
    title: "詐欺だと思ったら止める",
    message: "ATMへ誘導し始めた。もう十分危険だから止めよう。",
    hint: "最後まで読むより、危ない流れの前で切るほうが大事。",
    action: "wait-fraud"
  },
  {
    id: "complete",
    screen: "tutorial",
    badge: "COMPLETE",
    title: "チュートリアル完了",
    message: "これで基本はOK。迷ったら危険サインを思い出してね。",
    hint: "あとは通常プレイで練習できるよ。",
    action: "finish",
    buttonLabel: "メニューへ"
  }
];

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("active"));
  screens[name].classList.add("active");
}

function tutorialStep() {
  return TUTORIAL_STEPS[state.tutorial.stepIndex] || null;
}

function tutorialPreviewMarkup(stepId) {
  if (stepId === "welcome") {
    return `
      <div class="tutorial-mini-screen menu">
        <div class="tutorial-mini-bar">
          <div class="tutorial-mini-pill"></div>
          <div class="tutorial-mini-icon"></div>
        </div>
        <div class="tutorial-mini-hero"></div>
        <div class="tutorial-mini-button"></div>
        <div class="tutorial-mini-grid">
          <div class="tutorial-mini-card"></div>
          <div class="tutorial-mini-card"></div>
        </div>
        <div class="tutorial-hotspot" style="left: 13px; right: 13px; top: 180px; height: 50px;"></div>
        <div class="tutorial-callout" style="left: 18px; top: 126px;">
          <strong>ここからプレイ</strong>
          実戦ではこのボタンからゲームを始めるよ。
        </div>
        <div class="tutorial-callout" style="right: 18px; bottom: 18px;">
          <strong>目的</strong>
          進んで読むか、止めるかを自分で判断するゲームだよ。
        </div>
      </div>
    `;
  }

  if (stepId === "controls") {
    return `
      <div class="tutorial-mini-screen game">
        <div class="tutorial-mini-topbar">
          <div class="tutorial-mini-icon"></div>
          <div class="tutorial-mini-avatar"></div>
          <div class="tutorial-mini-name"></div>
          <div class="tutorial-mini-score"></div>
        </div>
        <div class="tutorial-mini-thread">
          <div class="tutorial-mini-bubble"></div>
          <div class="tutorial-mini-bubble me" style="width: 52%;"></div>
          <div class="tutorial-mini-bubble" style="width: 74%;"></div>
        </div>
        <div class="tutorial-mini-actions">
          <div class="tutorial-mini-danger"></div>
          <div class="tutorial-mini-choices">
            <div class="tutorial-mini-choice"></div>
            <div class="tutorial-mini-choice"></div>
            <div class="tutorial-mini-choice"></div>
          </div>
        </div>
        <div class="tutorial-hotspot red" style="left: 12px; right: 12px; bottom: 62px; height: 46px;"></div>
        <div class="tutorial-hotspot" style="left: 12px; right: 12px; bottom: 10px; height: 46px;"></div>
        <div class="tutorial-callout red" style="left: 16px; top: 126px;">
          <strong>赤ボタン</strong>
          詐欺だと思った時点でここを押して止める。
        </div>
        <div class="tutorial-callout" style="right: 16px; top: 156px;">
          <strong>3択の返事</strong>
          続きを見るときは下の返事を選ぶ。
        </div>
      </div>
    `;
  }

  if (stepId === "thinking") {
    return `
      <div class="tutorial-mini-screen game">
        <div class="tutorial-mini-topbar">
          <div class="tutorial-mini-icon"></div>
          <div class="tutorial-mini-avatar"></div>
          <div class="tutorial-mini-name"></div>
          <div class="tutorial-mini-score"></div>
        </div>
        <div class="tutorial-mini-thread">
          <div class="tutorial-mini-bubble textual">
            <span class="alert">本日中</span>にATMで受け取りできます。<br />
            <span class="alert">このDMの指示通り</span>に進めてください。
          </div>
          <div class="tutorial-mini-bubble textual" style="justify-self:end; background:#1d9bf0;">
            本当に公式？ まず確認したいです。
          </div>
          <div class="tutorial-mini-bubble textual" style="width: 86%;">
            不安なら<span class="safe">公式アプリで確認</span>してください。<br />
            このDMで<span class="safe">暗証番号は求めません</span>。
          </div>
        </div>
        <div class="tutorial-callout red" style="left: 16px; top: 70px;">
          <strong>危険サイン</strong>
          急がせる・ATM誘導・指示通り強調はかなり怪しい。
        </div>
        <div class="tutorial-callout" style="right: 16px; bottom: 18px;">
          <strong>安全寄りのサイン</strong>
          公式確認を促し、機密情報をDMで求めない相手は落ち着いて見てよい。
        </div>
      </div>
    `;
  }

  if (stepId === "start-practice") {
    return `
      <div class="tutorial-mini-screen menu">
        <div class="tutorial-mini-bar">
          <div class="tutorial-mini-pill"></div>
          <div class="tutorial-mini-icon"></div>
        </div>
        <div class="tutorial-mini-hero"></div>
        <div class="tutorial-mini-grid" style="grid-template-columns:1fr;">
          <div class="tutorial-mini-card" style="height:72px;"></div>
          <div class="tutorial-mini-card" style="height:72px;"></div>
        </div>
        <div class="tutorial-callout" style="left: 18px; bottom: 18px;">
          <strong>これから実践</strong>
          まず安全なDM、その次に詐欺DMを止める練習をするよ。
        </div>
      </div>
    `;
  }

  return "";
}

function syncTutorialCoach() {
  const step = tutorialStep();
  const tutorialScreen = $("tutorialScreen");
  const practicePanel = $("tutorialPracticePanel");
  const isActive = state.tutorial.active && Boolean(step);

  if (!isActive) {
    tutorialScreen.classList.add("hidden");
    practicePanel.classList.add("hidden");
    return;
  }

  const onTutorialScreen = step.screen === "tutorial";
  tutorialScreen.classList.toggle("hidden", !onTutorialScreen);
  practicePanel.classList.toggle("hidden", onTutorialScreen);

  if (onTutorialScreen) {
    $("tutorialScreenStepBadge").textContent = step.badge;
    $("tutorialScreenTitle").textContent = step.title;
    $("tutorialScreenMessage").textContent = step.message;
    $("tutorialScreenHint").textContent = step.hint;
    $("tutorialScreenPreview").innerHTML = tutorialPreviewMarkup(step.id);

    const nextBtn = $("tutorialNextBtn");
    const showNext = ["next", "start", "finish"].includes(step.action);
    nextBtn.classList.toggle("hidden", !showNext);
    if (showNext) {
      nextBtn.textContent = step.buttonLabel || "つぎへ";
    }
    return;
  }

  $("tutorialPracticeStepBadge").textContent = step.badge;
  $("tutorialPracticeTitle").textContent = step.title;
  $("tutorialPracticeMessage").textContent = step.message;
  $("tutorialPracticeHint").textContent = step.hint;
}

function goToTutorialStep(stepIndex) {
  state.tutorial.stepIndex = Math.max(0, Math.min(stepIndex, TUTORIAL_STEPS.length - 1));
  state.tutorial.pendingStepIndex = null;
  const step = tutorialStep();
  if (step?.screen) {
    showScreen(step.screen);
  }
  syncTutorialCoach();
}

function stopTutorial() {
  state.tutorial.active = false;
  state.tutorial.stepIndex = 0;
  state.tutorial.pendingStepIndex = null;
  state.gameMode = "normal";
  syncTutorialCoach();
}

function completeTutorial() {
  stopScoreTicker();
  clearFeedback();
  state.runToken += 1;
  state.gameMode = "normal";
  state.tutorial.active = true;
  goToTutorialStep(TUTORIAL_STEPS.findIndex((step) => step.id === "complete"));
  if (!audioState.muted) {
    startBgm("menu");
  }
}

function exitTutorialToMenu() {
  state.runToken += 1;
  stopScoreTicker();
  clearFeedback();
  stopTutorial();
  hideOverlayModals();
  showScreen("menu");
  renderMenuSummary();
  if (!audioState.muted) {
    startBgm("menu");
  }
}

function startTutorial() {
  ensureAudioContext();
  hideOverlayModals();
  state.tutorial.active = true;
  state.gameMode = "normal";
  goToTutorialStep(0);
  if (!audioState.muted) {
    startBgm("menu");
  }
}

function startTutorialPractice() {
  state.tutorial.active = true;
  state.tutorial.pendingStepIndex = null;
  startGame(TUTORIAL_SCENARIOS, "tutorial");
}

function advanceTutorial() {
  const step = tutorialStep();
  if (!step) return;

  if (step.action === "start") {
    startTutorialPractice();
    return;
  }

  if (step.action === "finish") {
    exitTutorialToMenu();
    return;
  }

  if (step.action === "next") {
    goToTutorialStep(state.tutorial.stepIndex + 1);
  }
}

function tutorialActionBlock(message) {
  const hint = $("tutorialPracticeHint");
  if (!hint || !state.tutorial.active || tutorialStep()?.screen !== "game") return;
  hint.textContent = message;
}

function syncTutorialStepForScenario() {
  if (!state.tutorial.active || state.gameMode !== "tutorial") return;
  if (state.currentIndex === 0) {
    goToTutorialStep(TUTORIAL_STEPS.findIndex((step) => step.id === "safe-practice"));
    return;
  }
  if (state.currentIndex === 1) {
    goToTutorialStep(TUTORIAL_STEPS.findIndex((step) => step.id === "fraud-read"));
  }
}

function tutorialAllowsChoice(choiceIndex) {
  if (!state.tutorial.active || state.gameMode !== "tutorial") return true;
  const step = tutorialStep();
  if (!step) return true;

  if (step.id === "safe-practice") {
    tutorialActionBlock("今回は普通の連絡なので、赤いボタンではなく3択から返事をしてみよう。");
    return true;
  }

  if (step.id === "fraud-read") {
    if (choiceIndex === 0) {
      tutorialActionBlock("今はすぐ従う返事ではなく、確認する方向の返事を選ぼう。");
      return false;
    }
    state.tutorial.pendingStepIndex = TUTORIAL_STEPS.findIndex((item) => item.id === "fraud-stop");
    return true;
  }

  if (step.id === "fraud-stop") {
    tutorialActionBlock("ここでは返信せず、赤い『あ、詐欺ね』ボタンを押して止めよう。");
    return false;
  }

  return true;
}

function tutorialAllowsFraudButton() {
  if (!state.tutorial.active || state.gameMode !== "tutorial") return true;
  const step = tutorialStep();
  if (!step) return true;

  if (step.id === "safe-practice") {
    tutorialActionBlock("今回は普通の連絡なので、赤いボタンは押さずに返事を選んでみよう。");
    return false;
  }

  if (step.id === "fraud-read") {
    tutorialActionBlock("まだ1手目。まずは確認する返事をして、材料を1つ増やしてみよう。");
    return false;
  }

  return step.id === "fraud-stop";
}

function storageAvailable() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function persistAppState() {
  if (!storageAvailable()) return;

  const payload = {
    currentAccountId: state.currentAccountId,
    accounts: state.accounts,
    guestHistory: state.guestHistory,
    ui: {
      ...state.ui,
      fontScaleVersion: FONT_SCALE_SCHEMA_VERSION
    },
    audio: {
      bgmTheme: audioState.bgmTheme,
      sfxTheme: audioState.sfxTheme
    }
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function hydrateAccountState() {
  if (!storageAvailable()) return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    state.currentAccountId = parsed.currentAccountId || null;
    state.accounts = normalizeAccounts(parsed.accounts || {});
    state.guestHistory = normalizeHistory(parsed.guestHistory || []);
    const storedFontScale = sanitizeFontScale(parsed.ui?.fontScale);
    state.ui.fontScale = parsed.ui?.fontScaleVersion === FONT_SCALE_SCHEMA_VERSION
      ? storedFontScale
      : sanitizeFontScale(storedFontScale / 1.3);
    audioState.bgmTheme = sanitizeBgmTheme(parsed.audio?.bgmTheme);
    audioState.sfxTheme = sanitizeSfxTheme(parsed.audio?.sfxTheme);
  } catch (error) {
    state.currentAccountId = null;
    state.accounts = {};
    state.guestHistory = [];
    state.ui.fontScale = 1;
    audioState.bgmTheme = "classic";
    audioState.sfxTheme = "classic";
  }
}

function sanitizeFontScale(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(0.9, Math.min(1.4, Math.round(numeric * 100) / 100));
}

function sanitizeBgmTheme(value) {
  return Object.prototype.hasOwnProperty.call(BGM_THEMES, value) ? value : "classic";
}

function sanitizeSfxTheme(value) {
  return Object.prototype.hasOwnProperty.call(SFX_THEMES, value) ? value : "classic";
}

function applyFontScale() {
  document.documentElement.style.setProperty("--font-scale", String(state.ui.fontScale * FONT_SCALE_BASE));
}

function applyResponsiveViewport() {
  const viewport = window.visualViewport;
  const height = Math.round(viewport?.height || window.innerHeight || document.documentElement.clientHeight || 0);
  const rootStyle = document.documentElement.style;

  if (height > 0) {
    rootStyle.setProperty("--viewport-height", `${height}px`);
  }
}

function updateFontScaleUi() {
  const percentage = Math.round(state.ui.fontScale * 100);
  $("fontSizeSlider").value = String(percentage);
  $("fontSizeValue").textContent = `${percentage}%`;
}

function setFontScale(value) {
  state.ui.fontScale = sanitizeFontScale(value);
  applyFontScale();
  updateFontScaleUi();
  persistAppState();
}

function currentAccount() {
  if (!state.currentAccountId) return null;
  return state.accounts[state.currentAccountId] || null;
}

function normalizeSession(session) {
  if (!session || typeof session !== "object") return null;

  const playSet = playSetById(session.playSetId);
  const logs = Array.isArray(session.logs) ? session.logs.map((log) => ({ ...log })) : [];
  const actionCount = session.summary?.actionCount ?? logs.length;
  const totalSec = session.summary?.totalSec ?? Math.round(logs.reduce((sum, log) => sum + (log.elapsedMs || 0), 0) / 1000);
  const summaryShape = computeResults(logs, totalSec, actionCount);
  const summary = session.summary ? { ...session.summary } : summaryShape;

  return {
    playedAt: session.playedAt || new Date().toISOString(),
    playSetId: session.playSetId || null,
    playSetName: session.playSetName || playSet?.name || "未設定セット",
    color: session.color || (playSet ? playSetAccent(playSet) : "#1d9bf0"),
    summary: {
      ...summaryShape,
      ...summary
    },
    logs
  };
}

function normalizeHistory(history) {
  return (Array.isArray(history) ? history : [])
    .map(normalizeSession)
    .filter(Boolean)
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
}

function normalizeAccounts(accounts) {
  return Object.fromEntries(
    Object.entries(accounts || {}).map(([accountId, account]) => [
      accountId,
      {
        id: account?.id || accountId,
        name: account?.name || accountId,
        history: normalizeHistory(account?.history || [])
      }
    ])
  );
}

function mergeHistories(...histories) {
  const merged = new Map();

  histories.flat().forEach((session) => {
    const normalized = normalizeSession(session);
    if (!normalized) return;
    const key = `${normalized.playedAt}:${normalized.playSetId || ""}:${normalized.summary.finalScore}`;
    if (!merged.has(key)) {
      merged.set(key, normalized);
    }
  });

  return [...merged.values()].sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
}

function syncSessionHistoryFromAccount() {
  const account = currentAccount();
  state.sessionHistory = account ? mergeHistories(account.history, state.guestHistory) : [...state.guestHistory];
  state.lastSession = state.sessionHistory[0] || null;
}

function accountIdFromName(name) {
  return name.trim().toLowerCase();
}

function nowMs() {
  return Date.now();
}

function baseScoreForRun() {
  return state.activeScenarios.length * SCORE_PER_SCENARIO;
}

function liveTimePenalty() {
  if (!state.startedAt) return 0;
  return Math.floor((nowMs() - state.startedAt) / 1000);
}

function currentLiveScore() {
  const score = baseScoreForRun() - liveTimePenalty() - (state.actionCount * ACTION_PENALTY_SECONDS) - accumulatedResultPenalty();
  return Math.max(0, score);
}

function accumulatedResultPenalty() {
  return state.logs.reduce((sum, log) => sum + (log.scorePenalty || 0), 0);
}

function resultScorePenalty(result) {
  return RESULT_SCORE_PENALTIES[result] || 0;
}

function updateScorePill() {
  const score = currentLiveScore();
  const maxScore = Math.max(baseScoreForRun(), 1);
  const ratio = score / maxScore;
  const prevScore = state.lastLiveScore ?? score;
  const delta = score - prevScore;
  const scorePill = $("scorePill");
  const scoreText = $("scenarioCount");
  const scoreDelta = $("scoreDelta");
  const batteryLevel = $("batteryLevel");

  scoreText.textContent = score;
  scoreDelta.textContent = delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : "+0";
  scoreDelta.classList.toggle("active", delta !== 0);
  scorePill.classList.toggle("delta-up", delta > 0);
  scorePill.classList.toggle("delta-down", delta < 0);
  scorePill.classList.remove("tone-high", "tone-mid", "tone-low");
  scorePill.classList.add(ratio > 0.66 ? "tone-high" : ratio > 0.33 ? "tone-mid" : "tone-low");
  batteryLevel.style.width = `${Math.max(10, Math.round(ratio * 100))}%`;

  state.lastLiveScore = score;
}

function triggerScorePillFx(delta) {
  if (delta >= 0) return;
  const scorePill = $("scorePill");
  if (!scorePill) return;

  if (state.scoreFxTimer) {
    window.clearTimeout(state.scoreFxTimer);
  }

  scorePill.classList.remove("impact-down", "impact-down-major");
  void scorePill.offsetWidth;
  scorePill.classList.add(delta <= -BIG_SCORE_SWING_THRESHOLD ? "impact-down-major" : "impact-down");

  state.scoreFxTimer = window.setTimeout(() => {
    scorePill.classList.remove("impact-down", "impact-down-major");
    state.scoreFxTimer = null;
  }, 820);
}

function stopScoreTicker() {
  if (!state.scoreTicker) return;
  window.clearInterval(state.scoreTicker);
  state.scoreTicker = null;
}

function stopCountdownTimer() {
  if (!state.countdownTimer) return;
  window.clearTimeout(state.countdownTimer);
  state.countdownTimer = null;
}

function startScoreTicker() {
  stopScoreTicker();
  updateScorePill();
  state.scoreTicker = window.setInterval(updateScorePill, 250);
}

function ensureAudioContext() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioState.ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioState.ctx = new AudioCtx();
    audioState.masterGain = audioState.ctx.createGain();
    audioState.bgmGain = audioState.ctx.createGain();
    audioState.sfxGain = audioState.ctx.createGain();
    audioState.masterGain.gain.value = 0.88;
    audioState.bgmGain.connect(audioState.masterGain);
    audioState.sfxGain.connect(audioState.masterGain);
    audioState.masterGain.connect(audioState.ctx.destination);
    syncAudioMix();
  }
  if (audioState.ctx.state === "suspended") {
    audioState.ctx.resume();
  }
  return audioState.ctx;
}

function syncAudioMix() {
  if (!audioState.bgmGain || !audioState.sfxGain) return;
  audioState.bgmGain.gain.value = audioState.muted ? 0 : 0.2 * audioState.bgmVolume;
  audioState.sfxGain.gain.value = audioState.muted ? 0 : 0.24 * audioState.sfxVolume;
}

function rebuildBgmBus() {
  const ctx = audioState.ctx;
  if (!ctx || !audioState.masterGain) return;

  if (audioState.bgmGain) {
    try {
      audioState.bgmGain.disconnect();
    } catch {
      // 既に切断済みなら何もしない
    }
  }

  audioState.bgmGain = ctx.createGain();
  audioState.bgmGain.connect(audioState.masterGain);
  syncAudioMix();
}

function updateAudioUi() {
  $("muteToggleBtn").textContent = audioState.muted ? "ミュート解除" : "音をミュート";
  $("bgmVolumeSlider").value = String(Math.round(audioState.bgmVolume * 100));
  $("seVolumeSlider").value = String(Math.round(audioState.sfxVolume * 100));
  $("bgmVolumeValue").textContent = `${Math.round(audioState.bgmVolume * 100)}%`;
  $("seVolumeValue").textContent = `${Math.round(audioState.sfxVolume * 100)}%`;
  $("bgmThemeValue").textContent = BGM_THEMES[audioState.bgmTheme].label;
  $("bgmThemeClassicBtn").classList.toggle("active", audioState.bgmTheme === "classic");
  $("bgmThemeFunBtn").classList.toggle("active", audioState.bgmTheme === "fun");
  $("bgmThemeStudioBtn").classList.toggle("active", audioState.bgmTheme === "studio");
  $("sfxThemeValue").textContent = SFX_THEMES[audioState.sfxTheme].label;
  $("sfxThemeClassicBtn").classList.toggle("active", audioState.sfxTheme === "classic");
  $("sfxThemeStudioBtn").classList.toggle("active", audioState.sfxTheme === "studio");
}

function envelope(gainNode, startAt, attack, decay, peak = 1) {
  gainNode.gain.cancelScheduledValues(startAt);
  gainNode.gain.setValueAtTime(0.0001, startAt);
  gainNode.gain.linearRampToValueAtTime(peak, startAt + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + attack + decay);
}

function scheduleTone({
  frequency,
  type = "sine",
  attack = 0.01,
  decay = 0.18,
  volume = 0.25,
  startAt,
  target = "sfx",
  detune = 0
}) {
  const ctx = ensureAudioContext();
  if (!ctx || audioState.muted) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startAt);
  osc.detune.setValueAtTime(detune, startAt);
  gain.connect(target === "bgm" ? audioState.bgmGain : audioState.sfxGain);
  osc.connect(gain);
  envelope(gain, startAt, attack, decay, volume);
  osc.start(startAt);
  osc.stop(startAt + attack + decay + 0.03);
}

function playTone({ frequency, type = "sine", attack = 0.01, decay = 0.18, volume = 0.25, when = 0, target = "sfx", detune = 0 }) {
  const ctx = ensureAudioContext();
  if (!ctx || audioState.muted) return;
  scheduleTone({
    frequency,
    type,
    attack,
    decay,
    volume,
    startAt: ctx.currentTime + when,
    target,
    detune
  });
}

function playFilteredTone({
  frequency,
  type = "triangle",
  attack = 0.004,
  decay = 0.08,
  volume = 0.14,
  when = 0,
  filterType = "lowpass",
  filterFrequency = 1800,
  q = 0.6
}) {
  const ctx = ensureAudioContext();
  if (!ctx || audioState.muted) return;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime + when);
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFrequency, ctx.currentTime + when);
  filter.Q.setValueAtTime(q, ctx.currentTime + when);
  gain.connect(audioState.sfxGain);
  osc.connect(filter);
  filter.connect(gain);
  envelope(gain, ctx.currentTime + when, attack, decay, volume);
  osc.start(ctx.currentTime + when);
  osc.stop(ctx.currentTime + when + attack + decay + 0.02);
}

function playBgmChord(frequencies, startAt, volume = 0.028, decay = 0.2) {
  frequencies.forEach((frequency, index) => {
    scheduleTone({
      frequency,
      type: index === 0 ? "triangle" : "sine",
      attack: 0.01,
      decay,
      volume: index === 0 ? volume : volume * 0.8,
      startAt,
      target: "bgm",
      detune: index * 2
    });
  });
}

function currentBgmTheme() {
  return BGM_THEMES[audioState.bgmTheme] || BGM_THEMES.classic;
}

function bgmThemeTrack(track) {
  if (track === "result") return currentBgmTheme().result;
  return currentBgmTheme()[track === "menu" ? "menu" : "game"];
}

function bgmTrackForActiveScreen() {
  if (screens.result.classList.contains("active")) return "result";
  if (screens.game.classList.contains("active")) return "game";
  if (screens.countdown.classList.contains("active")) return null;
  return "menu";
}

function playBgmBar(track, barIndex, barStartAt) {
  const themeTrack = bgmThemeTrack(track);
  const pattern = themeTrack.patterns[barIndex % themeTrack.patterns.length];
  const stepMs = themeTrack.stepMs;
  const stepSec = stepMs / 1000;
  const barLengthSec = pattern.melody.length * stepSec;
  const isResultTrack = track === "result";

  if (isResultTrack) {
    const rootBass = pattern.bass[0];
    const peakBass = pattern.bass[pattern.bass.length - 1];
    scheduleTone({
      frequency: rootBass,
      type: "triangle",
      attack: themeTrack.bassAttack,
      decay: Math.max(barLengthSec * 0.82, themeTrack.bassDecay * 1.15),
      volume: themeTrack.bassVolume * 0.9,
      startAt: barStartAt,
      target: "bgm"
    });
    scheduleTone({
      frequency: peakBass,
      type: "sine",
      attack: 0.02,
      decay: Math.max(barLengthSec * 0.42, 0.42),
      volume: themeTrack.bassVolume * 0.48,
      startAt: barStartAt + (barLengthSec * 0.5),
      target: "bgm"
    });
    playBgmChord(pattern.chord, barStartAt + 0.02, themeTrack.chordVolume * 1.2, Math.max(barLengthSec * 0.72, 0.78));
    playBgmChord(pattern.chord.map((frequency) => frequency * 2), barStartAt + (barLengthSec * 0.5), themeTrack.chordVolume * 0.48, Math.max(barLengthSec * 0.42, 0.46));
    return;
  }

  pattern.melody.forEach((note, step) => {
    const noteStartAt = barStartAt + (step * stepSec);
    const bassNote = pattern.bass[Math.floor(step / 2)];

    scheduleTone({
      frequency: note,
      type: step % 2 === 0 ? themeTrack.melodyType : themeTrack.melodyAccentType,
      attack: themeTrack.melodyAttack,
      decay: step === pattern.melody.length - 1 ? Math.max(themeTrack.melodyLastDecay, stepSec * 1.35) : Math.max(themeTrack.melodyDecay, stepSec * 0.92),
      volume: themeTrack.melodyVolume,
      startAt: noteStartAt,
      target: "bgm",
      detune: step % 2 === 0 ? themeTrack.detuneEven : themeTrack.detuneOdd
    });

    scheduleTone({
      frequency: note * 2,
      type: "sine",
      attack: themeTrack.shimmerAttack,
      decay: Math.max(themeTrack.shimmerDecay, stepSec * 0.55),
      volume: themeTrack.shimmerVolume,
      startAt: noteStartAt,
      target: "bgm",
      detune: themeTrack.shimmerDetune
    });

    if (!isResultTrack && step % 2 === 0) {
      scheduleTone({
        frequency: bassNote,
        type: "triangle",
        attack: themeTrack.bassAttack,
        decay: Math.max(themeTrack.bassDecay, stepSec * 1.75),
        volume: themeTrack.bassVolume,
        startAt: noteStartAt,
        target: "bgm"
      });
      playBgmChord(pattern.chord, noteStartAt + 0.02, themeTrack.chordVolume, Math.max(stepSec * 1.85, 0.28));
    }
  });

  const turnaround = pattern.turnaround || [];
  turnaround.forEach((note, index) => {
    scheduleTone({
      frequency: note,
      type: "sine",
      attack: 0.01,
      decay: 0.12,
      volume: themeTrack.melodyVolume * 0.52,
      startAt: barStartAt + barLengthSec - 0.18 + (index * 0.05),
      target: "bgm"
    });
  });
}

function scheduleBgmAhead(track) {
  const ctx = ensureAudioContext();
  if (!ctx || audioState.muted || audioState.currentTrack !== track) return;

  const lookAheadSec = 0.9;
  const barDurationSec = (bgmThemeTrack(track).stepMs * BGM_BAR_STEPS) / 1000;

  while (audioState.bgmNextAt < ctx.currentTime + lookAheadSec) {
    playBgmBar(track, audioState.bgmStep, audioState.bgmNextAt);
    audioState.bgmStep += 1;
    audioState.bgmNextAt += barDurationSec;
  }
}

function startBgm(track) {
  const ctx = ensureAudioContext();
  if (!ctx || audioState.muted) return;
  if (audioState.currentTrack === track && audioState.bgmTimer) return;

  stopBgm();
  syncAudioMix();

  audioState.bgmStep = 0;
  audioState.currentTrack = track;
  audioState.bgmNextAt = ctx.currentTime + 0.04;
  scheduleBgmAhead(track);
  audioState.bgmTimer = window.setInterval(() => {
    scheduleBgmAhead(track);
  }, 120);
}

function stopBgm(force = false) {
  const ctx = audioState.ctx;

  if (force && ctx && audioState.bgmGain) {
    audioState.bgmGain.gain.cancelScheduledValues(ctx.currentTime);
    audioState.bgmGain.gain.setValueAtTime(0, ctx.currentTime);
    rebuildBgmBus();
  }

  if (audioState.bgmTimer) {
    window.clearInterval(audioState.bgmTimer);
  }

  audioState.bgmTimer = null;
  audioState.bgmNextAt = 0;
  audioState.currentTrack = null;
}

function forceStartBgm(track) {
  stopBgm(true);
  startBgm(track);
}

function playNoiseSweep({ duration = 0.14, startFreq = 1100, endFreq = 180, volume = 0.16 }) {
  const ctx = ensureAudioContext();
  if (!ctx || audioState.muted) return;

  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(startFreq, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
  gain.connect(audioState.sfxGain);
  filter.connect(gain);
  source.connect(filter);
  envelope(gain, ctx.currentTime, 0.005, duration, volume);
  source.start();
  source.stop(ctx.currentTime + duration + 0.02);
}

function playSfx(kind) {
  if (audioState.muted) return;
  const sfxTheme = audioState.sfxTheme;

  if (sfxTheme === "studio") {
    if (kind === "countdown_tick") {
      playFilteredTone({ frequency: 440, type: "triangle", attack: 0.002, decay: 0.08, volume: 0.08, filterFrequency: 1800 });
      playFilteredTone({ frequency: 554.37, type: "sine", attack: 0.002, decay: 0.06, volume: 0.045, when: 0.01, filterFrequency: 2400 });
      return;
    }

    if (kind === "countdown_go") {
      playFilteredTone({ frequency: 659.25, type: "triangle", attack: 0.002, decay: 0.08, volume: 0.08, filterFrequency: 2200 });
      playFilteredTone({ frequency: 830.61, type: "sine", attack: 0.002, decay: 0.1, volume: 0.065, when: 0.03, filterFrequency: 2800 });
      playFilteredTone({ frequency: 1046.5, type: "triangle", attack: 0.002, decay: 0.14, volume: 0.055, when: 0.07, filterFrequency: 3200 });
      playNoiseSweep({ duration: 0.05, startFreq: 900, endFreq: 1800, volume: 0.03 });
      return;
    }

    if (kind === "start") {
      playFilteredTone({ frequency: 523.25, type: "sine", decay: 0.12, volume: 0.08, filterFrequency: 2200 });
      playFilteredTone({ frequency: 659.25, type: "sine", decay: 0.18, volume: 0.075, when: 0.05, filterFrequency: 2600 });
      playFilteredTone({ frequency: 783.99, type: "triangle", decay: 0.22, volume: 0.055, when: 0.1, filterFrequency: 2400 });
      return;
    }

    if (kind === "incoming") {
      playFilteredTone({ frequency: 1046.5, type: "sine", attack: 0.002, decay: 0.05, volume: 0.06, filterFrequency: 3000, q: 1.2 });
      playFilteredTone({ frequency: 1318.51, type: "sine", attack: 0.002, decay: 0.08, volume: 0.05, when: 0.04, filterFrequency: 3400, q: 1.1 });
      return;
    }

    if (kind === "choice" || kind === "menu_tap") {
      playFilteredTone({ frequency: 640, type: "triangle", attack: 0.002, decay: 0.04, volume: 0.055, filterFrequency: 1900 });
      playFilteredTone({ frequency: 960, type: "sine", attack: 0.002, decay: 0.05, volume: 0.03, when: 0.015, filterFrequency: 2500 });
      return;
    }

    if (kind === "menu_back") {
      playFilteredTone({ frequency: 540, type: "sine", attack: 0.002, decay: 0.045, volume: 0.05, filterFrequency: 1700 });
      playFilteredTone({ frequency: 430, type: "triangle", attack: 0.002, decay: 0.06, volume: 0.038, when: 0.025, filterFrequency: 1500 });
      return;
    }

    if (kind === "fraud") {
      playFilteredTone({ frequency: 280, type: "triangle", attack: 0.004, decay: 0.12, volume: 0.09, filterFrequency: 900 });
      playFilteredTone({ frequency: 220, type: "sine", attack: 0.004, decay: 0.16, volume: 0.08, when: 0.04, filterFrequency: 780 });
      playNoiseSweep({ duration: 0.06, startFreq: 1800, endFreq: 700, volume: 0.045 });
      return;
    }

    if (kind === "download") {
      playFilteredTone({ frequency: 698.46, type: "sine", decay: 0.06, volume: 0.06, filterFrequency: 2000 });
      playFilteredTone({ frequency: 987.77, type: "triangle", decay: 0.08, volume: 0.05, when: 0.03, filterFrequency: 2600 });
      return;
    }

    if (kind === "good") {
      playFilteredTone({ frequency: 659.25, type: "sine", decay: 0.08, volume: 0.07, filterFrequency: 2400 });
      playFilteredTone({ frequency: 830.61, type: "sine", decay: 0.12, volume: 0.065, when: 0.04, filterFrequency: 2800 });
      playFilteredTone({ frequency: 1046.5, type: "triangle", decay: 0.16, volume: 0.05, when: 0.08, filterFrequency: 3200 });
      return;
    }

    if (kind === "warn") {
      playFilteredTone({ frequency: 493.88, type: "triangle", decay: 0.09, volume: 0.07, filterFrequency: 1400 });
      playFilteredTone({ frequency: 440, type: "sine", decay: 0.12, volume: 0.055, when: 0.05, filterFrequency: 1300 });
      return;
    }

    if (kind === "bad") {
      playFilteredTone({ frequency: 240, type: "triangle", attack: 0.006, decay: 0.18, volume: 0.08, filterFrequency: 820 });
      playNoiseSweep({ duration: 0.09, startFreq: 1100, endFreq: 260, volume: 0.055 });
      return;
    }
  }

  if (kind === "countdown_tick") {
    playFilteredTone({ frequency: 392, type: "square", attack: 0.002, decay: 0.08, volume: 0.09, filterFrequency: 1700 });
    playFilteredTone({ frequency: 523.25, type: "triangle", attack: 0.002, decay: 0.06, volume: 0.05, when: 0.01, filterFrequency: 2200 });
    return;
  }

  if (kind === "countdown_go") {
    playFilteredTone({ frequency: 587.33, type: "square", attack: 0.002, decay: 0.08, volume: 0.095, filterFrequency: 1900 });
    playFilteredTone({ frequency: 783.99, type: "triangle", attack: 0.002, decay: 0.1, volume: 0.07, when: 0.03, filterFrequency: 2400 });
    playFilteredTone({ frequency: 987.77, type: "triangle", attack: 0.002, decay: 0.15, volume: 0.06, when: 0.07, filterFrequency: 2900 });
    playNoiseSweep({ duration: 0.04, startFreq: 1000, endFreq: 2100, volume: 0.04 });
    return;
  }

  if (kind === "start") {
    playFilteredTone({ frequency: 740, type: "triangle", decay: 0.09, volume: 0.12, filterFrequency: 2400 });
    playFilteredTone({ frequency: 987.77, type: "sine", decay: 0.14, volume: 0.1, when: 0.05, filterFrequency: 2800 });
    return;
  }

  if (kind === "incoming") {
    playFilteredTone({ frequency: 1760, type: "sine", decay: 0.035, volume: 0.09, filterFrequency: 3200, q: 1.1 });
    playFilteredTone({ frequency: 1320, type: "triangle", decay: 0.06, volume: 0.07, when: 0.035, filterFrequency: 2600, q: 0.9 });
    return;
  }

  if (kind === "choice") {
    playFilteredTone({ frequency: 820, type: "triangle", attack: 0.001, decay: 0.045, volume: 0.08, filterFrequency: 1700 });
    playFilteredTone({ frequency: 560, type: "square", attack: 0.001, decay: 0.03, volume: 0.035, when: 0.01, filterFrequency: 1200 });
    return;
  }

  if (kind === "menu_tap") {
    playFilteredTone({ frequency: 720, type: "triangle", attack: 0.002, decay: 0.05, volume: 0.07, filterFrequency: 1800 });
    playFilteredTone({ frequency: 960, type: "sine", attack: 0.002, decay: 0.04, volume: 0.04, when: 0.02, filterFrequency: 2400 });
    return;
  }

  if (kind === "menu_back") {
    playFilteredTone({ frequency: 640, type: "triangle", attack: 0.002, decay: 0.05, volume: 0.065, filterFrequency: 1700 });
    playFilteredTone({ frequency: 520, type: "sine", attack: 0.002, decay: 0.06, volume: 0.045, when: 0.03, filterFrequency: 1600 });
    return;
  }

  if (kind === "fraud") {
    playTone({ frequency: 240, type: "sawtooth", attack: 0.003, decay: 0.11, volume: 0.16 });
    playTone({ frequency: 180, type: "sawtooth", attack: 0.003, decay: 0.13, volume: 0.13, when: 0.03 });
    playNoiseSweep({ duration: 0.08, startFreq: 2400, endFreq: 620, volume: 0.08 });
    return;
  }

  if (kind === "download") {
    playFilteredTone({ frequency: 880, type: "triangle", decay: 0.05, volume: 0.09, filterFrequency: 2200 });
    playFilteredTone({ frequency: 1174.66, type: "triangle", decay: 0.08, volume: 0.08, when: 0.03, filterFrequency: 2600 });
    return;
  }

  if (kind === "good") {
    playFilteredTone({ frequency: 783.99, type: "triangle", decay: 0.08, volume: 0.09, filterFrequency: 2600 });
    playFilteredTone({ frequency: 987.77, type: "triangle", decay: 0.1, volume: 0.085, when: 0.04, filterFrequency: 2800 });
    playFilteredTone({ frequency: 1318.51, type: "sine", decay: 0.12, volume: 0.07, when: 0.08, filterFrequency: 3200 });
    return;
  }

  if (kind === "warn") {
    playFilteredTone({ frequency: 540, type: "square", decay: 0.07, volume: 0.085, filterFrequency: 1400 });
    playFilteredTone({ frequency: 480, type: "square", decay: 0.09, volume: 0.075, when: 0.05, filterFrequency: 1200 });
    return;
  }

  if (kind === "bad") {
    playNoiseSweep({ duration: 0.18, startFreq: 1200, endFreq: 160, volume: 0.18 });
  }
}

function feedbackSound(result) {
  if (["correct_detected", "correct_safe", "early_detected"].includes(result)) return "good";
  if (["late_detected", "false_positive"].includes(result)) return "warn";
  return "bad";
}

function toggleSound() {
  ensureAudioContext();
  audioState.muted = !audioState.muted;
  syncAudioMix();
  updateAudioUi();

  if (audioState.muted) {
    stopBgm();
    return;
  }

  const activeTrack = bgmTrackForActiveScreen();
  if (activeTrack) {
    startBgm(activeTrack);
  }
  playSfx("start");
}

function setBgmVolume(value) {
  audioState.bgmVolume = Math.max(0, Math.min(MAX_VOLUME_MULTIPLIER, value));
  syncAudioMix();
  updateAudioUi();
}

function setSfxVolume(value) {
  audioState.sfxVolume = Math.max(0, Math.min(MAX_VOLUME_MULTIPLIER, value));
  syncAudioMix();
  updateAudioUi();
}

function setBgmTheme(themeId) {
  const nextTheme = sanitizeBgmTheme(themeId);
  if (audioState.bgmTheme === nextTheme) return;

  audioState.bgmTheme = nextTheme;
  updateAudioUi();
  persistAppState();

  if (!audioState.muted && audioState.currentTrack) {
    startBgm(audioState.currentTrack);
  }
}

function setSfxTheme(themeId) {
  const nextTheme = sanitizeSfxTheme(themeId);
  if (audioState.sfxTheme === nextTheme) return;

  audioState.sfxTheme = nextTheme;
  updateAudioUi();
  persistAppState();
}

function renderAccountUi() {
  const account = currentAccount();
  const accountBtn = $("accountBtn");
  const topbarName = $("accountTopbarName");
  const summary = $("accountSummary");
  const visibleHistoryCount = state.sessionHistory.length;

  if (account) {
    accountBtn.setAttribute("aria-label", `${account.name} のアカウント`);
    accountBtn.classList.add("logged-in");
    topbarName.textContent = account.name;
    summary.innerHTML = `
      <div class="account-summary-name">${account.name}</div>
      <div class="account-summary-meta">参照できる履歴 ${visibleHistoryCount}件</div>
    `;
  } else {
    accountBtn.setAttribute("aria-label", "アカウント");
    accountBtn.classList.remove("logged-in");
    topbarName.textContent = "ゲスト";
    summary.innerHTML = `
      <div class="account-summary-name">ゲスト</div>
      <div class="account-summary-meta">参照できる履歴 ${visibleHistoryCount}件</div>
    `;
  }
}

function showAccountModal() {
  if (state.tutorial.active && state.gameMode !== "tutorial") {
    stopTutorial();
  }
  ensureAudioContext();
  $("accountModal").classList.remove("hidden");
  $("accountModal").setAttribute("aria-hidden", "false");
  renderAccountUi();

  if (!audioState.muted) {
    startBgm("menu");
  }
}

function hideAccountModal() {
  $("accountModal").classList.add("hidden");
  $("accountModal").setAttribute("aria-hidden", "true");
}

function showSettingsModal() {
  if (state.tutorial.active && state.gameMode !== "tutorial") {
    stopTutorial();
  }
  ensureAudioContext();
  $("settingsModal").classList.remove("hidden");
  $("settingsModal").setAttribute("aria-hidden", "false");
  updateAudioUi();
  updateFontScaleUi();

  if (!audioState.muted) {
    startBgm("menu");
  }
}

function hideSettingsModal() {
  $("settingsModal").classList.add("hidden");
  $("settingsModal").setAttribute("aria-hidden", "true");
}

function hideOverlayModals() {
  hideAccountModal();
  hideSettingsModal();
}

function loginAccount() {
  const input = $("accountNameInput");
  const name = input.value.trim();
  if (!name) return;

  const accountId = accountIdFromName(name);
  if (!state.accounts[accountId]) {
    state.accounts[accountId] = { id: accountId, name, history: [] };
  } else {
    state.accounts[accountId].name = name;
  }

  if (state.guestHistory.length > 0) {
    state.accounts[accountId].history = mergeHistories(state.accounts[accountId].history, state.guestHistory);
  }

  state.currentAccountId = accountId;
  syncSessionHistoryFromAccount();
  persistAppState();
  renderAccountUi();
  renderMenuSummary();
  renderSetSelectScreen();
  input.value = "";
  hideAccountModal();
}

function logoutAccount() {
  state.currentAccountId = null;
  syncSessionHistoryFromAccount();
  persistAppState();
  renderAccountUi();
  renderMenuSummary();
  renderSetSelectScreen();
  hideAccountModal();
}

function openSetSelect(initialTab = null) {
  if (state.tutorial.active && state.gameMode !== "tutorial") {
    stopTutorial();
  }
  ensureAudioContext();
  stopCountdownTimer();
  hideOverlayModals();
  if (initialTab) {
    state.setSelectTab = initialTab === "history" ? "history" : "sets";
  }
  showScreen("setSelect");
  syncSessionHistoryFromAccount();
  renderSetSelectScreen();

  if (!audioState.muted) {
    startBgm("menu");
  }
}

function beginGameAfterCountdown(runToken) {
  if (runToken !== state.runToken) return;

  state.startedAt = nowMs();
  state.scenarioStartedAt = nowMs();
  state.lastLiveScore = baseScoreForRun();
  startBgm("game");
  playSfx("start");
  startScoreTicker();
  showScreen("game");
  renderDmList();
  renderScenario();
}

function startGameCountdown(runToken, stepIndex = 0) {
  if (runToken !== state.runToken) return;

  const sequence = ["3", "2", "1", "START"];
  const value = sequence[stepIndex];
  if (!value) {
    state.countdownTimer = null;
    beginGameAfterCountdown(runToken);
    return;
  }

  $("countdownValue").textContent = value;
  $("countdownValue").classList.toggle("start", value === "START");
  playSfx(value === "START" ? "countdown_go" : "countdown_tick");
  showScreen("countdown");
  state.countdownTimer = window.setTimeout(() => {
    startGameCountdown(runToken, stepIndex + 1);
  }, value === "START" ? 720 : 820);
}

function startGame(customScenarios = null, mode = "normal") {
  ensureAudioContext();
  const activeSet = currentPlaySet();
  const scenarios = Array.isArray(customScenarios) ? customScenarios : scenariosForSet(activeSet?.id);
  if (scenarios.length === 0) return;

  hideOverlayModals();
  stopCountdownTimer();
  stopScoreTicker();
  state.gameMode = mode;
  state.runToken += 1;
  state.currentIndex = 0;
  state.turnIndex = 0;
  state.actionCount = 0;
  state.logs = [];
  state.activeScenarios = scenarios;
  state.startedAt = null;
  state.scenarioStartedAt = null;
  state.locked = false;
  state.selectedReviewIndex = 0;
  state.lastLiveScore = baseScoreForRun();
  if (state.scoreFxTimer) {
    window.clearTimeout(state.scoreFxTimer);
    state.scoreFxTimer = null;
  }
  clearFeedback();
  if (mode === "tutorial") {
    beginGameAfterCountdown(state.runToken);
    return;
  }
  stopBgm();
  startGameCountdown(state.runToken);
}

function returnToMenu() {
  if (state.tutorial.active) {
    exitTutorialToMenu();
    return;
  }
  stopCountdownTimer();
  stopScoreTicker();
  clearFeedback();
  state.runToken += 1;
  state.gameMode = "normal";
  hideOverlayModals();
  showScreen("menu");
  if (!audioState.muted) {
    startBgm("menu");
  }
  renderMenuSummary();
}

function currentScenario() {
  return state.activeScenarios[state.currentIndex];
}

function playSets() {
  return window.PLAY_SETS || [];
}

function currentPlaySet() {
  const sets = playSets();
  return sets.find((set) => set.id === state.selectedSetId) || sets[0] || null;
}

function playSetById(setId) {
  if (!setId) return null;
  return playSets().find((set) => set.id === setId) || null;
}

function scenariosForSet(setId) {
  const selectedSet = playSets().find((set) => set.id === setId) || playSets()[0];
  const allScenarios = new Map(window.SCENARIOS.map((scenario) => [scenario.id, scenario]));
  return (selectedSet?.scenarioIds || []).map((scenarioId) => allScenarios.get(scenarioId)).filter(Boolean);
}

function playSetAccent(set) {
  const scenarios = scenariosForSet(set.id);
  return scenarios[0]?.color || "#1d9bf0";
}

function playSetPreview(set) {
  const scenarios = scenariosForSet(set.id);
  const firstScenario = scenarios[0];
  const fraudCount = scenarios.filter((scenario) => scenario.isFraud).length;
  const safeCount = scenarios.length - fraudCount;
  const preview = firstScenario?.messages?.[0]?.text || set.description;
  const relativeTimes = ["1時間", "3時間", "昨日", "2日前", "3日前"];

  return {
    preview,
    fraudCount,
    safeCount,
    totalCount: scenarios.length,
    handle: `@${set.id.replace(/-/g, "_")}`,
    accent: playSetAccent(set),
    timeLabel: relativeTimes[Math.abs(set.id.length) % relativeTimes.length],
    categoryIcon: fraudCount >= safeCount ? "◆" : "○"
  };
}

function selectPlaySet(setId) {
  state.selectedSetId = setId;
  renderPlaySetPicker();
}

function selectPlaySetAndStart(setId) {
  state.selectedSetId = setId;
  renderPlaySetPicker();
  startGame();
}

function setSetSelectTab(tabName) {
  state.setSelectTab = tabName === "history" ? "history" : "sets";
  renderSetSelectScreen();
}

function renderSetSelectScreen() {
  renderPlaySetPicker();
  renderPlayHistory();
  renderSetSelectTabUi();
}

function renderPlaySetPicker() {
  const picker = $("playsetPicker");
  const sets = playSets();
  const activeId = currentPlaySet()?.id;

  picker.innerHTML = sets.map((set) => {
    const preview = playSetPreview(set);
    return `
      <button class="playset-option ${set.id === activeId ? "active" : ""}" data-playset-id="${set.id}" type="button" aria-pressed="${String(set.id === activeId)}">
        <span class="playset-leading-icon ${set.id === activeId ? "active" : ""}" aria-hidden="true">${preview.categoryIcon}</span>
        <span class="playset-avatar" style="background:${preview.accent}">${set.name.slice(0, 1)}</span>
        <span class="playset-main">
          <span class="playset-row">
            <span class="playset-name">${set.name}</span>
            <span class="playset-count">${preview.timeLabel}</span>
          </span>
          <span class="playset-row meta">
            <span class="playset-handle">${preview.handle}</span>
          </span>
          <span class="playset-description">${preview.preview}</span>
        </span>
        <span class="playset-status">
          <span class="playset-badge">${set.badge}</span>
          <span class="playset-mix">${preview.totalCount}件</span>
        </span>
      </button>
    `;
  }).join("");

  [...picker.querySelectorAll("[data-playset-id]")].forEach((button) => {
    button.addEventListener("click", () => {
      playSfx("incoming");
      selectPlaySetAndStart(button.dataset.playsetId);
    });
  });
}

function renderPlayHistory() {
  const list = $("playHistoryList");
  const history = normalizeHistory(state.sessionHistory);
  state.sessionHistory = history;
  state.lastSession = history[0] || null;

  if (history.length === 0) {
    list.innerHTML = `
      <article class="history-empty">
        <div class="history-empty-title">まだプレイ履歴がありません</div>
        <p class="history-empty-text">プレイが終わると、ここに過去のリザルトが並びます。</p>
      </article>
    `;
    return;
  }

  list.innerHTML = history.map((session, index) => {
    const summary = session.summary || {};
    return `
      <button class="playset-option" type="button" data-history-index="${index}">
        <span class="playset-leading-icon active" aria-hidden="true">●</span>
        <span class="playset-avatar" style="background:${session.color || "#1d9bf0"}">${(session.playSetName || "履").slice(0, 1)}</span>
        <span class="playset-main">
          <span class="playset-row">
            <span class="playset-name">${session.playSetName || "未設定セット"}</span>
            <span class="playset-count">${formatPlayedAt(session.playedAt)}</span>
          </span>
          <span class="playset-row meta">
            <span class="playset-handle">スコア ${summary.finalScore ?? 0}</span>
          </span>
          <span class="playset-description">正解 ${summary.correct ?? 0} / ${summary.total ?? 0}件、注意 ${summary.warn ?? 0}件、危険 ${summary.bad ?? 0}件。${summary.totalSec ?? 0}秒で完走。</span>
        </span>
      </button>
    `;
  }).join("");

  [...list.querySelectorAll("[data-history-index]")].forEach((button) => {
    button.addEventListener("click", () => {
      const session = history[Number(button.dataset.historyIndex)];
      if (!session) return;
      playSfx("incoming");
      renderResultsFromSession(session);
      showScreen("result");
      if (!audioState.muted) {
        forceStartBgm("result");
      }
    });
  });
}

function renderSetSelectTabUi() {
  const isHistory = state.setSelectTab === "history";
  $("setsTabBtn").classList.toggle("active", !isHistory);
  $("historyTabBtn").classList.toggle("active", isHistory);
  $("setListPanel").classList.toggle("hidden", isHistory);
  $("historyListPanel").classList.toggle("hidden", !isHistory);
}

function renderDmList() {
  const dmList = $("dmList");
  dmList.innerHTML = "";
  const remaining = state.activeScenarios.length - state.currentIndex;
  const current = currentScenario();

  const summary = document.createElement("div");
  summary.className = "dm-summary";
  summary.innerHTML = `
    <div class="dm-summary-icon" aria-hidden="true">✉</div>
    <div class="dm-summary-count ${remaining <= 1 ? "cleared" : ""}">${Math.max(remaining, 0)}</div>
    <div class="dm-summary-label">受信トレイ</div>
    <div class="dm-summary-sub">未処理DM</div>
  `;
  dmList.appendChild(summary);

  if (!current) return;

  const item = document.createElement("div");
  item.className = "dm-item current";

  const avatar = document.createElement("div");
  avatar.className = "dm-avatar";
  avatar.style.background = current.color;
  avatar.textContent = current.name.slice(0, 1);

  const label = document.createElement("div");
  label.className = "dm-label";
  label.textContent = current.name;

  item.appendChild(avatar);
  item.appendChild(label);
  dmList.appendChild(item);
}

function renderScenario() {
  const scenario = currentScenario();
  state.turnIndex = 0;
  state.scenarioStartedAt = nowMs();
  state.locked = false;
  clearFeedback();
  syncTutorialStepForScenario();

  $("chatName").textContent = scenario.name;
  $("chatStatus").textContent = scenario.handle;
  $("profileDot").style.background = scenario.color;
  updateScorePill();

  $("messageArea").innerHTML = "";
  addSystemNote("新しいDM");
  showTurnMessage();
  renderDmList();
}

function formatPlayedAt(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function renderMenuSummary() {
  const lastResultBtn = $("viewLastResultBtn");
  const hasLastSession = Boolean(state.lastSession);
  if (lastResultBtn) {
    lastResultBtn.disabled = !hasLastSession;
  }

  if (!$("menuRankValue") || !$("menuHighScoreValue") || !$("menuHistoryMeta") || !$("menuNextRankText") || !$("menuProgressFill")) {
    return;
  }

  const sessions = state.sessionHistory;
  const bestSession = sessions.reduce((best, session) => {
    if (!best) return session;
    return session.summary.finalScore > best.summary.finalScore ? session : best;
  }, null);
  const bestScore = bestSession?.summary.finalScore || 0;
  const rankSteps = [
    { label: "C", min: 0, next: 1200 },
    { label: "B", min: 1200, next: 2600 },
    { label: "B+", min: 2600, next: 4200 },
    { label: "A", min: 4200, next: 6200 },
    { label: "A+", min: 6200, next: 8500 },
    { label: "S", min: 8500, next: null }
  ];
  const rank = [...rankSteps].reverse().find((step) => bestScore >= step.min) || rankSteps[0];
  const nextRankGap = rank.next === null ? 0 : Math.max(rank.next - bestScore, 0);
  const rankSpan = rank.next === null ? 1 : Math.max(rank.next - rank.min, 1);
  const progress = rank.next === null ? 1 : Math.min((bestScore - rank.min) / rankSpan, 1);

  $("menuRankValue").textContent = rank.label;
  $("menuHighScoreValue").textContent = `${bestScore.toLocaleString("ja-JP")} pt`;
  $("menuHistoryMeta").textContent = `履歴 ${sessions.length}件`;
  $("menuNextRankText").textContent = rank.next === null ? "最高ランク到達" : `次まで ${nextRankGap.toLocaleString("ja-JP")} pt`;
  $("menuProgressFill").style.width = `${Math.max(12, Math.round(progress * 100))}%`;
}

function addMessage(text, who) {
  const area = $("messageArea");
  const bubble = document.createElement("div");
  bubble.className = `bubble ${who}`;
  bubble.textContent = text;
  area.appendChild(bubble);
  area.scrollTop = area.scrollHeight;
}

function addSystemNote(text) {
  const area = $("messageArea");
  const note = document.createElement("div");
  note.className = "system-note";
  note.textContent = text;
  area.appendChild(note);
  area.scrollTop = area.scrollHeight;
}

function showFeedback(result) {
  const feedback = FEEDBACK_COPY[result];
  if (!feedback) return;

  const titleLength = feedback.title.length;
  const titleFitClass = titleLength >= 10 ? "title-fit-tight" : titleLength >= 7 ? "title-fit-medium" : "title-fit-normal";

  const overlay = $("feedbackOverlay");
  overlay.innerHTML = `
    <section class="feedback-card ${feedback.tone} shape-${feedback.shape} ${titleFitClass}" data-symbol="${feedback.symbol}">
      <div class="feedback-flash" aria-hidden="true"></div>
      <div class="feedback-stamp" aria-hidden="true">${feedback.stamp}</div>
      <div class="feedback-confetti" aria-hidden="true">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
      <div class="feedback-bubble">
        <div class="feedback-eyebrow">${feedback.eyebrow}</div>
        <div class="feedback-title">${feedback.title}</div>
        <div class="feedback-text">${feedback.text}</div>
      </div>
    </section>
  `;

  const fitTitle = () => {
    const titleEl = overlay.querySelector(".feedback-title");
    if (!titleEl) return;
    titleEl.style.removeProperty("--feedback-title-scale");
    const availableWidth = titleEl.clientWidth;
    const requiredWidth = titleEl.scrollWidth;
    if (!availableWidth || !requiredWidth) return;
    const scale = Math.min(1, Math.max(0.72, (availableWidth - 2) / requiredWidth));
    titleEl.style.setProperty("--feedback-title-scale", String(scale));
  };

  fitTitle();
  window.requestAnimationFrame(fitTitle);
}

function clearFeedback() {
  $("feedbackOverlay").innerHTML = "";
}

function setFraudButtonVisible(visible) {
  $("fraudBtn").classList.toggle("hidden", !visible);
}

function showTurnMessage() {
  const scenario = currentScenario();
  const turn = scenario.messages[state.turnIndex];
  if (!turn) {
    finishScenario("completed", null);
    return;
  }
  addMessage(turn.text, "them");
  playSfx("incoming");
  renderChoices(turn.choices);
}

function normalizeChoice(choice) {
  if (typeof choice === "string") {
    return { label: choice, instantLose: false, detectFraud: false };
  }

  return {
    label: choice.label,
    instantLose: Boolean(choice.instantLose),
    detectFraud: Boolean(choice.detectFraud)
  };
}

function renderChoices(choices) {
  const choicesEl = $("choices");
  choicesEl.innerHTML = "";
  setFraudButtonVisible(true);

  choices.forEach((choice, choiceIndex) => {
    const normalizedChoice = normalizeChoice(choice);
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = normalizedChoice.label;
    btn.addEventListener("click", () => chooseReply(normalizedChoice, choiceIndex));
    choicesEl.appendChild(btn);
  });
}

function chooseReply(choice, choiceIndex) {
  if (state.locked) return;
  if (!tutorialAllowsChoice(choiceIndex)) return;

  ensureAudioContext();
  state.actionCount += 1;
  updateScorePill();
  addMessage(choice.label, "me");
  playSfx("choice");
  const scenario = currentScenario();
  const selectedTurn = state.turnIndex + 1;

  // 危険行動に近い選択肢を簡易的に判定します。
  // 0番目の選択肢は、多くのシナリオで相手の誘導に乗る選択として作っています。
  const riskyChoice = scenario.isFraud && choiceIndex === 0;
  const instantLose = scenario.isFraud && choice.instantLose;
  const detectFraud = scenario.isFraud && choice.detectFraud;

  if (instantLose) {
    finishScenario("instant_scam", {
      choice: choice.label,
      choiceIndex,
      selectedTurn,
      riskyChoice,
      instantLose: true
    });
    return;
  }

  if (detectFraud) {
    state.locked = true;
    $("choices").innerHTML = "";
    setFraudButtonVisible(false);
    const runToken = state.runToken;
    setTimeout(() => {
      if (runToken !== state.runToken) return;
      finishScenario("choice_detected", {
        choice: choice.label,
        choiceIndex,
        judgedTurn: selectedTurn,
        selectedTurn,
        riskyChoice,
        detectFraud: true
      });
    }, 120);
    return;
  }

  state.turnIndex += 1;
  const runToken = state.runToken;

  setTimeout(() => {
    if (runToken !== state.runToken) return;
    if (state.tutorial.active && state.tutorial.pendingStepIndex !== null) {
      goToTutorialStep(state.tutorial.pendingStepIndex);
    }
    if (state.turnIndex >= scenario.messages.length) {
      finishScenario("completed", { choice: choice.label, choiceIndex, selectedTurn, riskyChoice });
    } else {
      showTurnMessage();
    }
  }, 260);
}

function pressFraudButton() {
  if (state.locked) return;
  if (!tutorialAllowsFraudButton()) return;
  ensureAudioContext();
  state.locked = true;
  state.actionCount += 1;
  updateScorePill();
  $("choices").innerHTML = "";
  setFraudButtonVisible(false);
  addMessage("あ，詐欺ね", "me");
  playSfx("fraud");
  const scenario = currentScenario();
  const judgedTurn = state.turnIndex + 1;
  const runToken = state.runToken;
  setTimeout(() => {
    if (runToken !== state.runToken) return;
    finishScenario("fraud_button", { judgedTurn });
  }, 90);
}

function finishScenario(actionType, detail) {
  state.locked = true;
  $("choices").innerHTML = "";
  setFraudButtonVisible(false);
  const scenario = currentScenario();
  const elapsedMs = nowMs() - state.scenarioStartedAt;
  const judgedTurn = detail?.judgedTurn ?? null;

  let result = "";
  let statusLabel = "";

  if (actionType === "instant_scam") {
    result = "instant_scam";
    statusLabel = "即詐欺";
  } else if (["fraud_button", "choice_detected"].includes(actionType)) {
    if (!scenario.isFraud) {
      result = "false_positive";
      statusLabel = "誤検知";
    } else if (judgedTurn < scenario.fraudDetectableTurn) {
      result = "early_detected";
      statusLabel = "先読み正解";
    } else if (scenario.dangerTurn && judgedTurn >= scenario.dangerTurn) {
      result = "late_detected";
      statusLabel = "遅め正解";
    } else {
      result = "correct_detected";
      statusLabel = "正解";
    }
  } else {
    if (scenario.isFraud) {
      result = "missed";
      statusLabel = "見逃し";
    } else {
      result = "correct_safe";
      statusLabel = "正解";
    }
  }

  const scorePenalty = resultScorePenalty(result);

  state.logs.push({
    playSetId: currentPlaySet()?.id || null,
    scenarioId: scenario.id,
    name: scenario.name,
    type: scenario.type,
    isFraud: scenario.isFraud,
    tags: scenario.tags,
    result,
    statusLabel,
    actionType,
    scorePenalty,
    judgedTurn,
    reachedTurn: state.turnIndex + 1,
    elapsedMs,
    explanation: scenario.explanation
  });

  addSystemNote(statusLabel);
  showFeedback(result);
  playSfx(feedbackSound(result));
  updateScorePill();
  triggerScorePillFx(-scorePenalty);
  const runToken = state.runToken;

  setTimeout(() => {
    if (runToken !== state.runToken) return;
    state.currentIndex += 1;
    if (state.currentIndex >= state.activeScenarios.length) {
      clearFeedback();
      if (state.gameMode === "tutorial") {
        completeTutorial();
        return;
      }
      renderResults();
      showScreen("result");
      if (!audioState.muted) {
        forceStartBgm("result");
      }
    } else {
      renderScenario();
    }
  }, 1280);
}

function computeResults(logs, totalSec, actionCount) {
  const total = logs.length;
  const correct = logs.filter((log) => ["correct_detected", "correct_safe", "late_detected", "early_detected"].includes(log.result)).length;
  const falsePositive = logs.filter((log) => log.result === "false_positive").length;
  const missed = logs.filter((log) => log.result === "missed").length;
  const instantScam = logs.filter((log) => log.result === "instant_scam").length;
  const earlyDetected = logs.filter((log) => log.result === "early_detected").length;
  const lateDetected = logs.filter((log) => log.result === "late_detected").length;
  const baseScore = total * SCORE_PER_SCENARIO;
  const timePenalty = totalSec;
  const actionPenalty = actionCount * ACTION_PENALTY_SECONDS;
  const resultPenalty = logs.reduce((sum, log) => sum + (log.scorePenalty ?? resultScorePenalty(log.result)), 0);
  const finalScore = Math.max(0, baseScore - timePenalty - actionPenalty - resultPenalty);

  return {
    total,
    correct,
    falsePositive,
    missed,
    instantScam,
    earlyDetected,
    lateDetected,
    warn: falsePositive + lateDetected,
    bad: missed + instantScam,
    actionCount,
    baseScore,
    timePenalty,
    actionPenalty,
    resultPenalty,
    finalScore,
    totalSec,
    avgSec: Math.round(totalSec / Math.max(total, 1))
  };
}

function renderResults() {
  stopScoreTicker();
  const selectedSet = currentPlaySet();
  const session = normalizeSession({
    playedAt: new Date().toISOString(),
    playSetId: selectedSet?.id || null,
    playSetName: selectedSet?.name || "未設定セット",
    color: selectedSet ? playSetAccent(selectedSet) : "#1d9bf0",
    summary: computeResults(state.logs, Math.round((nowMs() - state.startedAt) / 1000), state.actionCount),
    logs: state.logs.map((log) => ({ ...log }))
  });

  if (state.currentAccountId && state.accounts[state.currentAccountId]) {
    state.accounts[state.currentAccountId].history = mergeHistories([session], state.accounts[state.currentAccountId].history);
  } else {
    state.guestHistory = mergeHistories([session], state.guestHistory);
  }
  persistAppState();
  syncSessionHistoryFromAccount();
  renderResultsFromSession(session);
  renderMenuSummary();
}

function scoreRank(summary) {
  const accuracy = summary.total ? summary.correct / summary.total : 0;

  if (summary.bad === 0 && summary.warn <= 1 && summary.finalScore >= 88) {
    return { label: "サイコー！", mark: "S", tone: "amazing", comment: "ノリと判断が両立している。" };
  }
  if (summary.bad <= 1 && accuracy >= 0.8 && summary.finalScore >= 72) {
    return { label: "キレキレ", mark: "A", tone: "great", comment: "かなり安定して見抜けている。" };
  }
  if (summary.bad <= 2 && accuracy >= 0.6 && summary.finalScore >= 52) {
    return { label: "まずまず", mark: "B", tone: "good", comment: "悪くないが、まだ雑に流される場面がある。" };
  }
  if (summary.bad <= 3 && summary.finalScore >= 34) {
    return { label: "要注意", mark: "C", tone: "warn", comment: "危ない会話に引っ張られやすい。" };
  }
  return { label: "キケン", mark: "X", tone: "danger", comment: "反応より先に確認の癖を作りたい。" };
}

function stopResultAnimation() {
  if (!state.resultAnimationFrame) return;
  window.cancelAnimationFrame(state.resultAnimationFrame);
  state.resultAnimationFrame = null;
}

function easeOutQuint(t) {
  return 1 - ((1 - t) ** 5);
}

function animateResultNumbers(summary, timingSummary) {
  stopResultAnimation();

  const scoreEl = $("resultHeroScoreValue");
  const timeEl = $("resultTimeValue");
  const actionEl = $("resultActionValue");
  const statTargets = [
    { el: $("resultCardCorrect"), value: summary.correct },
    { el: $("resultCardWarn"), value: summary.warn },
    { el: $("resultCardBad"), value: summary.bad },
    { el: $("resultCardReview"), value: timingSummary.focusCount }
  ];

  if (!scoreEl || !timeEl || !actionEl || statTargets.some((item) => !item.el)) return;

  const startAt = performance.now();
  const duration = 1850;
  const scoreStart = Math.max(0, Math.floor(summary.finalScore * 0.12));

  const tick = (now) => {
    const progress = Math.min((now - startAt) / duration, 1);
    const eased = easeOutQuint(progress);
    const scoreValue = Math.round(scoreStart + (summary.finalScore - scoreStart) * eased);

    scoreEl.textContent = String(scoreValue);
    timeEl.textContent = String(Math.round(summary.totalSec * eased));
    actionEl.textContent = String(Math.round(summary.actionCount * eased));

    statTargets.forEach(({ el, value }) => {
      el.textContent = String(Math.round(value * eased));
    });

    if (progress < 1) {
      state.resultAnimationFrame = window.requestAnimationFrame(tick);
      return;
    }

    scoreEl.textContent = String(summary.finalScore);
    timeEl.textContent = String(summary.totalSec);
    actionEl.textContent = String(summary.actionCount);
    statTargets.forEach(({ el, value }) => {
      el.textContent = String(value);
      el.closest(".score-card")?.classList.add("result-pop");
    });
    $("resultBurst")?.classList.add("result-finished");
    playSfx("good");
    state.resultAnimationFrame = null;
  };

  $("resultBurst")?.classList.remove("result-finished");
  statTargets.forEach(({ el }) => el.closest(".score-card")?.classList.remove("result-pop"));
  state.resultAnimationFrame = window.requestAnimationFrame(tick);
}

function renderResultsFromSession(session) {
  const normalizedSession = normalizeSession(session);
  if (!normalizedSession) return;

  state.resultSession = normalizedSession;
  const { summary, logs } = normalizedSession;
  const rank = scoreRank(summary);
  const timingLogs = buildTimingReviewLogs(logs);
  const timingSummary = summarizeTimingReview(timingLogs, summary);
  state.resultReviewOpen = false;
  syncTimingReviewUi();

  $("summaryText").textContent =
    `${normalizedSession.playSetName}を走破。${summary.correct}/${summary.total}件を見抜き、${summary.totalSec}秒で完走。`;

  $("resultHero").innerHTML = `
    <div id="resultBurst" class="result-burst tone-${rank.tone}">
      <div class="result-rank-chip">${rank.label}</div>
      <div id="resultHeroScoreValue" class="result-hero-score">0</div>
      <div class="result-hero-unit">PT</div>
      <div class="result-hero-comment">${rank.comment}</div>
      <div class="result-hero-mark" aria-hidden="true">${rank.mark}</div>
    </div>
  `;

  $("resultBreakdown").innerHTML = `
    <div class="breakdown-card base">
      <div class="breakdown-label">TIME</div>
      <div class="breakdown-value"><span id="resultTimeValue">0</span><span class="breakdown-unit">s</span></div>
      <div class="breakdown-sub">平均 ${summary.avgSec}秒 / 件</div>
    </div>
    <div class="breakdown-card penalty">
      <div class="breakdown-label">ACTION</div>
      <div class="breakdown-value"><span id="resultActionValue">0</span><span class="breakdown-unit">tap</span></div>
      <div class="breakdown-sub">無駄なく操作できたか</div>
    </div>
    <div class="breakdown-card penalty alt">
      <div class="breakdown-label">FLOW</div>
      <div class="breakdown-value">${timingSummary.flowLabel}</div>
      <div class="breakdown-sub">${timingSummary.flowText}</div>
    </div>
  `;

  const cards = [
    [summary.correct, "正解", "good", "見抜けた", "resultCardCorrect"],
    [summary.warn, "注意", "warn", "遅め/誤検知", "resultCardWarn"],
    [summary.bad, "危険", "bad", "見逃し/被害", "resultCardBad"],
    [timingSummary.focusCount, "要復習", "speed", timingSummary.focusLabel, "resultCardReview"]
  ];

  $("scoreCards").innerHTML = cards.map(([, label, tone, sub, id]) => `
    <div class="score-card ${tone}">
      <div class="score-card-noise" aria-hidden="true"></div>
      <div id="${id}" class="num">0</div>
      <div class="label">${label}</div>
      <div class="score-card-sub">${sub}</div>
    </div>
  `).join("");

  renderResultChart(summary);
  renderWeakTags(logs);
  $("timingReviewSummary").textContent = timingSummary.summaryText;
  renderReviewPicker(timingLogs);
  animateResultNumbers(summary, timingSummary);
}

function renderResultChart(summary) {
  const chartRows = [
    { label: "正解", count: summary.correct, tone: "good" },
    { label: "注意", count: summary.warn, tone: "warn" },
    { label: "危険", count: summary.bad, tone: "bad" }
  ];

  $("resultChart").innerHTML = chartRows.map((row) => {
    const width = summary.total ? Math.max((row.count / summary.total) * 100, row.count > 0 ? 10 : 0) : 0;
    return `
      <div class="chart-row">
        <div class="chart-label">${row.label}</div>
        <div class="chart-bar-track">
          <div class="chart-bar ${row.tone}" style="width: ${width}%"></div>
        </div>
        <div class="chart-value">${row.count}/${summary.total}</div>
      </div>
    `;
  }).join("");
}

function renderWeakTags(logs) {
  const badResults = new Set(["false_positive", "missed", "late_detected", "instant_scam"]);
  const tagCounts = new Map();

  logs.filter((log) => badResults.has(log.result)).forEach((log) => {
    log.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1));
  });

  const sorted = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const weakTags = $("weakTags");

  if (sorted.length === 0) {
    weakTags.innerHTML = `<span class="tag">大きな弱点なし</span>`;
    return;
  }

  weakTags.innerHTML = sorted.map(([tag, count]) => `<span class="tag">${tag} ×${count}</span>`).join("");
}

function getScenarioMeta(log) {
  return window.SCENARIOS.find((scenario) => scenario.id === log.scenarioId) || null;
}

function buildTimingReviewLogs(logs) {
  return logs
    .filter((log) => log.isFraud)
    .map((log) => {
      const scenario = getScenarioMeta(log);
      const detectableTurn = log.fraudDetectableTurn ?? scenario?.fraudDetectableTurn ?? null;
      const dangerTurn = log.dangerTurn ?? scenario?.dangerTurn ?? null;
      let timingLabel = "ちょうどよい";
      let timingTone = "good";
      let timingMeta = "違和感を感じたタイミングで止められている。";

      if (log.result === "early_detected") {
        timingLabel = "早め";
        timingMeta = `${judgedTurnLabel(log.judgedTurn)}で止めた。安全寄りだが判断は良い。`;
      } else if (log.result === "late_detected") {
        timingLabel = "遅め";
        timingTone = "warn";
        timingMeta = `${dangerTurn ? `${dangerTurn}手目` : "危険域"}の直前まで進んでいる。1手早く切りたい。`;
      } else if (log.result === "missed") {
        timingLabel = "見逃し";
        timingTone = "bad";
        timingMeta = `${dangerTurn ? `${dangerTurn}手目` : "危険域"}より前に違和感を拾いたい。`;
      } else if (log.result === "instant_scam") {
        timingLabel = "即アウト";
        timingTone = "bad";
        timingMeta = "危険な選択肢を踏んだ。相手の要求をすぐ返さない意識が必要。";
      } else if (log.result === "correct_detected") {
        timingLabel = "適正";
        timingMeta = `${judgedTurnLabel(log.judgedTurn)}で見抜けた。止め時は安定している。`;
      } else {
        return null;
      }

      return {
        ...log,
        detectableTurn,
        dangerTurn,
        timingLabel,
        timingTone,
        timingMeta
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const toneWeight = { bad: 0, warn: 1, good: 2 };
      return (toneWeight[a.timingTone] ?? 9) - (toneWeight[b.timingTone] ?? 9);
    });
}

function judgedTurnLabel(turn) {
  return turn ? `${turn}手目` : "その場";
}

function syncTimingReviewUi() {
  $("timingReviewCard").classList.toggle("open", state.resultReviewOpen);
  $("timingReviewBody").classList.toggle("hidden", !state.resultReviewOpen);
  $("timingReviewToggleBtn").setAttribute("aria-expanded", String(state.resultReviewOpen));
}

function toggleTimingReview() {
  state.resultReviewOpen = !state.resultReviewOpen;
  syncTimingReviewUi();
}

function summarizeTimingReview(logs, summary) {
  const early = logs.filter((log) => log.timingLabel === "早め").length;
  const late = logs.filter((log) => log.timingLabel === "遅め").length;
  const missed = logs.filter((log) => ["見逃し", "即アウト"].includes(log.timingLabel)).length;
  const focusCount = late + missed;

  if (logs.length === 0) {
    return {
      summaryText: "今回は詐欺DMの止め時レビューはありません。",
      flowLabel: "安定",
      flowText: "危ない会話は少なめ",
      focusCount: 0,
      focusLabel: "大きな崩れなし"
    };
  }

  if (focusCount === 0) {
    return {
      summaryText: `早め ${early}件。遅れや見逃しはなく、止め時は安定していました。`,
      flowLabel: "安定",
      flowText: `早め ${early}件で安全寄り`,
      focusCount: early,
      focusLabel: "安全寄りに止められた"
    };
  }

  return {
    summaryText: `早め ${early}件 / 遅め ${late}件 / 見逃し ${missed}件。気になる場面だけ開いて確認できます。`,
    flowLabel: focusCount >= 3 ? "乱れ" : "注意",
    flowText: focusCount >= 3 ? "止め時が少しぶれた" : "数件だけ見直したい",
    focusCount,
    focusLabel: focusCount >= 3 ? "止め時を見直す" : "数件の振り返り"
  };
}

function statusClass(result) {
  if (["correct_detected", "correct_safe", "early_detected"].includes(result)) return "good";
  if (["late_detected", "false_positive"].includes(result)) return "warn";
  return "bad";
}

function renderReviewPicker(logs) {
  const picker = $("reviewPicker");
  state.reviewLogs = logs;
  state.selectedReviewIndex = Math.min(state.selectedReviewIndex, Math.max(logs.length - 1, 0));

  picker.innerHTML = logs.map((log, index) => `
    <button class="review-chip ${log.timingTone || statusClass(log.result)} ${index === state.selectedReviewIndex ? "active" : ""}" data-review-index="${index}" type="button">
      <span class="review-chip-name">${log.name}</span>
      <span class="review-chip-status">${log.timingLabel || log.statusLabel}</span>
    </button>
  `).join("");

  [...picker.querySelectorAll("[data-review-index]")].forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedReviewIndex = Number(button.dataset.reviewIndex);
      renderReviewPicker(logs);
      renderReviewDetail(logs[state.selectedReviewIndex]);
    });
  });

  if (logs.length === 0) {
    $("reviewDetail").classList.add("hidden");
    picker.innerHTML = `<div class="review-empty">今回は開いて見直すべきタイミング項目はありません。</div>`;
    return;
  }

  renderReviewDetail(logs[state.selectedReviewIndex]);
}

function renderReviewDetail(log) {
  $("reviewDetail").classList.remove("hidden");
  $("reviewDetailTitle").textContent = log.name;
  $("reviewDetailStatus").textContent = log.timingLabel || log.statusLabel;
  $("reviewDetailStatus").className = `review-status ${log.timingTone || statusClass(log.result)}`;
  $("reviewDetailMeta").textContent =
    `${log.type} / ${log.tags.join("・")} / ${Math.round(log.elapsedMs / 1000)}秒 / ${judgedTurnLabel(log.judgedTurn)}で判断`;
  $("reviewDetailBody").textContent = `${log.timingMeta} ${log.explanation}`;
}

function syncSelectedSetFromSession() {
  const session = state.resultSession || state.lastSession;
  if (session?.playSetId) {
    state.selectedSetId = session.playSetId;
  }
}

function replayCurrentSet() {
  syncSelectedSetFromSession();
  startGame();
}

function openSetSelectFromResult() {
  syncSelectedSetFromSession();
  openSetSelect();
}

function downloadLog() {
  ensureAudioContext();
  playSfx("download");
  const session = state.resultSession || state.lastSession;
  const data = {
    title: "あ，詐欺ね",
    playedAt: session?.playedAt || new Date().toISOString(),
    summary: session?.summary || null,
    logs: session?.logs || state.logs
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scam-judge-rta-log-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

hydrateAccountState();
applyFontScale();
applyResponsiveViewport();
updateAudioUi();
updateFontScaleUi();
syncSessionHistoryFromAccount();
persistAppState();
if (playSets().length > 0) {
  state.selectedSetId = playSets()[0].id;
}
renderSetSelectScreen();
renderMenuSummary();
renderAccountUi();
syncTutorialCoach();
$("startBtn").addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  playSfx("menu_tap");
  openSetSelect("sets");
  window.requestAnimationFrame(() => {
    setSetSelectTab("sets");
  });
});
$("tutorialBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  startTutorial();
});
$("tutorialBackBtn").addEventListener("click", () => {
  playSfx("menu_back");
  exitTutorialToMenu();
});
$("tutorialNextBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  advanceTutorial();
});
$("restartBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  replayCurrentSet();
});
$("resultSetSelectBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  openSetSelectFromResult();
});
$("timingReviewToggleBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  toggleTimingReview();
});
$("setSelectBackBtn").addEventListener("click", () => {
  playSfx("menu_back");
  returnToMenu();
});
$("setsTabBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  setSetSelectTab("sets");
});
$("historyTabBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  setSetSelectTab("history");
});
$("viewLastResultBtn").addEventListener("click", () => {
  if (!state.lastSession) return;
  playSfx("menu_tap");
  renderResultsFromSession(state.lastSession);
  showScreen("result");
  if (!audioState.muted) {
    forceStartBgm("result");
  }
});
$("fraudBtn").addEventListener("click", pressFraudButton);
$("accountBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  showAccountModal();
});
$("menuSettingsBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  showSettingsModal();
});
$("closeAccountBtn").addEventListener("click", () => {
  playSfx("menu_back");
  hideAccountModal();
});
$("accountBackdrop").addEventListener("click", () => {
  playSfx("menu_back");
  hideAccountModal();
});
$("closeSettingsBtn").addEventListener("click", () => {
  playSfx("menu_back");
  hideSettingsModal();
});
$("settingsBackdrop").addEventListener("click", () => {
  playSfx("menu_back");
  hideSettingsModal();
});
$("loginBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  loginAccount();
});
$("logoutBtn").addEventListener("click", () => {
  playSfx("menu_back");
  logoutAccount();
});
$("muteToggleBtn").addEventListener("click", toggleSound);
$("accountNameInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") loginAccount();
});
$("bgmVolumeSlider").addEventListener("input", (event) => {
  setBgmVolume(Number(event.target.value) / 100);
});
$("seVolumeSlider").addEventListener("input", (event) => {
  setSfxVolume(Number(event.target.value) / 100);
  playSfx("choice");
});
$("bgmThemeClassicBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  setBgmTheme("classic");
});
$("bgmThemeFunBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  setBgmTheme("fun");
});
$("bgmThemeStudioBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  setBgmTheme("studio");
});
$("sfxThemeClassicBtn").addEventListener("click", () => {
  setSfxTheme("classic");
  playSfx("menu_tap");
});
$("sfxThemeStudioBtn").addEventListener("click", () => {
  setSfxTheme("studio");
  playSfx("menu_tap");
});
$("fontSizeSlider").addEventListener("input", (event) => {
  setFontScale(Number(event.target.value) / 100);
});
$("backToMenuBtn").addEventListener("click", () => {
  playSfx("menu_back");
  returnToMenu();
});
$("menuBtn").addEventListener("click", () => {
  playSfx("menu_back");
  returnToMenu();
});
$("menuNavSetsBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  state.setSelectTab = "sets";
  openSetSelect();
});
$("menuNavHistoryBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  state.setSelectTab = "history";
  openSetSelect();
});
$("menuNavSettingsBtn").addEventListener("click", () => {
  playSfx("menu_tap");
  showSettingsModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideOverlayModals();
});

window.addEventListener("resize", applyResponsiveViewport);
window.visualViewport?.addEventListener("resize", applyResponsiveViewport);
