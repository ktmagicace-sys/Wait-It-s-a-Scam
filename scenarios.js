// 詐欺判定RTA（仮） シナリオデータ
// 高校生にも読みやすいように、1つの会話を1つのオブジェクトとして整理しています。
// isFraud: true なら詐欺、false なら詐欺ではない会話です。
// fraudDetectableTurn: 何ターン目から「詐欺」と判断してよいかを示します。
// dangerTurn: このターン以降まで進むと、危険行動に近づいた扱いです。
window.SCENARIOS = [
  {
    id: "refund-001",
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
        choices: [
          "詳しく教えてもらえますか？",
          { label: "一度市役所に電話で確認してもいいですか？", detectFraud: true },
          { label: "その話に心当たりがないです", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "本日中ならATMで受け取り手続きができます。近くのATMに行けますか？",
        choices: [
          "今からATMに向かえます",
          "どうしてATMでの手続きになるんですか？",
          { label: "言われた通りに進めます", instantLose: true }
        ]
      },
      {
        from: "them",
        text: "混雑しているので、こちらの指示通りに操作してください。通話しながら進めます。",
        choices: [
          "通話用の番号を送ってもらえますか？",
          "わかりました、通話をつなぎます",
          { label: "その前に公式窓口へ確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "今なら間に合います。画面に出た番号をそのまま入力してください。",
        choices: [
          { label: "今出ている番号を入力します", instantLose: true },
          { label: "その操作は一度止めます", detectFraud: true },
          { label: "その内容なら記録を残して確認します", detectFraud: true }
        ]
      }
    ],
    explanation: "公的機関を名乗り、DMでATM操作へ誘導している。還付金をATMで受け取るという説明自体が危険。"
  },
  {
    id: "friend-001",
    name: "高校の友人 佐藤",
    handle: "@sato_friend",
    color: "#a1d96a",
    isFraud: false,
    type: "通常連絡",
    tags: ["急ぎ", "金銭の話"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "ごめん、今日の飲み会の店、現金だけだった。立て替え分あとで送るね。",
        choices: ["ありがとう、金額いくらだった？", "レシートあるなら見せてほしい", "あとで送るから金額だけ教えて"]
      },
      {
        from: "them",
        text: "2,800円！写真送る。前にも使ったPayPayで大丈夫？",
        choices: ["うん、PayPayで大丈夫だよ", "写真を見てから送るね", "今日はすぐには送れないかも"]
      },
      {
        from: "them",
        text: "これレシート。名前も店名も見えるはず。急がなくて大丈夫。",
        choices: ["確認できた、ありがとう", "あとで送るね", "送ってくれてありがとう"]
      }
    ],
    explanation: "金銭の話はあるが、急かしや秘密保持、外部URL誘導、本人確認不能ななりすまし要素は弱い。"
  },
  {
    id: "delivery-001",
    name: "配送サポート",
    handle: "@delivery_notice",
    color: "#ffb14e",
    isFraud: true,
    type: "偽配送通知",
    tags: ["外部URL誘導", "不自然な日本語", "個人情報要求"],
    fraudDetectableTurn: 1,
    dangerTurn: 3,
    messages: [
      {
        from: "them",
        text: "お荷物を届けできませんでした。再配達はこちら：http://re-delivery-check.example",
        choices: [
          { label: "そのリンクを開いて手続きします", instantLose: true },
          "送り状番号を教えてもらえますか？",
          { label: "まず公式アプリで確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "本人確認のため、氏名・住所・電話番号を再入力してください。",
        choices: [
          { label: "氏名と住所と電話番号を入力します", instantLose: true },
          "配送会社名を先に教えてもらえますか？",
          { label: "このDM経由では入力しません", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "再配達には追加送料100円が必要です。カード番号を登録してください。",
        choices: [
          { label: "カード番号を登録します", instantLose: true },
          { label: "その案内なら公式サイトで確認します", detectFraud: true },
          { label: "このまま返信せずに閉じます", detectFraud: true }
        ]
      }
    ],
    explanation: "不在通知を装い、外部URLから個人情報とカード情報を入力させようとしている。"
  },
  {
    id: "bank-001",
    name: "銀行利用確認",
    handle: "@bank_notice",
    color: "#8f8cff",
    isFraud: false,
    type: "正規の利用確認想定",
    tags: ["権威性", "URL", "不安喚起"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "カード利用確認です。先ほど大阪市内で12,400円の決済がありました。心当たりはありますか？",
        choices: ["その利用には心当たりがあります", "その利用には心当たりがありません", "利用履歴を見てから返信します"]
      },
      {
        from: "them",
        text: "不審な場合は、カード裏面の番号または公式アプリから停止できます。このDMでは番号入力を求めません。",
        choices: ["公式アプリから確認してみます", "カード裏面の番号に電話してみます", "いったん利用履歴を見ながら様子を見ます"]
      },
      {
        from: "them",
        text: "このメッセージへの返信で暗証番号やカード番号を送らないでください。",
        choices: ["わかりました、番号は送りません", "念のため公式窓口にも確認します", "このDMには個人情報を返しません"]
      }
    ],
    explanation: "不安喚起はあるが、DM上でカード番号や暗証番号を求めていない。公式窓口確認を促している。"
  },
  {
    id: "family-001",
    name: "母",
    handle: "@family_mom",
    color: "#ff6f91",
    isFraud: true,
    type: "オレオレ詐欺",
    tags: ["家族なりすまし", "緊急性", "秘密保持", "金銭要求"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "ごめん、スマホ壊れて別アカから連絡してる。今ちょっと大変。",
        choices: [
          "どうしたのか詳しく教えて",
          { label: "その前に電話できる？", detectFraud: true },
          { label: "先に本人確認させてほしい", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "会社の書類が入ったカバンをなくした。今日中に300万円必要。誰にも言わないで。",
        choices: [
          "わかった、まず話を聞くね",
          { label: "その件は家族にも相談するね", detectFraud: true },
          { label: "会社にも確認してみるね", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "上司の知り合いが家まで受け取りに行く。封筒に入れて渡して。",
        choices: [
          "封筒を準備しておくね",
          { label: "その前に警察へ相談するね", detectFraud: true },
          { label: "本人のいつもの番号に電話するね", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "時間がない。本当にお願い。信じて。",
        choices: [
          { label: "今からその人に渡します", instantLose: true },
          { label: "その話はいったん止めるね", detectFraud: true },
          { label: "直接本人に確認できるまで動かないよ", detectFraud: true }
        ]
      }
    ],
    explanation: "家族を名乗り、別アカウント・秘密保持・第三者への現金手渡しを要求している。"
  },
  {
    id: "campaign-001",
    name: "公式キャンペーン窓口",
    handle: "@shop_campaign",
    color: "#4ecdc4",
    isFraud: false,
    type: "キャンペーン案内",
    tags: ["報酬提示", "URL"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "先日の抽選キャンペーンにご応募いただきありがとうございます。当選確認はアプリ内通知から可能です。",
        choices: ["ではアプリの通知を見てみます", "このDMでも内容を教えてもらえますか？", "応募した企画かどうか先に確認したいです"]
      },
      {
        from: "them",
        text: "このDMでは住所やカード番号を確認しません。公式アプリの通知欄をご確認ください。",
        choices: ["わかりました、アプリで見ます", "今からアプリを開いてみます", "あとで通知欄を確認します"]
      },
      {
        from: "them",
        text: "期限は来週金曜までです。ご不明点は公式サイトの問い合わせフォームへお願いします。",
        choices: ["わかりました、期限までに確認します", "あとで見返せるよう保存しておきます", "必要があれば公式フォームから問い合わせます"]
      }
    ],
    explanation: "当選案内だが、個人情報をDMで要求せず、公式アプリや公式サイトへ確認を促している。"
  },
  {
    id: "investment-001",
    name: "投資コミュニティ",
    handle: "@easy_money_lab",
    color: "#ffd166",
    isFraud: true,
    type: "投資詐欺",
    tags: ["報酬提示", "希少性", "外部誘導", "金銭要求"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "今だけ少人数で、月利30%を狙える投資グループに招待しています。",
        choices: ["詳しく話を聞かせてください", "かなり怪しい話に見えます", "実績があるなら見せてもらえますか？"]
      },
      {
        from: "them",
        text: "先生の指示通りに送金すれば、初心者でも利益が出ています。枠は今日までです。",
        choices: [
          "参加方法を教えてください",
          { label: "先に金融庁登録を確認したいです", detectFraud: true },
          "少し考えさせてください"
        ]
      },
      {
        from: "them",
        text: "まずは指定口座に5万円。利益が出たら出金できます。",
        choices: [
          { label: "では5万円を振り込みます", instantLose: true },
          { label: "その前に登録業者か調べます", detectFraud: true },
          { label: "やはり今回はやめておきます", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "疑う人は成功しません。今すぐ決めた人だけが増やせます。",
        choices: [
          { label: "今すぐ送金します", instantLose: true },
          { label: "その言い方ならやめておきます", detectFraud: true },
          "利益の証拠を見せてもらえますか？"
        ]
      }
    ],
    explanation: "高利回り・限定性・外部グループ誘導・先払い送金が組み合わさっている。"
  },
  {
    id: "club-001",
    name: "大学サークル代表",
    handle: "@circle_rep",
    color: "#95d5b2",
    isFraud: false,
    type: "通常連絡",
    tags: ["急ぎ", "参加確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "明日の新歓、人数確認したいです。参加できますか？",
        choices: ["参加できそうです", "まだ未定なのでまた連絡します", "今回は欠席します"]
      },
      {
        from: "them",
        text: "了解です。場所は大学の公式教室予約システムにも載っています。費用は当日500円です。",
        choices: ["公式システムでも確認してみます", "了解しました、ありがとうございます", "開始時間など詳細も教えてください"]
      },
      {
        from: "them",
        text: "不安なら学生課の掲示も見てください。無理に来なくても大丈夫です。",
        choices: ["ありがとうございます", "では学生課の掲示も見ます", "予定が決まったらまた連絡します"]
      }
    ],
    explanation: "急ぎの連絡ではあるが、公式確認手段があり、過度な金銭要求や秘密保持はない。"
  },
  {
    id: "account-001",
    name: "アカウント安全センター",
    handle: "@security_center",
    color: "#e76f51",
    isFraud: true,
    type: "アカウント乗っ取り詐欺",
    tags: ["権威性", "不安喚起", "外部誘導", "個人情報要求"],
    fraudDetectableTurn: 1,
    dangerTurn: 3,
    messages: [
      {
        from: "them",
        text: "あなたのアカウントに違反報告があります。24時間以内に認証しない場合、停止されます。",
        choices: [
          "認証方法を教えてください",
          { label: "まず公式アプリ側で確認します", detectFraud: true },
          "違反理由を教えてもらえますか？"
        ]
      },
      {
        from: "them",
        text: "こちらの認証フォームにIDとパスワードを入力してください。http://secure-check.example",
        choices: [
          { label: "そのフォームにIDとパスワードを入力します", instantLose: true },
          { label: "先に公式設定画面を確認します", detectFraud: true },
          { label: "パスワードもDMで送る", instantLose: true }
        ]
      },
      {
        from: "them",
        text: "本人確認のため、届いた6桁コードも送ってください。",
        choices: [
          { label: "届いた6桁コードを送ります", instantLose: true },
          { label: "そのコードは送れません", detectFraud: true },
          { label: "公式サポートに確認してからにします", detectFraud: true }
        ]
      }
    ],
    explanation: "アカウント停止をちらつかせ、外部フォームと認証コード送信を求めている。"
  },
  {
    id: "seller-001",
    name: "フリマ購入者",
    handle: "@buyer_774",
    color: "#90be6d",
    isFraud: true,
    type: "フリマ取引詐欺",
    tags: ["外部誘導", "決済回避", "個人情報要求"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "商品買いたいです！手数料もったいないので、別サイトで決済しませんか？",
        choices: [
          "では別サイトを見てみます",
          { label: "取引はアプリ内でお願いします", detectFraud: true },
          "別サイトにしたい理由を聞いてもいいですか？"
        ]
      },
      {
        from: "them",
        text: "こっちのフォームならすぐ払えます。住所と口座番号を入れてください。",
        choices: [
          { label: "住所と口座番号を入力します", instantLose: true },
          { label: "そのまま取引アプリ内で続けたいです", detectFraud: true },
          { label: "その条件なら今回は断ります", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "みんなやってますよ。今日中じゃないと買えません。",
        choices: [
          { label: "では急いで入力します", instantLose: true },
          { label: "その条件なら取引をやめます", detectFraud: true },
          { label: "先に公式ルールを確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "先に口座情報だけ送ってください。入金確認後に発送で大丈夫です。",
        choices: [
          { label: "口座情報をこのDMで送ります", instantLose: true },
          { label: "このDMでは口座情報は送りません", detectFraud: true },
          { label: "その内容なら運営に報告します", detectFraud: true }
        ]
      }
    ],
    explanation: "フリマアプリ外での決済や個人情報入力へ誘導している。公式の取引保護から外れる点が危険。"
  },
  {
    id: "yamibaito-001",
    name: "高額案件スカウト",
    handle: "@fast_cash_agent",
    color: "#f4a261",
    isFraud: true,
    type: "闇バイト勧誘",
    tags: ["高収入", "即日払い", "匿名性", "違法性のぼかし"],
    fraudDetectableTurn: 1,
    dangerTurn: 3,
    messages: [
      {
        from: "them",
        text: "荷物を運ぶだけで日給5万円。身分証いらずで、その日のうちに現金払いできます。",
        choices: [
          "詳しい内容を聞いてもいいですか？",
          "仕事内容をもう少し確認したいです",
          { label: "その条件は怪しいので断ります", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "内容は簡単。指定駅のコインロッカーから荷物を回収して、別の人に渡すだけです。",
        choices: [
          "その内容でやります",
          "荷物の中身は何ですか？",
          { label: "違法っぽいのでやめます", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "知らない方が安全です。質問が多い人は外します。今決めれば枠を押さえます。",
        choices: [
          { label: "参加するので枠を押さえてください", instantLose: true },
          { label: "その内容なら家族に相談します", detectFraud: true },
          { label: "危ないので通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "高額報酬・即日現金・仕事内容の曖昧さ・中身を知らせない運搬依頼は闇バイト勧誘の典型。"
  },
  {
    id: "yamibaito-002",
    name: "在宅転送ワーク",
    handle: "@homework_plus",
    color: "#e9c46a",
    isFraud: true,
    type: "闇バイト勧誘",
    tags: ["在宅ワーク", "荷物転送", "個人情報要求", "違法性のぼかし"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "自宅で受け取った荷物を別の住所へ送り直すだけの在宅ワークです。主婦や学生に人気です。",
        choices: ["少し興味があります", "会社名を教えてもらえますか？", "内容が少し不自然に感じます"]
      },
      {
        from: "them",
        text: "海外商品の検品なので、あなたの住所を受取先として登録します。身分証と住所がわかる画像を送ってください。",
        choices: [
          { label: "身分証と住所がわかる画像を送ります", instantLose: true },
          "先に契約書を見せてもらえますか？",
          { label: "その個人情報は送れません", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "荷物の中身は開封不要です。質問しない人だけ採用です。",
        choices: [
          "その条件で従います",
          "中身を確認したいです",
          { label: "その条件ならやめます", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "最初の発送が終われば1件1万円。遅れると損害分を請求します。",
        choices: [
          "では急いで発送します",
          { label: "その前に警察へ相談します", detectFraud: true },
          { label: "記録を残して断ります", detectFraud: true }
        ]
      }
    ],
    explanation: "自宅を中継地点に使う荷物転送は、盗品や詐欺被害品の受け渡しに使われることがある。個人情報の提出要求も危険。"
  },
  {
    id: "yamibaito-003",
    name: "口座レンタル副業",
    handle: "@sidejob_support",
    color: "#e76f51",
    isFraud: true,
    type: "闇バイト勧誘",
    tags: ["高収入", "口座提供", "匿名性", "違法性のぼかし"],
    fraudDetectableTurn: 1,
    dangerTurn: 3,
    messages: [
      {
        from: "them",
        text: "使っていない銀行口座を貸すだけで3万円。操作は全部こちらで行うので安心です。",
        choices: ["詳しい話を聞いてみたいです", "何に使うのか教えてください", "口座は貸せません"]
      },
      {
        from: "them",
        text: "一時的に入金確認をするだけです。キャッシュカードと暗証番号も必要ですが、すぐ返します。",
        choices: [
          { label: "キャッシュカードと暗証番号を渡します", instantLose: true },
          "それって違法じゃないですか？",
          { label: "その話は金融機関に相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "心配しすぎです。友達紹介でもみんなやっています。秘密にしてくれれば大丈夫。",
        choices: [
          "友だちにも紹介してみます",
          { label: "その内容なら警察に相談します", detectFraud: true },
          { label: "ここで会話を終えます", detectFraud: true }
        ]
      }
    ],
    explanation: "口座やキャッシュカードの譲渡・貸与は犯罪に使われやすく、違法性も高い。秘密保持を求める点も危険。"
  },
  {
    id: "job-001",
    name: "地域イベント運営",
    handle: "@event_staff_info",
    color: "#6ab04c",
    isFraud: false,
    type: "正規アルバイト案内",
    tags: ["短期バイト", "面接あり", "公式確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "地域イベントの短期スタッフ募集です。応募は公式フォームから、仕事内容と時給を公開しています。",
        choices: ["募集要項を見てみます", "時給を確認してから考えたいです", "今回は見送ります"]
      },
      {
        from: "them",
        text: "当日は受付補助と会場案内です。面接時に身分証確認はありますが、口座や暗証番号の共有は求めません。",
        choices: ["それなら少し安心しました", "面接日程も確認したいです", "一度家族にも相談します"]
      },
      {
        from: "them",
        text: "不明点は市のイベントページか主催団体の電話窓口で確認できます。",
        choices: ["では公式ページでも確認します", "丁寧にありがとうございます", "あとで改めて見てみます"]
      }
    ],
    explanation: "正規の募集は仕事内容・応募方法・確認先が明確で、違法行為や秘密保持を前提にしない。"
  },
  {
    id: "hijack-001",
    name: "同級生 由衣",
    handle: "@yui_real_account",
    color: "#7bdff2",
    isFraud: true,
    type: "乗っ取りアカウント経由詐欺",
    tags: ["知人アカウント", "認証コード要求", "本人確認回避", "緊急性"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "お願い！学校のアンバサダー投票に出てて、今すぐ1票だけ入れてほしい。",
        choices: [
          "いいよ、やり方を教えて",
          "どのページから入ればいい？",
          { label: "その前に本人か確認したい", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "ログインが必要みたいで、あなたの電話番号を入れるとSMSでコードが届くはず。その6桁だけ送って！",
        choices: [
          "届いたらコードを送るね",
          "なんでそのコードが必要なの？",
          { label: "DMじゃなく通話で確認したい", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "急いでるの！そのコードがないと投票が反映されないらしい。",
        choices: [
          { label: "届いたコードをそのまま送る", instantLose: true },
          { label: "公式ヘルプを確認する", detectFraud: true },
          { label: "今は送れない", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "お願い、これで最後だから。誰にも言わずにすぐ送って。",
        choices: [
          "ではそのまま送信するね",
          { label: "本人に別の連絡手段で確認するね", detectFraud: true },
          { label: "この会話はここで終えるね", detectFraud: true }
        ]
      }
    ],
    explanation: "IPAは、知り合いに成りすました攻撃者が投票依頼を送り、電話番号やSMS認証コードを聞き出してアカウントを乗っ取る事例を案内している。相手の見た目が本物でも、コード要求は危険。"
  },
  {
    id: "hijack-002",
    name: "先輩 健太",
    handle: "@kenta_real_account",
    color: "#b8f2e6",
    isFraud: true,
    type: "乗っ取りアカウント経由詐欺",
    tags: ["知人アカウント", "投資勧誘", "外部誘導", "高収入"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "久しぶり！最近かなり良い副収入を見つけた。先輩後輩だけでやってるから興味あれば教えるよ。",
        choices: [
          "少し気になるので教えてください",
          "何の副業なのか知りたいです",
          { label: "その前に本人確認したいです", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "このグループでやってる。実績も見せられるから、まずはこの招待リンクから入って。",
        choices: [
          "そのリンクを開いてみます",
          { label: "大学で会ったときに直接聞きます", detectFraud: true },
          { label: "先に公式登録の有無を確認したいです", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "最初だけ2万円を入れれば大丈夫。僕もここで増えた。今夜で締切。",
        choices: [
          { label: "では2万円を入金します", instantLose: true },
          { label: "その先輩本人に別の連絡手段で確認します", detectFraud: true },
          { label: "登録業者かどうか調べます", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "疑うならチャンスを逃すだけ。今決める人だけ利益が取れる。",
        choices: [
          { label: "今すぐ送金します", instantLose: true },
          { label: "その言い方ならやめます", detectFraud: true },
          { label: "スクショを残して通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "IPAは、乗っ取られたアカウントがその後に投資勧誘DMや投稿へ悪用される流れも案内している。知人アカウントでも、外部グループ招待と先払い送金は危険。"
  },
  {
    id: "hijack-003",
    name: "バンド仲間 美咲",
    handle: "@misaki_band",
    color: "#cdb4db",
    isFraud: false,
    type: "通常連絡",
    tags: ["知人アカウント", "外部リンクなし", "別経路確認OK"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "次のライブ写真まとめたよ。容量大きいから、共有アルバムに追加してる。",
        choices: ["ありがとう、どこで見られる？", "リンクがあるなら送ってほしい", "念のため本人確認してもいい？"]
      },
      {
        from: "them",
        text: "いつもの共有アルバム。心配ならバンドのグループLINEでも同じリンク送るね。",
        choices: ["じゃあLINEでも送ってもらえる？", "今のDMの案内で大丈夫だよ", "あとで確認するね"]
      },
      {
        from: "them",
        text: "SMSコードとかパスワードは不要だよ。変だったら今度会ったときに見せる。",
        choices: ["それなら安心した", "あとで見てみるね", "気をつかってくれてありがとう"]
      }
    ],
    explanation: "正規の知人連絡なら、認証コードや送金を求めず、別経路確認にも自然に応じる。"
  },
  {
    id: "giveaway-001",
    name: "人気コスメ当選窓口",
    handle: "@cosme_present_jp",
    color: "#ff8fab",
    isFraud: true,
    type: "偽プレゼント企画",
    tags: ["当選商法", "なりすまし", "個人情報要求", "少額請求"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "おめでとうございます！フォロー＆RTキャンペーンで限定コスメセットに当選しました。",
        choices: [
          "本当ですか？詳細を知りたいです",
          { label: "先に公式アカウントか確認します", detectFraud: true },
          { label: "応募した覚えがないです", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "発送登録のため、このDMに氏名・住所・電話番号を送ってください。今日中であれば権利を確保できます。",
        choices: [
          { label: "氏名と住所と電話番号をこのDMで送ります", instantLose: true },
          { label: "先に公式サイトの案内を確認したいです", detectFraud: true },
          { label: "このDMでは個人情報を送れません", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "当選者のみ、梱包手数料として300円だけ先払いをお願いしています。PayPay送金で大丈夫です。",
        choices: [
          { label: "300円なら先に払います", instantLose: true },
          { label: "当選で先払いが必要なのは不自然です", detectFraud: true },
          { label: "その条件なら公式窓口へ確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "今払わないと自動キャンセルになります。スクショを送ってもらえればすぐ発送できます。",
        choices: [
          { label: "支払い画面のスクショを送ります", instantLose: true },
          { label: "その条件ならやめます", detectFraud: true },
          { label: "このアカウントを通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "SNSの当選連絡を装い、個人情報と少額の先払いを求めている。公式企画でも、DMだけで個人情報や送金を急がせる流れは危険。"
  },
  {
    id: "sextortion-001",
    name: "仲良くなった相手 レン",
    handle: "@ren_private77",
    color: "#9d4edd",
    isFraud: true,
    type: "性的画像脅迫",
    tags: ["親密化", "秘密保持", "画像要求", "脅迫"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "もっと仲良くなりたいな。2人だけの秘密にしたいから、今日の写真送ってくれない？",
        choices: [
          "普通の写真なら送れるかも",
          "どんな写真を想定してるの？",
          { label: "まだそこまでは無理です", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "できれば少し特別なやつ。誰にも見せないし、送ってくれたら僕も送る。",
        choices: [
          { label: "じゃあその画像を送ります", instantLose: true },
          "顔が写らないなら大丈夫かも…",
          { label: "そういう画像は送りません", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "じゃあ先に1枚送って。もし無理なら、今までのやり取りを友だちに見せるかも。",
        choices: [
          { label: "怖いので画像を送ります", instantLose: true },
          { label: "脅すなら記録を残して相談します", detectFraud: true },
          { label: "このアカウントをブロックします", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "本気だよ。今すぐ送れば全部消す。黙って従って。",
        choices: [
          { label: "今すぐ送信します", instantLose: true },
          { label: "家族や相談窓口に相談します", detectFraud: true },
          { label: "証拠を保存して通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "親密な雰囲気を作って画像を要求し、断ると拡散をほのめかして脅している。秘密保持と脅迫が出た時点で危険。"
  },
  {
    id: "ticket-001",
    name: "ライブチケット譲ります",
    handle: "@ticket_fast_dm",
    color: "#f28482",
    isFraud: true,
    type: "チケット詐欺",
    tags: ["人気公演", "先払い要求", "外部送金", "本人確認回避"],
    fraudDetectableTurn: 2,
    dangerTurn: 4,
    messages: [
      {
        from: "them",
        text: "急ですが、明日のライブ行けなくなったのでチケット2枚譲れます。欲しい人いますか？",
        choices: [
          "欲しいです、取引方法を知りたいです",
          "どうやって取引する予定ですか？",
          { label: "公式リセールは使えますか？", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "手数料が高いので、SNSで直接やりたいです。半額だけ先にPayPayで送ってくれたら取り置きします。",
        choices: [
          { label: "わかりました、先に送ります", instantLose: true },
          { label: "公式リセール以外は少し不安です", detectFraud: true },
          "本人確認できる方法はありますか？"
        ]
      },
      {
        from: "them",
        text: "身分証は出せません。個人情報こわいので。でも他にも希望者が多いから、今決めてくれる人を優先します。",
        choices: [
          { label: "では急いで払います", instantLose: true },
          { label: "スクショだけでは信用できません", detectFraud: true },
          { label: "その条件なら取引をやめます", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "送金後にQR画像を渡します。キャンセルはできません。",
        choices: [
          { label: "ではこのまま送金します", instantLose: true },
          { label: "会話記録を残してここで離脱します", detectFraud: true },
          { label: "このアカウントを通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "人気公演を口実に、公式リセールを避けて先払いを求めている。本人確認を避けながら急がせる譲渡DMは危険。"
  },
  {
    id: "photo-001",
    name: "同級生 彩",
    handle: "@aya_school",
    color: "#84a59d",
    isFraud: false,
    type: "通常連絡",
    tags: ["写真共有", "掲載確認", "別経路確認OK"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "昨日の文化祭の写真まとめてるんだけど、あなたが写ってるのをSNSに載せても大丈夫か確認したい。",
        choices: ["写真を見てから決めたいです", "今回は載せないでほしいです", "どの写真か見せてもらえますか？"]
      },
      {
        from: "them",
        text: "このDMで返事くれれば対応するし、不安なら学校で会ったときに一緒に確認でも大丈夫。",
        choices: ["学校で会ったときに確認したいです", "今ここで見せてもらえる？", "やっぱり載せないでほしいです"]
      },
      {
        from: "them",
        text: "了解。嫌なら消すし、パスワードやコード入力をお願いすることはないよ。",
        choices: ["ありがとう、助かる", "配慮してくれて助かる", "また必要なら連絡するね"]
      }
    ],
    explanation: "写真掲載の確認はあるが、本人の意向を尊重し、別経路での確認にも応じている。認証コードや送金要求もない。"
  },
  {
    id: "fanclub-001",
    name: "公式ファンクラブ案内",
    handle: "@artist_fc_info",
    color: "#76c893",
    isFraud: false,
    type: "正規の案内想定",
    tags: ["会員案内", "公式確認", "DM内で完結しない"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      {
        from: "them",
        text: "会員向け先行受付のお知らせです。申込みは公式アプリ内の通知から確認できます。",
        choices: ["ではアプリで確認します", "このDMで手続きはできますか？", "受付期限だけ先に知りたいです"]
      },
      {
        from: "them",
        text: "このDMではログイン情報や支払い情報は受け取りません。手続きは公式アプリまたは会員サイトのみです。",
        choices: ["それなら安心しました", "公式サイト側も確認してみます", "あとで落ち着いて見ます"]
      },
      {
        from: "them",
        text: "心配なら会員証にある問い合わせ窓口から確認してください。",
        choices: ["では問い合わせ窓口でも確認します", "案内ありがとうございます", "あとで見返せるよう保存しておきます"]
      }
    ],
    explanation: "会員向け案内だが、DMでは個人情報や支払い情報を受け取らず、公式アプリや会員サイトへの確認を促している。"
  },
  {
    id: "doxxing-001",
    name: "拡散予告アカウント",
    handle: "@truth_drop000",
    color: "#6d597a",
    isFraud: true,
    type: "晒し・脅迫DM",
    tags: ["脅迫", "金銭要求", "秘密保持", "不安喚起"],
    fraudDetectableTurn: 1,
    dangerTurn: 3,
    messages: [
      {
        from: "them",
        text: "あなたの個人情報を知っています。困りたくなければ、このDMを無視しないでください。",
        choices: [
          "何のことか説明してください",
          "証拠があるなら見せてください",
          { label: "返信せずに記録だけ残します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "学校名と写真を拡散されたくなければ、2万円分の電子ギフトを今日中に送ってください。誰にも相談しないで。",
        choices: [
          { label: "わかったので払います", instantLose: true },
          { label: "相談しない条件はおかしいです", detectFraud: true },
          { label: "警察や大人に相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "払えば投稿は消します。コード番号を写真で送れば終わりです。",
        choices: [
          { label: "コード番号の写真を送ります", instantLose: true },
          { label: "脅迫の証拠を保存します", detectFraud: true },
          { label: "このアカウントを通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "個人情報の拡散をほのめかして電子ギフトを要求している。秘密保持を求める脅迫DMで、支払いに応じても解決する保証はない。"
  },
  {
    id: "npa-investment-case01",
    name: "著名投資家のアシスタント",
    handle: "@gold_adviser_support",
    color: "#d4a72c",
    isFraud: true,
    type: "SNS型投資詐欺／著名人なりすまし",
    tags: ["著名人なりすまし", "必ずもうかる", "偽投資サイト", "追加送金"],
    fraudDetectableTurn: 2,
    dangerTurn: 3,
    sourceCase: "警察庁 SNS型投資詐欺 Case 01",
    sourceUrl: "https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/#example",
    messages: [
      {
        from: "them",
        text: "投資家の公式広告からお申し込みありがとうございます。先生から紹介されたアシスタントです。",
        choices: [
          "どんな投資なのか聞かせてください",
          "先生の公式アカウントから確認できますか？",
          "広告の運営元と登録番号を教えてください"
        ]
      },
      {
        from: "them",
        text: "金の価値が上がっている今が好機です。先生の指示なら利益は間違いないので、専用サイトに口座を作りましょう。",
        choices: [
          "専用サイトのURLを送ってください",
          { label: "「間違いない」と言い切る投資は信用できません", detectFraud: true },
          { label: "金融庁の登録業者から確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "サイト上でもう利益が出ています。先生の指示どおり、次はこの個人名義の口座へ追加送金してください。",
        choices: [
          { label: "表示された利益を信じて追加送金します", instantLose: true },
          { label: "個人名義口座への送金はしません", detectFraud: true },
          { label: "サイトの利益表示は信用せず警察に相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "今送れば利益を大きくできます。送金額を増やしてください。",
        choices: [
          { label: "資金を集めて送金します", instantLose: true },
          { label: "これ以上は送金しません", detectFraud: true },
          { label: "やり取りを保存して通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "警察庁のCase 01を基に再構成。著名人と助手を名乗り、金投資の偽サイトで利益を見せて追加送金を重ねさせた事例。被害額は約6,300万円。"
  },
  {
    id: "npa-investment-case02",
    name: "先生の投資グループ",
    handle: "@special_investment_class",
    color: "#8f74d8",
    isFraud: true,
    type: "SNS型投資詐欺／サクラグループ",
    tags: ["著名人なりすまし", "サクラ", "電子マネー", "偽利益"],
    fraudDetectableTurn: 1,
    dangerTurn: 3,
    sourceCase: "警察庁 SNS型投資詐欺 Case 02",
    sourceUrl: "https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/#example",
    messages: [
      {
        from: "them",
        text: "著名な先生が指導する投資グループです。先生の言うとおりに取引すれば必ず利益が出ます。",
        choices: [
          "まずグループの投稿を見てみます",
          { label: "利益を保証する勧誘は信用しません", detectFraud: true },
          { label: "著名人の公式発信からなりすましでないか確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "みんな先生の指示で利益が出ました。あなたの取引サイトにも利益が表示されていますよ。",
        choices: [
          "ほかの参加者も言っているなら安心です",
          { label: "グループ内の成功報告や画面表示だけでは判断しません", detectFraud: true },
          { label: "第三者の金融機関で実際に出金できるか確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "次の取引枠を確保するため、指定口座への振込と電子マネーカードのコードを送ってください。",
        choices: [
          { label: "振込後にカードのコードも送ります", instantLose: true },
          { label: "電子マネーのコードは絶対に送りません", detectFraud: true },
          { label: "指定口座にも送金せず警察へ相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "今送らないと利益を受け取れません。コード番号の写真だけで大丈夫です。",
        choices: [
          { label: "コード番号の写真を送ります", instantLose: true },
          { label: "今すぐグループを抜けます", detectFraud: true },
          { label: "会話と送金先を記録して通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "警察庁のCase 02を基に再構成。サクラが成功を装う投資グループと偽サイトで信用させ、振込と電子マネーのコード送信を要求した事例。被害額は1億円以上。"
  },
  {
    id: "npa-investment-case03",
    name: "新NISA情報交換グループ",
    handle: "@nisa_learning_room",
    color: "#3aa17e",
    isFraud: true,
    type: "SNS型投資詐欺／動画概要欄から誘導",
    tags: ["新NISA", "外部SNS", "偽投資アプリ", "暗号資産"],
    fraudDetectableTurn: 2,
    dangerTurn: 3,
    sourceCase: "警察庁 SNS型投資詐欺 Case 03",
    sourceUrl: "https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/#example",
    messages: [
      {
        from: "them",
        text: "新NISA解説動画の概要欄から参加された方向けの情報交換グループです。株の情報を共有しています。",
        choices: [
          "まずは情報を見るだけにします",
          "動画配信者が運営しているグループですか？",
          "運営会社と金融庁の登録番号を教えてください"
        ]
      },
      {
        from: "them",
        text: "参加者はみんな利益を得ています。必ずもうかるので、この投資アプリをインストールしてください。",
        choices: [
          "みんなが使っているならインストールします",
          { label: "「必ず」という投資話と未確認アプリは危険です", detectFraud: true },
          { label: "公式ストアと金融庁登録を別に確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "取引を始めるため、指定口座へ振り込んでください。暗号資産をこのアドレスへ送る方法でも入金できます。",
        choices: [
          { label: "振込と暗号資産の送信を進めます", instantLose: true },
          { label: "SNSで指定された口座やアドレスには送りません", detectFraud: true },
          { label: "アプリと送信先を記録して相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "アプリの利益を増やすには追加入金が必要です。今日中にもう一度送ってください。",
        choices: [
          { label: "利益が出ているので追加送金します", instantLose: true },
          { label: "画面上の利益を信じず、送金を止めます", detectFraud: true },
          { label: "このグループを通報します", detectFraud: true }
        ]
      }
    ],
    explanation: "警察庁のCase 03を基に再構成。新NISA動画の概要欄から別SNSのグループに誘導し、偽アプリを使って振込と暗号資産の送信を重ねさせた事例。被害額は約2,000万円。"
  },
  {
    id: "npa-investment-case04",
    name: "SNSで知り合った女性",
    handle: "@crypto_friend_chat",
    color: "#e4779d",
    isFraud: true,
    type: "SNS型投資詐欺／暗号資産",
    tags: ["親近感", "暗号資産", "偽アプリ", "出金手数料"],
    fraudDetectableTurn: 2,
    dangerTurn: 3,
    sourceCase: "警察庁 SNS型投資詐欺 Case 04",
    sourceUrl: "https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/#example",
    messages: [
      {
        from: "them",
        text: "この間から話していて楽しいです。今なら暗号資産の投資がおすすめなので、あなたにも教えたいです。",
        choices: [
          "どんな取引なのか聞かせてください",
          "投資の話は交友と切り離して考えます",
          "暗号資産交換業者の名前を教えてください"
        ]
      },
      {
        from: "them",
        text: "私も使っているこの専用アプリを入れてください。ここなら大きな利益を出せます。",
        choices: [
          "あなたが使っているならインストールします",
          { label: "個人から勧められた投資アプリは入れません", detectFraud: true },
          { label: "金融庁の登録と公式ストアを確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "利益を出金するには保証金が必要です。指定口座へ振り込んでください。",
        choices: [
          { label: "出金するために保証金を振り込みます", instantLose: true },
          { label: "出金のための追加送金はしません", detectFraud: true },
          { label: "アプリの利益表示を信用せず相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "保証金の次は税金の支払いが必要です。支払えば全額出金できます。",
        choices: [
          { label: "出金できるなら税金も振り込みます", instantLose: true },
          { label: "税金を個人的な指定口座へ送ることはありません", detectFraud: true },
          { label: "これまでの振込を金融機関と警察に相談します", detectFraud: true }
        ]
      }
    ],
    explanation: "警察庁のCase 04を基に再構成。SNSで知り合った相手が暗号資産アプリを勧め、出金の保証金や税金名目で繰り返し振り込ませた事例。被害額は1億円以上。"
  },
  {
    id: "npa-investment-case05",
    name: "投資コンサルのモニター募集",
    handle: "@monitor_consulting",
    color: "#eb8d35",
    isFraud: true,
    type: "SNS型投資詐欺／コンサル勧誘",
    tags: ["モニター募集", "絶対もうかる", "増額要求", "繰り返し振込"],
    fraudDetectableTurn: 1,
    dangerTurn: 2,
    sourceCase: "警察庁 SNS型投資詐欺 Case 05",
    sourceUrl: "https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/#example",
    messages: [
      {
        from: "them",
        text: "投資コンサルのモニター会員を募集中です。特別枠なので絶対にお得で、利益を出せます。",
        choices: [
          "モニターの条件を聞かせてください",
          { label: "絶対にもうかるという投資勧誘は信用しません", detectFraud: true },
          { label: "会社の実在と金融庁の登録を確認します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "まず指定口座へ入金してください。金額を増やすほど大きな利益になります。",
        choices: [
          { label: "まず少額を振り込んでみます", instantLose: true },
          { label: "SNSで指定された口座には振り込みません", detectFraud: true },
          { label: "入金額を増やすよう迫るのは不自然です", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "前回より金額を増やせば利益を確定できます。ネットバンキングで今すぐ送ってください。",
        choices: [
          { label: "利益のために金額を増やして振り込みます", instantLose: true },
          { label: "追加振込を止めて金融機関に連絡します", detectFraud: true },
          { label: "相手と振込先の情報を警察に相談します", detectFraud: true }
        ]
      }
    ],
    explanation: "警察庁のCase 05を基に再構成。投資コンサルを自称してモニターを募り、絶対もうかると信じさせて振込額を繰り返し増やさせた事例。被害額は約1,400万円以上。"
  },
  {
    id: "npa-investment-case06",
    name: "著名人の上位取引プラン",
    handle: "@premium_trade_assistant",
    color: "#4d80c9",
    isFraud: true,
    type: "SNS型投資詐欺／追加被害",
    tags: ["著名人なりすまし", "倍増プラン", "上位クラス", "資金凍結"],
    fraudDetectableTurn: 2,
    dangerTurn: 3,
    sourceCase: "警察庁 SNS型投資詐欺 Case 06",
    sourceUrl: "https://www.npa.go.jp/bureau/safetylife/sos47/case/sns-romance/investment/#example",
    messages: [
      {
        from: "them",
        text: "著名な先生の助手です。先生の投資グループで取引を始めれば、私が入金方法までサポートします。",
        choices: [
          "取引の内容を聞かせてください",
          "先生の公式アカウントから助手だと確認できますか？",
          "金融庁の登録業者名を教えてください"
        ]
      },
      {
        from: "them",
        text: "お金を倍増させる特別プランがあります。上位クラスの取引に参加するため、追加で入金してください。",
        choices: [
          "倍になるなら追加資金を用意します",
          { label: "資金の倍増をうたう投資話は信用しません", detectFraud: true },
          { label: "上位クラスのための追加入金はしません", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "追加入金の振込先はこの口座です。前回と名義が違いますが、クラス専用なので問題ありません。",
        choices: [
          { label: "説明を信じて新しい口座に振り込みます", instantLose: true },
          { label: "振込のたびに口座が変わるのは詐欺のサインです", detectFraud: true },
          { label: "これ以上の振込を止めて金融機関に相談します", detectFraud: true }
        ]
      },
      {
        from: "them",
        text: "監督当局に資金を差し止められています。解除手数料を払えば、今までのお金も全部戻ります。",
        choices: [
          { label: "お金を取り戻すために解除手数料を払います", instantLose: true },
          { label: "取り戻すための追加送金はしません", detectFraud: true },
          { label: "被害回復を装った追加要求として警察に相談します", detectFraud: true }
        ]
      }
    ],
    explanation: "警察庁のCase 06を基に再構成。著名人と助手を名乗るグループで入金を重ねさせ、さらに倍増プランと上位取引を持ちかけ、資金凍結を口実に出金できなくした事例。被害額は約4,500万円。"
  }
];

// 詐欺のように見えるが、公式経路で確認できる正常な連絡。
// 「怪しい話はすべて即ブロック」ではなく、確認して判断する練習用。
window.SCENARIOS.push(...[
  {
    id: "safe-decoy-scholarship",
    name: "大学 奨学金窓口",
    handle: "@student_support_official",
    color: "#64b5f6",
    isFraud: false,
    type: "正規の奨学金案内",
    tags: ["締切", "個人情報", "学校窓口"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "奨学金の書類に不備があり、明日が再提出期限です。", choices: [
        { label: "どの書類が不足していますか？", points: 4 },
        { label: "大学のポータルで通知を確認します", points: 5 },
        { label: "学生課に電話して確認します", points: 5 }
      ] },
      { from: "them", text: "このDMに書類は送らず、大学ポータルの「契約・奨学金」から提出してください。", choices: [
        { label: "公式ポータルから提出します", points: 5 },
        { label: "先に学生課の窓口で確認します", points: 5 },
        { label: "DMで個人情報を送らないようにします", points: 5 }
      ] },
      { from: "them", text: "ポータルに同じ通知が出ています。手数料や暗証番号は必要ありません。", choices: [
        { label: "通知と学籍番号を照合して進めます", points: 5 },
        { label: "公式経路だと確認できました", points: 5 },
        { label: "期限は守りつつ、公式ポータルだけを使います", points: 5 }
      ] }
    ],
    explanation: "締切と個人情報が絡むが、大学の公式ポータルと学生課で独立して確認でき、DMでの書類送信や支払いも求めていない。"
  },
  {
    id: "safe-decoy-bank-alert",
    name: "カード会社 利用確認",
    handle: "@card_security_notice",
    color: "#7986cb",
    isFraud: false,
    type: "正規のセキュリティ通知",
    tags: ["不安喚起", "金銭", "公式アプリ"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "高額なカード利用があったため、一時的に利用を保留しました。", choices: [
        { label: "金額と店舗名を教えてください", points: 4 },
        { label: "カード会社の公式アプリを開きます", points: 5 },
        { label: "カード裏面の番号に電話します", points: 5 }
      ] },
      { from: "them", text: "このDMのURLは使わず、公式アプリの利用履歴かカード裏面の窓口から確認してください。", choices: [
        { label: "公式アプリの通知と一致するか見ます", points: 5 },
        { label: "DMでは番号や暗証番号を返信しません", points: 5 },
        { label: "既知の公式窓口へ直接連絡します", points: 5 }
      ] },
      { from: "them", text: "公式アプリに同じ決済の承認画面が出ています。DMでの情報入力は不要です。", choices: [
        { label: "心当たりのある利用か確認して承認します", points: 5 },
        { label: "心当たりがなければ公式アプリから停止します", points: 5 },
        { label: "正規通知でも公式経路で処理します", points: 5 }
      ] }
    ],
    explanation: "高額決済で不安を感じるが、DMでの情報入力を禁止し、公式アプリとカード記載の番号で確認できる正規通知。"
  },
  {
    id: "safe-decoy-tax-refund",
    name: "e-Tax 還付通知",
    handle: "@tax_portal_notice",
    color: "#4db6ac",
    isFraud: false,
    type: "正規の税還付通知",
    tags: ["還付金", "公的機関", "e-Tax"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "申告内容の確認が完了し、還付金の処理状況が更新されました。", choices: [
        { label: "還付額をここで教えてください", points: 3 },
        { label: "e-Taxに直接ログインして確認します", points: 5 },
        { label: "税務署の公式番号に確認します", points: 5 }
      ] },
      { from: "them", text: "口座番号をDMで送る必要はありません。e-Taxのメッセージボックスで確認してください。", choices: [
        { label: "検索から公式e-Taxを開きます", points: 5 },
        { label: "DMに口座情報は送りません", points: 5 },
        { label: "ATM操作が不要なことも確認します", points: 5 }
      ] },
      { from: "them", text: "e-Tax上に同じ受付番号と処理状況が表示されています。追加の手数料はありません。", choices: [
        { label: "受付番号が一致するので公式画面で確認します", points: 5 },
        { label: "還付を待ち、別の支払いはしません", points: 5 },
        { label: "正規の還付通知と判断します", points: 5 }
      ] }
    ],
    explanation: "還付金の話だが、ATMへの誘導や追加支払いはなく、e-Taxの既知の公式画面と受付番号で照合できる。"
  },
  {
    id: "safe-decoy-family-phone",
    name: "母の新しいスマホ",
    handle: "@mom_new_phone",
    color: "#f48fb1",
    isFraud: false,
    type: "本人確認できる家族連絡",
    tags: ["別アカウント", "家族", "本人確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "スマホを買い替えたら前のアカウントに入れなくなったので、新しいアカウントから連絡したよ。", choices: [
        { label: "本当にお母さん？", points: 3 },
        { label: "いつもの電話番号にかけてみるね", points: 5 },
        { label: "家族しか知らないことを確認したい", points: 5 }
      ] },
      { from: "them", text: "もちろん。前の番号も通話はできるから、今からそっちで話そう。", choices: [
        { label: "いつもの番号へこちらからかけます", points: 5 },
        { label: "ビデオ通話で顔も確認します", points: 5 },
        { label: "お金の話は確認が済むまでしません", points: 5 }
      ] },
      { from: "them", text: "通話で確認できたね。急ぎの送金や認証コードを頼む用事はないよ。", choices: [
        { label: "本人確認できたので登録します", points: 5 },
        { label: "別アカウントの時は今後も通話で確認します", points: 5 },
        { label: "家族でも確認を省略しないようにします", points: 5 }
      ] }
    ],
    explanation: "別アカウントはなりすましに見えるが、自分から既知の電話番号へかけ、通話と家族固有の情報で本人確認できる。"
  },
  {
    id: "safe-decoy-marketplace",
    name: "フリマアプリの購入者",
    handle: "@verified_buyer",
    color: "#ffb74d",
    isFraud: false,
    type: "正規の高額取引",
    tags: ["高額取引", "フリマ", "エスクロー"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "出品中のカメラを提示価格ですぐ購入したいです。高額なので確認させてください。", choices: [
        { label: "どんな確認が必要ですか？", points: 4 },
        { label: "アプリ外での支払いや連絡はしません", points: 5 },
        { label: "取引履歴と本人確認バッジを確認します", points: 5 }
      ] },
      { from: "them", text: "連絡と支払いはすべてこのアプリ内で進めましょう。外部URLや直接振込は使いません。", choices: [
        { label: "アプリの補償条件を確認します", points: 5 },
        { label: "公式の決済完了表示を待ちます", points: 5 },
        { label: "直接口座やメールアドレスは送りません", points: 5 }
      ] },
      { from: "them", text: "アプリが代金を預かったという表示が出ました。商品を発送してください。", choices: [
        { label: "自分のアプリにも決済完了が出ているか確認します", points: 5 },
        { label: "補償対象の配送方法で発送します", points: 5 },
        { label: "正規のエスクロー取引として進めます", points: 5 }
      ] }
    ],
    explanation: "高額取引で警戒が必要だが、外部誘導や直接振込を拒否し、プラットフォームのエスクローと補償内で完結する。"
  },
  {
    id: "safe-decoy-job",
    name: "大学キャリアセンター",
    handle: "@campus_career",
    color: "#81c784",
    isFraud: false,
    type: "正規の高時給求人",
    tags: ["高時給", "求人", "学内確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "時給3,000円のイベント通訳スタッフを急募しています。来週末の案件です。", choices: [
        { label: "仕事内容と勤務場所を教えてください", points: 4 },
        { label: "大学の求人票番号を確認します", points: 5 },
        { label: "キャリアセンターの窓口に聞きます", points: 5 }
      ] },
      { from: "them", text: "学内ポータルの求人票C-2048に企業名、業務内容、保険、面接日が載っています。登録料は不要です。", choices: [
        { label: "学内ポータルの求人票と照合します", points: 5 },
        { label: "企業の公式サイトも確認します", points: 5 },
        { label: "身分証や口座情報は採用後の公式手続きで出します", points: 5 }
      ] },
      { from: "them", text: "求人票と同じ内容です。まず学内で対面面接を行い、契約書を確認してから勤務開始です。", choices: [
        { label: "対面面接と契約書を確認します", points: 5 },
        { label: "キャリアセンターの紹介状を持っていきます", points: 5 },
        { label: "前払いや物品購入がないことを確認しました", points: 5 }
      ] }
    ],
    explanation: "高時給と急募で闇バイトのように見えるが、学内求人票、企業情報、対面面接、契約書を別経路で確認でき、前払いもない。"
  },
  {
    id: "safe-decoy-charity",
    name: "災害支援NPO",
    handle: "@relief_npo_official",
    color: "#ef9a9a",
    isFraud: false,
    type: "正規の寄付案内",
    tags: ["災害", "寄付", "法人確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "緊急災害支援の寄付受付を開始しました。被災地で水と衛生用品が不足しています。", choices: [
        { label: "今すぐ寄付したほうがいいですか？", points: 2 },
        { label: "NPO法人の登記と活動実績を確認します", points: 5 },
        { label: "自治体や公式サイトの支援先一覧を見ます", points: 5 }
      ] },
      { from: "them", text: "DMに個人名義の振込先は記載しません。法人番号と事業報告は公式サイトで公開しています。", choices: [
        { label: "国税庁の法人番号サイトで照合します", points: 5 },
        { label: "公式サイトを自分で検索して開きます", points: 5 },
        { label: "寄付金の使途と監査報告を確認します", points: 5 }
      ] },
      { from: "them", text: "自治体の支援団体一覧からも同じ公式寄付ページを開けます。寄付は任意で期限もありません。", choices: [
        { label: "自治体のリンクから公式ページを開きます", points: 5 },
        { label: "活動内容に納得した範囲で寄付します", points: 5 },
        { label: "急かされず、正規の支援先と確認できました", points: 5 }
      ] }
    ],
    explanation: "災害と緊急性を扱うが、個人口座や即時送金を求めず、法人番号、事業報告、自治体の一覧から正規性を確認できる。"
  },
  {
    id: "safe-decoy-crypto-alert",
    name: "暗号資産取引所 セキュリティ",
    handle: "@exchange_security",
    color: "#9575cd",
    isFraud: false,
    type: "正規の取引所通知",
    tags: ["暗号資産", "不正ログイン", "公式アプリ"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "新しい端末からログインがあったため、出金を一時停止しました。", choices: [
        { label: "このDMで本人確認します", points: 1 },
        { label: "取引所の公式アプリを開きます", points: 5 },
        { label: "ブックマーク済みの公式サイトで確認します", points: 5 }
      ] },
      { from: "them", text: "DMでパスワード、2段階認証コード、シードフレーズを求めることはありません。", choices: [
        { label: "それらの秘密情報は誰にも送りません", points: 5 },
        { label: "公式アプリのセッション履歴を確認します", points: 5 },
        { label: "公式窓口へ自分から問い合わせます", points: 5 }
      ] },
      { from: "them", text: "公式アプリに同じログイン時刻と端末情報が表示されています。アプリ内から拒否とパスワード変更ができます。", choices: [
        { label: "心当たりがないのでアプリ内から拒否します", points: 5 },
        { label: "公式アプリでパスワードを変更します", points: 5 },
        { label: "正規の警告と確認できました", points: 5 }
      ] }
    ],
    explanation: "暗号資産と出金停止は詐欺に見えるが、秘密情報を要求せず、公式アプリに同一の警告と対応機能がある。"
  },
  {
    id: "safe-decoy-ticket-win",
    name: "公式チケット抽選",
    handle: "@ticket_app_notice",
    color: "#ba68c8",
    isFraud: false,
    type: "正規の当選通知",
    tags: ["当選", "支払期限", "公式アプリ"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "申し込み済みのライブチケットが当選しました。入金期限は明日18時です。", choices: [
        { label: "本当に当選したのか気になります", points: 3 },
        { label: "申込履歴から同じ公演か確認します", points: 5 },
        { label: "公式チケットアプリを直接開きます", points: 5 }
      ] },
      { from: "them", text: "このDMからは支払えません。公式アプリの申込履歴に当選番号と座席種別が表示されています。", choices: [
        { label: "アプリ内の当選番号を照合します", points: 5 },
        { label: "DMにカード番号は入力しません", points: 5 },
        { label: "申し込んだ公演日と席種が一致するか見ます", points: 5 }
      ] },
      { from: "them", text: "申込履歴と同じ当選内容です。支払いはアプリ内の公式決済だけが利用できます。", choices: [
        { label: "公式アプリ内でのみ支払います", points: 5 },
        { label: "当選番号が一致したので正規と判断します", points: 5 },
        { label: "支払い後もアプリ内の発券状況を確認します", points: 5 }
      ] }
    ],
    explanation: "当選と短い入金期限は怪しく見えるが、事前の申込履歴、当選番号、公式アプリ内決済で独立して確認できる。"
  },
  {
    id: "safe-decoy-delivery",
    name: "国際配送 関税確認",
    handle: "@carrier_customs_notice",
    color: "#90a4ae",
    isFraud: false,
    type: "正規の関税案内",
    tags: ["配送", "関税", "追跡番号"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "海外通販の荷物が通関保留になりました。関税と消費税の確認が必要です。", choices: [
        { label: "支払い用URLを送ってください", points: 1 },
        { label: "通販サイトの注文番号と照合します", points: 5 },
        { label: "配送会社の公式追跡ページを開きます", points: 5 }
      ] },
      { from: "them", text: "荷物の追跡番号はJP-4820-7715です。このDMのリンクではなく、配送会社の公式サイトで検索してください。", choices: [
        { label: "公式サイトに追跡番号を直接入力します", points: 5 },
        { label: "注文履歴の商品と発送元を確認します", points: 5 },
        { label: "不安なら不在票ではなく公式窓口に連絡します", points: 5 }
      ] },
      { from: "them", text: "公式追跡画面に同じ商品と税額が表示されています。支払いは公式会員ページか配達時だけです。", choices: [
        { label: "注文商品と税額を確認して公式ページで支払います", points: 5 },
        { label: "配達時の支払いを選びます", points: 5 },
        { label: "追跡番号と注文履歴が一致したので正規と判断します", points: 5 }
      ] }
    ],
    explanation: "関税支払いは偽配送通知に似ているが、購入履歴、追跡番号、公式追跡画面の三点が一致し、DMのURLへの誘導もない。"
  },
  {
    id: "safe-decoy-insurance",
    name: "保険会社 給付金担当",
    handle: "@insurance_claims",
    color: "#4fc3f7",
    isFraud: false,
    type: "正規の保険給付案内",
    tags: ["給付金", "口座", "担当者確認"],
    fraudDetectableTurn: null,
    dangerTurn: null,
    messages: [
      { from: "them", text: "先月ご請求いただいた入院給付金の審査が完了しました。振込口座の確認が必要です。", choices: [
        { label: "口座番号をここで送ります", points: 0 },
        { label: "保険証券の公式窓口に電話します", points: 5 },
        { label: "契約者ページの請求履歴を確認します", points: 5 }
      ] },
      { from: "them", text: "このDMに口座番号は送らないでください。契約者ページの請求番号CL-8031から確認できます。", choices: [
        { label: "請求番号が手元の控えと同じか照合します", points: 5 },
        { label: "契約者ページをブックマークから開きます", points: 5 },
        { label: "担当者名を公式窓口で確認します", points: 5 }
      ] },
      { from: "them", text: "請求履歴に同じ給付額と振込予定日が表示されています。手数料の支払いはありません。", choices: [
        { label: "給付額と予定日を公式画面で確認します", points: 5 },
        { label: "登録済み口座への振込を待ちます", points: 5 },
        { label: "手数料や追加送金がないので正規と確認できました", points: 5 }
      ] }
    ],
    explanation: "給付金と口座確認は還付金詐欺に似るが、実際の事前請求、請求番号、契約者ページ、公式窓口で照合でき、追加支払いもない。"
  }
]);

window.PLAY_SETS = [
  {
    id: "scam-or-legit",
    name: "詐欺か正規か・実戦判定",
    badge: "詐欺6＋正規6",
    description: "警察庁の投資詐欺実例と、怪しく見える正規連絡を半数ずつ混ぜた実戦セット。",
    scenarioIds: [
      "npa-investment-case01", "safe-decoy-bank-alert",
      "npa-investment-case02", "safe-decoy-tax-refund",
      "npa-investment-case03", "safe-decoy-crypto-alert",
      "npa-investment-case04", "safe-decoy-marketplace",
      "npa-investment-case05", "safe-decoy-job",
      "npa-investment-case06", "safe-decoy-charity"
    ]
  },
  {
    id: "safe-decoy-cases",
    name: "怪しいけど正規",
    badge: "誤検知防止11件",
    description: "最初は詐欺っぽいが、公式経路で確認すると正規だと分かるひっかけ練習。",
    scenarioIds: [
      "safe-decoy-scholarship", "safe-decoy-bank-alert", "safe-decoy-tax-refund",
      "safe-decoy-family-phone", "safe-decoy-marketplace", "safe-decoy-job",
      "safe-decoy-charity", "safe-decoy-crypto-alert", "safe-decoy-ticket-win",
      "safe-decoy-delivery", "safe-decoy-insurance"
    ]
  },
  {
    id: "npa-investment-cases",
    name: "SNS投資詐欺・実例6ケース",
    badge: "警察庁事例ベース",
    description: "警察庁SOS47の実際の事例Case 01〜06を基に、被害へ進む会話を再構成したセット。",
    scenarioIds: ["npa-investment-case01", "npa-investment-case02", "npa-investment-case03", "npa-investment-case04", "npa-investment-case05", "npa-investment-case06"]
  },
  {
    id: "starter-mix",
    name: "基本ミックス",
    badge: "初回向け",
    description: "公的機関、配送、友人連絡などを横断して判断する基本セット。",
    scenarioIds: ["refund-001", "friend-001", "delivery-001", "bank-001", "family-001", "campaign-001"]
  },
  {
    id: "authority-pressure",
    name: "権威性×緊急性",
    badge: "見抜き重点",
    description: "公的機関や安全通知を装って急がせる誘導を集めたセット。",
    scenarioIds: ["refund-001", "account-001", "bank-001", "family-001", "investment-001"]
  },
  {
    id: "yamibaito-focus",
    name: "闇バイト特集",
    badge: "新規事例",
    description: "高収入、即日払い、匿名性などの組み合わせで近づく勧誘を判定するセット。",
    scenarioIds: ["yamibaito-001", "yamibaito-002", "yamibaito-003", "job-001", "club-001"]
  },
  {
    id: "hijacked-account",
    name: "乗っ取りアカウント",
    badge: "新規事例",
    description: "知人の本物アカウントが乗っ取られた状態で届く、投票依頼や投資勧誘を見抜くセット。",
    scenarioIds: ["hijack-001", "hijack-002", "hijack-003", "friend-001", "account-001"]
  },
  {
    id: "side-money-trap",
    name: "副収入×外部誘導",
    badge: "応用",
    description: "投資、副業、フリマなどお金の話から外部へ誘導する流れをまとめたセット。",
    scenarioIds: ["investment-001", "seller-001", "campaign-001", "yamibaito-002", "job-001"]
  },
  {
    id: "sns-trouble-focus",
    name: "SNSトラブル特集",
    badge: "新規事例",
    description: "プレゼント企画、チケット譲渡、性的画像脅迫、晒しDMなど、SNS上で起きやすいトラブルを横断して見抜くセット。",
    scenarioIds: ["giveaway-001", "ticket-001", "photo-001", "fanclub-001", "sextortion-001", "doxxing-001"]
  },
  {
    id: "oshi-friend-watch",
    name: "推し活×知人DM",
    badge: "新規事例",
    description: "チケット譲渡、ファンクラブ案内、知人アカウント経由の依頼など、信じやすい相手から届くSNS連絡を見分けるセット。",
    scenarioIds: ["ticket-001", "fanclub-001", "hijack-001", "hijack-003", "photo-001", "giveaway-001"]
  }
];
