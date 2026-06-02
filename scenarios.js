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
  }
];

window.PLAY_SETS = [
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
