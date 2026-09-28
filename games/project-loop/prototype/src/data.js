export const LIMITS = { hull:12, oxygen:10, power:8, contamination:8, turns:6, relics:4 };
export const MODES = { observe:'観察', evade:'回避', seal:'封印', repel:'迎撃' };
export const THRESHOLDS = { observe:6, evade:5, seal:7, repel:8 };
export const TOOLS = [
 {id:'light',name:'投光標識',tag:'光学',text:'光学調査の危険を防ぎ、光学異常への回避+1。'},
 {id:'silent',name:'無音曳航索',tag:'音響',text:'音響調査の危険を防ぎ、音響異常への回避+1。'},
 {id:'culture',name:'携帯培養槽',tag:'生体',text:'生体調査の危険を防ぎ、応急処置の回復+1。'}
];
export const CREW = [
 {id:'mio',name:'久瀬ミオ',role:'航海士',skill:'航海',initial:0,text:'操舵室で撤退電力−1。汚染4以上では航路予測が不確か。'},
 {id:'aoi',name:'瀬名アオイ',role:'生態研究員',skill:'研究',initial:1,text:'遭遇ごとに追加手掛かりを1つ発見。回避時に疲労+1。'},
 {id:'ren',name:'九十九レン',role:'機関医',skill:'技術・医療',initial:2,text:'機関室・医務室で船体か体力+1。遺物接続で疲労+1。'}
];
export const MODULES = [
 {name:'操舵室',icon:'⌁',effect:'回避解禁 / 電力1: 回避+1 / 2: 撤退損害−1'},
 {name:'観測室',icon:'◎',effect:'観察解禁 / 電力1: 観察+1 / 2: 意図表示'},
 {name:'研究室',icon:'⟐',effect:'封印・解析 / 電力1: 仮説補正+1 / 2: 報酬+1'},
 {name:'機関室',icon:'ϟ',effect:'迎撃・推進 / 電力1: 迎撃+1 / 2: 一時電力+1'},
 {name:'医務室',icon:'✚',effect:'治療 / 電力1: 遭遇後回復 / 2: 悪化1回無効'},
 {name:'外殻区画',icon:'⬡',effect:'防御・囮 / 電力1: 装甲1 / 2: 毎ターン損害−1'}
];
export const ENVIRONMENTS = [null,
 {name:'薄明帯',place:'沈む鳥居群',meters:640,tags:['光学','記憶'],rule:'初回調査の危険を無効化。',text:'海底へ向かって立つ鳥居が、深い側から浅い側へ番号を減らして並んでいる。'},
 {name:'無音帯',place:'白い森',meters:1420,tags:['音響','生体'],rule:'音響命令−1 / 研究命令+1。',text:'枝に見えるものはすべて、同じ巨大生物の感覚器官だった。'},
 {name:'逆潮帯',place:'空洞海',meters:2380,tags:['時間','圧力'],rule:'各遭遇の3ターン目に隊員配置2か所が入れ替わる。',text:'気泡が下へ落ちる。水の中に、水のない空洞が浮かんでいる。'},
 {name:'最深部',place:'ミナモ停泊地点',meters:3100,tags:['時間','記憶'],rule:'同じ命令を再使用すると、実行前に予告損害。',text:'破損していないミナモが停泊している。窓の向こうに人影はない。'}
];
export const ANOMALIES = [
 {id:'A01',name:'鐘口魚群',reading:'しょうこうぎょぐん',tags:['音響'],intro:'透明な魚の口内で、鐘状の器官が一斉に震える。音はまだ、届いていない。',hypotheses:['光へ集まる','大きな音を出した対象へ集まる','停止した対象を襲う'],correct:1,clues:['破損船の照明だけが無傷。光へ集まるという説明には合わない。','魚群の周囲ではソナーの反響が遅れる。発信のたびに群れの密度が増す。','無音曳航索へ魚群が近づかない。音源を動かすと群れも追従する。'],pattern:['侵入','衝撃','汚染'],favorable:['evade','observe'],rewards:['bell']}
];
export const RELICS = [
 {id:'bell',name:'鳴らない鐘',tags:['音響'],benefit:'静音航行+1',side:'3ターン目に装着隊員の疲労+1'}
];
export const DISEASES = {
 echo:{name:'反響熱',text:'音響遭遇で疲労+1 / 音響手掛かり+1'},
 dark:{name:'暗視膜',text:'薄明帯で命令−1 / 暗闇で観察+2'},
 memory:{name:'逆流記憶',text:'イベント候補1つ非表示 / 異常意図を表示'},
 salt:{name:'塩花症',text:'医療回復−1 / 生体遺物の副作用を無効'},
 pressure:{name:'水圧夢遊',text:'設備が隣へずれる / 移動先の有効電力+1'}
};
export const COMMANDS = [
 {id:'observe',name:'精密観察',module:1,cost:1,mode:'observe',base:2,tag:'研究'},
 {id:'compare',name:'記録照合',module:2,cost:1,mode:'observe',base:1,tag:'研究'},
 {id:'silent',name:'静音航行',module:0,cost:1,mode:'evade',base:2,tag:'音響'},
 {id:'thrust',name:'緊急推進',module:3,cost:2,mode:'evade',base:3,extra:'酸素−1'},
 {id:'seal',name:'封鎖手順',module:2,cost:2,mode:'seal',base:3,extra:'汚染+1'},
 {id:'stop',name:'共鳴停止',module:2,cost:1,mode:'seal',base:1,tag:'音響',extra:'装着遺物1個を一時停止'},
 {id:'shock',name:'外殻放電',module:3,cost:2,mode:'repel',base:3,extra:'船体−1'},
 {id:'decoy',name:'囮射出・回避',module:5,cost:0,mode:'evade',base:3,extra:'開始道具を消費'},
 {id:'decoyAttack',name:'囮射出・迎撃',module:5,cost:0,mode:'repel',base:3,extra:'開始道具を消費'},
 {id:'heal',name:'応急処置',module:4,cost:1,base:0,extra:'選んだ隊員の体力+1'},
 {id:'retreat',name:'撤退',module:null,cost:2,base:0,extra:'船体−2 / 酸素−1 / 報酬なし'},
 {id:'defend',name:'防御待機',module:null,cost:0,base:0,extra:'進行なし / 今ターンの船体損害−1'}
];
export const EVENTS = [];
ANOMALIES.push(
 {id:'A02',name:'白庭',reading:'はくてい',tags:['生体'],intro:'白い枝は傷口の形をしている。その一本が、先ほど船体についた擦り傷に似ていた。',hypotheses:['熱で増える','視線で動く','傷ついた生物の形を模倣して増える'],correct:2,clues:['冷えた船体にも、傷と同じ形の枝が生えている。温度は増殖と一致しない。','健康な魚の姿は存在しない。欠けた尾だけが無数に反復している。','採取器具の切断面から小さな器具が生える。損傷の形そのものが複製される。'],pattern:['妨害','侵入','変則'],favorable:['observe','seal'],rewards:['coral','specimen','anchor']},
 {id:'A03',name:'逆さの潜水士',reading:'さかさのせんすいし',tags:['時間','記憶'],intro:'海底を天井として歩く、旧式の潜水服。こちらの操作音が、一拍遅れて水中から返る。',hypotheses:['前ターンに使った命令を模倣する','最も電力の高い設備を狙う','隊員の記憶を読む'],correct:0,clues:['古い記録の命令と損傷順が一致する。被害は電力配分に関係なく発生している。','こちらが停止すると相手も停止する。命令を切り替えると、一瞬動きを失う。','潜水服内部からカイロス7の操作音。直前の命令だけが繰り返されている。'],pattern:['妨害','衝撃','妨害'],favorable:['seal','repel'],rewards:['clock','rust','box']},
 {id:'A04',name:'目を閉じる窓',reading:'めをとじるまど',tags:['光学','圧力'],intro:'海中に巨大な船窓が浮かんでいる。目を向けるたび、その内側だけが暗くなる。',hypotheses:['光を奪う','観測されていない設備を船外へ複製する','最も疲労した隊員を狙う'],correct:1,clues:['無人設備だけが二重に記録される。照明の強さを変えても同じだ。','映像を止めると、船外の機関音が増える。再び監視すると静まる。','乗員のいる部屋は複製されない。通電した設備にも、船外の写しはない。'],pattern:['妨害','変則','衝撃'],favorable:['observe','repel'],rewards:['lens','window','specimen']},
 {id:'F01',name:'先行調査船ミナモ',reading:'せんこうちょうさせん みなも',tags:['時間','記憶'],intro:'記録核はカイロス7の航海を記録している。まだ起きていない浮上事故まで、正確に。',hypotheses:['観測された未来を現実へ近づける','過去の事故だけを再生する','船内の熱源を追跡する'],correct:0,clues:['明日の日付の航海記録。書かれている損傷は、まだ一度も起きていない。','現在の配置と一致する船内図。隊員が移動すると、未来の図面だけが乱れる。','未実行の命令に対する損傷報告。同じ命令を繰り返した瞬間、記録が現実に重なる。'],pattern:['衝撃','妨害','汚染'],favorable:['observe','evade','seal','repel'],rewards:[]}
);
ANOMALIES.push(
 {id:'A05',name:'深度を食べる鯨骨',reading:'しんどをたべるげいこつ',tags:['圧力','記憶'],intro:'海溝を塞ぐ鯨骨の肋骨を一本くぐるたび、深度計の数字だけが浅くなる。船殻へかかる圧力は増え続けている。',hypotheses:['船の重量を奪う','記録された距離を現実から差し引く','最も古い計器を狂わせる'],correct:1,clues:['数字のない機械式圧力計は深度の増加を示している。異常なのは数値として保存された記録だけだ。','カメラが肋骨を自動計数した瞬間、骨までの距離が同じ本数ぶん縮んだ。映像を切ると変化が止まる。','航海ログから深度の数字を消すと、直前に通過した肋骨との距離が戻った。'],pattern:['妨害','衝撃','変則'],favorable:['observe','seal'],rewards:['anchor','rust','box'],story:{discovery:'記録局の自動音声が深度を読み上げるたび、次の肋骨が窓へ一段近づく。数字そのものが餌になっている。',encounter:'数値記録を止めなければ、計器上では海面へ戻りながら、船体だけが最深部へ押し込まれる。',resolved:'深度を数えず、圧力の変化だけで肋骨を抜けた。最後の計器には「0」ではなく、空白が残った。',retreat:'航海ログを切り離して離脱した。失った区間の深度は、誰の記憶にも残らなかった。'}},
 {id:'A06',name:'先に濡れる影',reading:'さきにぬれるかげ',tags:['光学','圧力'],intro:'浸水のない通路で、隊員の影だけが濡れている。数秒後、影と重なった船殻が内側へへこみ始めた。',hypotheses:['体温の高い隊員を追う','光が作った影の位置へ水圧を移す','疲労した隊員の幻覚である'],correct:1,clues:['無人の作業服を温めても水滴は現れない。体温と濡れ方は一致しなかった。','投光器を動かすと濡れた影も移り、元の壁の圧力音だけが止んだ。','完全な暗闇では新しいへこみが増えない。非常灯が点くと、その影から再開した。'],pattern:['衝撃','侵入','妨害'],favorable:['evade','seal'],rewards:['lens','window','anchor'],story:{discovery:'光を増やして安全を確かめるほど影が濃くなり、船外の水圧がその輪郭へ集まっていく。',encounter:'非常灯を順に落とす。暗闇の中で、濡れた足跡だけが光源のない方向へ歩き始めた。',resolved:'影の輪郭を船外の囮へ移すと、水圧は人の形のまま海中へ剝がれていった。',retreat:'照明区画を封鎖して離脱した。扉の隙間から、濡れた影だけがこちら側へ伸び続けた。'}},
 {id:'A07',name:'四人目の呼吸',reading:'よにんめのこきゅう',tags:['音響','生体'],intro:'乗員は三人。しかし集音器には、三人の呼吸の隙間を埋めるように、もう一人の吸気音が記録されている。',hypotheses:['録音された呼吸を再生する','誰かが意識して息を止めた時だけ代わりに呼吸する','酸素の最も薄い部屋へ移動する'],correct:1,clues:['睡眠中の自然な呼吸には重ならない。起きている隊員が意図して黙った時だけ、余分な吸気が増える。','録音を無人室で再生しても反応はない。聞いている隊員が息を止めると、壁の内側から返事が来る。','全員が一定の呼吸を続ける間、酸素消費と呼吸音は三人分に戻る。'],pattern:['侵入','汚染','変則'],favorable:['observe','repel'],rewards:['bell','coral','box'],story:{discovery:'息を潜めて音源を探す行為そのものが、空いた呼吸を船内へ招き入れていた。',encounter:'誰も息を止めないよう互いの呼吸を読み上げる。第四の周期だけが、次第に言葉を真似始める。',resolved:'三人が異なる拍で呼吸を続けると、余分な吸気は同期先を失い、排気管から海へ抜けた。',retreat:'酸素区画を一つ切り離した。離脱後も空の区画から、規則正しい呼吸が通信へ混ざっている。'}},
 {id:'A08',name:'帰港する雨',reading:'きこうするあめ',tags:['時間','圧力'],intro:'海底から海面へ向かって雨が降っている。粒の中には、まだ船内にあるはずの器具が錆びた姿で閉じ込められている。',hypotheses:['金属製品を古くして複製する','捨てると決めた物の未来を先に降らせる','海面の天候を上下逆に再現する'],correct:1,clues:['保管を決めた予備タンクには雨粒が生じない。廃棄欄へ印を付けた物だけが古い姿で降ってくる。','廃棄予定を取り消すと、対応する雨粒が停止し、中の錆びた器具が空洞になった。','まだ使っている曳航索を廃棄候補へ移すと、切断済みの索が直後に窓外を上昇した。'],pattern:['妨害','変則','衝撃'],favorable:['evade','observe'],rewards:['clock','rust','anchor'],story:{discovery:'雨は過去から来ているのではない。こちらが手放すと決めた瞬間から、その物の長い漂流だけを先に終えている。',encounter:'廃棄記録が増えるほど雨脚が強まり、船そのものを廃船として扱う未署名の項目が現れた。',resolved:'囮を廃棄対象として確定し射出すると、未来の雨は囮を追って上昇し、航路が開いた。',retreat:'廃棄台帳ごと投棄して離脱した。台帳の最後には、帰港後の日付でカイロス7と記されていた。'}},
 {id:'A09',name:'空欄の標本瓶',reading:'くうらんのひょうほんびん',tags:['生体','記憶'],intro:'回収した標本瓶は空で、ラベルにも名前がない。レンが「海水の瓶」と口にした瞬間、中が満ち、彼の口内だけが乾いた。',hypotheses:['最も近い生物から材料を奪う','ラベルに書かれた物を複製する','観測者が中身として言い表した物を現し、その性質を話者から奪う'],correct:2,clues:['魚のそばで無言のまま瓶を開けても何も起きない。距離だけでは中身は増えなかった。','空のラベルへ文字を書いても反応しない。書いた語を読み上げた時だけ、瓶の内側が曇った。','アオイが「鱗」と説明すると瓶に鱗が現れ、彼女の指紋が一時的に消えた。録音音声では起きない。'],pattern:['汚染','侵入','妨害'],favorable:['seal','observe'],rewards:['specimen','box','coral'],story:{discovery:'瓶は物を集めるのではなく、観測者の説明を中身に変え、その説明に必要な性質を話者から徴収している。',encounter:'船内放送が標本名を尋ね続ける。誰かが答えるたび、瓶の中身と引き換えに、その人から何かが欠ける。',resolved:'中身を定義せず「未記載」のまま遮音容器へ封じた。瓶には空白だけが満ち、船内放送は停止した。',retreat:'標本瓶を船外へ放した。最後に通信が「帰路の標本」と告げ、航路図から一本の線が消えた。'}}
);
RELICS.push(
 {id:'coral',name:'骨伝導珊瑚',tags:['音響','生体'],benefit:'音響の手掛かり+1',side:'装着隊員に反響熱'},
 {id:'lens',name:'潮目レンズ',tags:['光学'],benefit:'未調査地点の結果を事前表示',side:'薄明帯到着で汚染+1'},
 {id:'specimen',name:'瞬膜標本',tags:['光学','生体'],benefit:'観察+1 / 暗闇では+2',side:'装着隊員に暗視膜'},
 {id:'clock',name:'昨日の時計',tags:['時間'],benefit:'1遭遇1回、直前命令を選び直せる',side:'巻き戻し時に酸素−1'},
 {id:'rust',name:'未来の錆',tags:['時間','記憶'],benefit:'次の異常行動を表示',side:'報酬候補を1つ隠す'},
 {id:'box',name:'忘却箱',tags:['記憶'],benefit:'装着隊員の最初の病気を一時無効',side:'最初の手掛かりを隠す'},
 {id:'window',name:'内向きの窓',tags:['圧力'],benefit:'船体損害−1',side:'上下左右の隣接設備の電力上限1'},
 {id:'anchor',name:'呼吸する錨',tags:['圧力','生体'],benefit:'下降到着時に酸素+1',side:'浮上の共鳴損害+1'}
);
EVENTS.push(
 {name:'救難信号は船内から',choices:[{name:'扉を開ける',text:'担当の体力−1 / 酸素+2',effects:{hp:-1,oxygen:2}},{name:'無視して進む',text:'状態変化なし',effects:{}},{name:'声を記録する',text:'調査点+1 / 汚染+1',effects:{score:1,contamination:1}}],special:{crew:'ren',name:'レンが隔壁越しに調べる',text:'技術：体力を失わず酸素+1',effects:{oxygen:1}}},
 {name:'食事が一人分多い',choices:[{name:'食べる',text:'全員の疲労−1 / 汚染+1',effects:{fatigue:-1,contamination:1}},{name:'海へ捨てる',text:'状態変化なし',effects:{}},{name:'試料として記録する',text:'調査点+1 / 酸素−1',effects:{score:1,oxygen:-1}}],special:{tool:'culture',name:'培養槽で無害化する',text:'培養槽：全員の疲労−1',effects:{fatigue:-1}}},
 {name:'名前のない隊員名簿',choices:[{name:'名簿を読み解く',text:'手掛かり1つ / 汚染+1',effects:{clue:0,contamination:1}},{name:'名前を思い出す',text:'担当に逆流記憶 / 調査点+2',effects:{disease:'memory',score:2}},{name:'ページを閉じる',text:'状態変化なし',effects:{}}],special:{crew:'aoi',name:'アオイが記述を分類する',text:'研究：手掛かり1つ',effects:{clue:1}}},
 {name:'外殻を叩く規則音',choices:[{name:'応答する',text:'担当に反響熱 / 調査点+2',effects:{disease:'echo',score:2}},{name:'無音を維持する',text:'状態変化なし',effects:{}},{name:'録音して回収する',text:'鳴らない鐘を回収 / 汚染+1',effects:{relic:'bell',contamination:1}}],special:{tool:'silent',name:'曳航索へ音を逃がす',text:'無音曳航索：酸素+1',effects:{oxygen:1}}},
 {name:'漂流する自分たちの廃棄物',choices:[{name:'物資を回収する',text:'船体+1 / 酸素+1 / 担当に水圧夢遊',effects:{hull:1,oxygen:1,disease:'pressure'}},{name:'時間矛盾を研究する',text:'調査点+3 / 汚染+1',effects:{score:3,contamination:1}},{name:'残骸を避ける',text:'状態変化なし',effects:{}}],special:{crew:'mio',name:'ミオが安全に回収する',text:'航海：酸素+1',effects:{oxygen:1}}},
 {name:'深海の診察券',choices:[{name:'医務室で使用する',text:'全員の疲労−2 / 担当に塩花症',effects:{fatigue:-2,disease:'salt'}},{name:'患者名を読む',text:'調査点+2 / 担当に暗視膜',effects:{score:2,disease:'dark'}},{name:'診察券を破棄する',text:'状態変化なし',effects:{}}],special:{crew:'ren',name:'レンが処方を検証する',text:'医療：全員の疲労−1',effects:{fatigue:-1}}}
);

// Investigation reports stay close to raw observations. They provide timings,
// differences and repeatable facts without stating the rule the player must infer.
const OBSERVATIONAL_CLUES = {
 A01:['照明だけを点けた標識は七分間無傷。船内で工具を落とした直後、群れの口が一斉にこちらを向いた。','短いソナーを三回送信。反響が返るたび、発信地点の周囲に個体数が12、19、31と増えた。','無音の曳航索には近づかない。索の先で金属音を鳴らすと、群れの中心が同じ距離だけ移動した。'],
 A02:['外気2度と18度の区画で、同じ擦過痕から同じ長さの白枝が生えた。','魚体のない場所に欠けた尾の輪郭だけが27個並び、すべて欠損位置が一致している。','採取器具を切断した四秒後、その断面と同じ歯形を持つ小枝が三本現れた。'],
 A03:['旧ログの操作時刻と今回の損傷時刻に、毎回ちょうど一命令分のずれがある。','推進を止めた一拍後に潜水士も停止。操舵へ切り替える間だけ、右腕と左脚が別方向を向いた。','面窓の内側からカイロス7の操作音。聞こえたのは現在より一つ前の命令だけだった。'],
 A04:['無人の観測室だけが映像上で二つに増えた。照明を半分に落としても数は変わらない。','監視映像を切った14秒間、船外から同型機関の回転音が追加された。再接続と同時に止んだ。','乗員を入れた区画と、通電させただけの区画には船外の写しが現れなかった。'],
 A05:['機械式圧力計は7600メートル相当。デジタル深度計と航海ログだけが6120メートルを示した。','カメラの自動計数が肋骨を一本認識するたび、測距表示が同じ間隔だけ短くなった。映像停止中は変化なし。','航海ログから直前の深度数字を消去。窓を横切った肋骨が、消した桁数ぶん遠ざかった。'],
 A06:['加熱した無人作業服の影は乾いたまま。ミオが隣へ立つと、低温の床に人型の水滴が現れた。','投光器を右へ振ると濡れた輪郭も右へ移動。元の壁の軋みが止まり、新しい位置で始まった。','完全消灯の73秒間は新しい凹みなし。非常灯の点灯から三秒後、その影に沿って外板が沈んだ。'],
 A07:['02:13、睡眠中の三人の呼吸は一定。03:41、ミオが物音を聞いて息を潜めた二秒後、未登録の吸気が一回入った。','無人室の再生実験は無反応。監視室でアオイが再生終了を待つ間、波形が一周期だけ増えた。','三人がメトロノームに合わせた87秒間、酸素消費は三人分。合図直後の無音だけ四人分へ跳ねた。'],
 A08:['保管欄の予備タンクに対応する雨粒は0。廃棄欄へ印を付けた工具は、錆びた姿で17粒確認。','廃棄予定を取り消した瞬間、対応する雨粒が空洞化して上昇を止めた。','接続中の曳航索を廃棄候補へ移した11秒後、切断済みの同型索が窓外を上昇した。'],
 A09:['魚のそばで瓶を開け、三分間無言で観察。接触が二度あっても瓶の質量は変わらない。','ラベルへ「海水」と記入しても無反応。レンが文字を読み上げた時だけ内壁が曇り、舌の水分値が下がった。','アオイが「鱗」と発声。瓶に鱗が七枚現れ、同時刻から彼女の指紋を読み取れなくなった。'],
 F01:['明日の日付の航海記録に外板損傷3件。現時点の船体検査では、該当箇所に傷はない。','未来図の乗員配置は現在と一致。レンが予定外の区画へ移ると、人影と損傷記号だけが数秒乱れた。','未実行命令への損傷報告を確認。同じ命令を送った瞬間、報告と同じ位置の警報が鳴った。']
};
for (const anomaly of ANOMALIES) {
 if (OBSERVATIONAL_CLUES[anomaly.id]) anomaly.clues = OBSERVATIONAL_CLUES[anomaly.id];
}

// Each anomaly has its own inference, experiments, truth and branching outcomes.
// The trigger axis reuses ANOMALIES.hypotheses; nature and response add two more deductions.
export const MYSTERIES = {
 A01:{nature:{options:['縄張りを守る生物','音を巣へ運ぶ生きた共鳴器','船の記録を食べる機械'],correct:1},response:{options:['強い光を当てる','音源を船外へ移して静かに離れる','群れの中心を攻撃する'],correct:1},truth:'鐘状器官は音を捕食する群体の巣であり、集めた音から次の魚を孵化させている。',experiments:[{id:'pulse',name:'短いソナーを三方向へ放つ',question:'群れは音量と方向のどちらを追うか。',result:'三群に割れ、それぞれ最後の発信点を囲んだ。音の大きさより、発生した場所を記憶している。',effects:{oxygen:-1}},{id:'lamp',name:'無音の投光標識を流す',question:'光だけを囮にできるか。',result:'魚は標識を避けた。だが標識に当たった船体音へ、一斉に口を向けた。',effects:{}},{id:'echo',name:'過去の船内音を再生する',question:'録音にも反応するか。',result:'群れの一部が孵化し、録音に含まれた声と同じ間隔で鐘を震わせ始めた。',effects:{contamination:1}}],outcomes:[{id:'escape',name:'全音源を切って漂流する',required:0,text:'群れは最後の機関音へ集まり、停止した船を見失った。鐘の音だけが航海ログに残る。',effects:{oxygen:-1},reveal:false},{id:'solve',name:'曳航音源へ群れを導く',required:2,text:'音を船外へ移すと群れは渦をほどき、音源を包んで暗闇へ消えた。',effects:{score:3},reveal:true},{id:'contain',name:'幼体の鐘を採取する',required:2,text:'無音容器の中で幼体は鳴らない鐘へ変わった。蓋を触ると、遠い声が指へ響く。',effects:{contamination:1},relic:'bell',reveal:true},{id:'accept',name:'船内音を一つ与える',required:3,experiments:2,text:'群れは乗員の心音を覚えて道を開けた。以後、四人分の心音が船外から同行する。',effects:{score:5,contamination:2},reveal:true}]},
 A02:{nature:{options:['急成長する珊瑚','傷の形だけを保存する生体記録媒体','失われた部位を治す生物'],correct:1},response:{options:['船体を加熱する','新しい傷を作らず完全な形を見せる','枝をすべて切断する'],correct:1},truth:'白庭は生物ではなく傷そのものを標本化する記録器官で、観測した欠損を無限に複製する。',experiments:[{id:'whole',name:'無傷の模型を置く',question:'完全な形も複製するか。',result:'模型の表面には何も生えず、その隣の小さな欠けだけが白い枝になった。',effects:{}},{id:'cut',name:'一本だけ枝を切る',question:'切断は増殖を止めるか。',result:'切断面と同じ形の枝が庭全体に現れた。破壊は新しい見本を与えてしまう。',effects:{hull:-1}},{id:'scar',name:'古い修理痕を照合する',question:'時間の古い傷にも反応するか。',result:'修理前の形が枝の年輪に残っていた。庭は傷が治った後も欠損を保存している。',effects:{oxygen:-1}}],outcomes:[{id:'escape',name:'接触せず後退する',required:0,text:'白庭を刺激せず離れた。窓には船体の古傷と同じ枝が一本残った。',effects:{oxygen:-1},reveal:false},{id:'solve',name:'完全な船体像を投影する',required:2,text:'欠損のない輪郭を見せ続けると、枝は模倣する傷を失って崩れた。',effects:{score:3},reveal:true},{id:'contain',name:'無傷の容器へ切片を封じる',required:2,text:'切片は容器の継ぎ目だけを複製し、瞬膜のような薄片へ変わった。',effects:{contamination:1},relic:'specimen',reveal:true},{id:'accept',name:'船体の損傷を記録させる',required:3,experiments:2,text:'庭はカイロス7の全損傷を引き受けたが、白い船の複製が海底に完成した。',effects:{hull:3,score:4,contamination:2},reveal:true}]},
 A03:{nature:{options:['遭難者の残留思念','直前の行動だけを身体にする時間の反射','未来から来た隊員'],correct:1},response:{options:['同じ命令を繰り返す','異なる行動を交互に行い模倣を崩す','潜水服を回収する'],correct:1},truth:'潜水士の中身は空で、直前の行動だけを一拍遅れて実体化する時間の反射である。',experiments:[{id:'still',name:'全員が動きを止める',question:'停止も模倣するか。',result:'潜水士も一拍遅れて停止した。内部から、停止直前の操作音だけが続いた。',effects:{}},{id:'swap',name:'二つの命令を交互に送る',question:'複数の行動を保持できるか。',result:'切り替えのたびに四肢の向きが食い違い、歩行が崩れた。保持できるのは一つ前だけだ。',effects:{oxygen:-1}},{id:'name',name:'隊員名を呼びかける',question:'人の記憶へ反応するか。',result:'名前には反応せず、呼びかけに使った送信操作だけを再現した。',effects:{contamination:1}}],outcomes:[{id:'escape',name:'停止したまま潮流へ乗る',required:0,text:'潜水士も停止し、船だけが潮に運ばれた。空の面窓は最後までこちらを向いていた。',effects:{oxygen:-1},reveal:false},{id:'solve',name:'交互命令で反射をほどく',required:2,text:'矛盾する動作を重ねると潜水服は一拍ごとに古くなり、海底の錆へ戻った。',effects:{score:3},reveal:true},{id:'contain',name:'最後の一拍を時計へ封じる',required:2,text:'再現される直前の一秒を切り離し、止まった時計として回収した。',effects:{contamination:1},relic:'clock',reveal:true},{id:'accept',name:'未来の命令を先に与える',required:3,experiments:2,text:'潜水士はまだ行っていない命令を実行した。航海記録には、翌日の帰路が一行増えた。',effects:{score:5,contamination:2},reveal:true}]},
 A04:{nature:{options:['巨大生物の眼','見られていない船内を外側へ写す窓','別の海へ通じる入口'],correct:1},response:{options:['すべての照明を消す','全設備を人か電力で観測状態にする','窓へ近づいて内側を見る'],correct:1},truth:'窓は観測されていない船内区画を海中へ複製し、元の区画と入れ替えようとしている。',experiments:[{id:'empty',name:'無人倉庫の監視を切る',question:'何が複製対象になるか。',result:'船外に倉庫の輪郭が現れ、内部の工具だけが窓の向こうへ一つずつ移った。',effects:{hull:-1}},{id:'power',name:'無人区画へ通電する',question:'人の視線が必要か。',result:'誰も見ていないのに複製が止まった。通電状態そのものが観測として扱われている。',effects:{oxygen:-1}},{id:'dark',name:'窓を暗幕で覆う',question:'こちらから見なければ止まるか。',result:'映像は消えたが船外の機関音が増えた。見る側ではなく、見られていない区画を探している。',effects:{contamination:1}}],outcomes:[{id:'escape',name:'不要区画を切り離す',required:0,text:'空の倉庫を身代わりにして離脱した。海中には灯りのない倉庫が残った。',effects:{hull:-1},reveal:false},{id:'solve',name:'全設備を観測状態にする',required:2,text:'複製先を失った窓は自分自身を写し、無数の小さな窓になって閉じた。',effects:{score:3},reveal:true},{id:'contain',name:'閉じる瞬間の窓を回収する',required:2,text:'内側だけを向く小さな窓が残った。覗くと現在いる部屋の背後が映る。',effects:{contamination:1},relic:'window',reveal:true},{id:'accept',name:'船外の複製へ乗り移る',required:3,experiments:2,text:'乗員は無傷の複製船へ移った。元のカイロス7には、こちらを観測する三人が残った。',effects:{hull:4,score:4,contamination:2},reveal:true}]},
 A05:{nature:{options:['巨大生物の遺骸','数値で記録された距離を食べる骨格','深度計を狂わせる磁場'],correct:1},response:{options:['速度を上げて通過する','数値記録を止め圧力だけで航行する','骨を破壊して道を開く'],correct:1},truth:'鯨骨は数として確定した距離を現実から差し引き、記録された船を骨の内側へ近づける。',experiments:[{id:'analog',name:'目盛りのない圧力計だけを使う',question:'数値でなければ距離を奪われないか。',result:'圧力は増したが肋骨の位置は動かなかった。針を数えた瞬間だけ、骨が近づいた。',effects:{}},{id:'erase',name:'直前の深度記録を消す',question:'確定済みの距離を戻せるか。',result:'消した数字と同じ距離だけ肋骨が遠ざかった。乗員の記憶からもその深度が抜け落ちた。',effects:{contamination:1}},{id:'count',name:'無人カメラに骨を数えさせる',question:'人間の認識が必要か。',result:'自動計数でも距離が縮んだ。観測者ではなく、保存された数値そのものを食べている。',effects:{hull:-1}}],outcomes:[{id:'escape',name:'航海ログを投棄する',required:0,text:'記録を餌に離脱した。失った海域の深度は、誰にも説明できなくなった。',effects:{score:-1},reveal:false},{id:'solve',name:'無数値航法で通過する',required:2,text:'圧力と時間だけを頼りに骨を抜けた。深度計には空白が残った。',effects:{score:3},reveal:true},{id:'contain',name:'数字を与えた骨片を回収する',required:2,text:'骨片は船内の距離表示を吸い込み、呼吸する錨へ変わった。',effects:{contamination:1},relic:'anchor',reveal:true},{id:'accept',name:'船の深度を空欄にする',required:3,experiments:2,text:'カイロス7は海図上の深度から消え、どの水圧にも属さない航路へ入った。',effects:{score:5,contamination:2},reveal:true}]},
 A06:{nature:{options:['浸水の予兆','影の位置へ外圧を移す二次元の水塊','疲労による集団幻覚'],correct:1},response:{options:['照明を最大にする','影を船外の囮へ移して消灯する','濡れた影を拭き取る'],correct:1},truth:'濡れた影は水そのものではなく、光が作った輪郭へ船外の水圧を移す平面状の生物である。',experiments:[{id:'heat',name:'無人服だけを温める',question:'体温を追跡しているか。',result:'服の影は乾いたままだった。人の影も体温が変わっても濡れ方は変わらない。',effects:{}},{id:'move',name:'投光器をゆっくり動かす',question:'圧力は影と一緒に移動するか。',result:'濡れた輪郭が壁を渡り、通過した場所だけ船殻の軋みが止まった。',effects:{hull:-1}},{id:'blackout',name:'完全消灯を五秒だけ行う',question:'影がなければ存在できないか。',result:'新しいへこみは止まった。再点灯時、影は光源より一瞬早く床へ現れた。',effects:{contamination:1}}],outcomes:[{id:'escape',name:'照明区画を封鎖する',required:0,text:'暗い区画を残して離脱した。扉の下から濡れた影だけが追ってきた。',effects:{oxygen:-1},reveal:false},{id:'solve',name:'船外の囮へ影を移す',required:2,text:'人型の圧力は囮の影へ剝がれ、深海へ沈んだ。へこんだ壁だけが元へ戻らない。',effects:{score:3},reveal:true},{id:'contain',name:'無影灯の容器へ封じる',required:2,text:'影のない容器は外圧を内側へ向け続ける小さな窓になった。',effects:{hull:-1},relic:'window',reveal:true},{id:'accept',name:'影を一人分残す',required:3,experiments:2,text:'濡れた影は隊員の輪郭を覚えた。以後、その隊員だけ水圧を受けず海中を歩ける。',effects:{score:5,contamination:2},reveal:true}]},
 A07:{nature:{options:['音響装置の故障','記録から消された第四の乗員が呼吸の空白に宿っている','酸素を求める深海生物'],correct:1},response:{options:['録音した呼吸を流し続ける','全員で異なる拍を保ち、名前を呼ぶか排気先を選ぶ','酸素濃度を下げる'],correct:1},truth:'第四の呼吸はミナモの実験で記録と記憶から消された乗員・冬城ユラの残響で、意識的に空けられた呼吸へ入り身体を取り戻そうとしている。',experiments:[{id:'hold',name:'一人だけ意識して息を止める',question:'自然な無音と意識的な無音を区別するか。',result:'停止から二秒後、壁の内側が代わりに吸った。呼気には止めた本人の声が混ざっていた。',effects:{oxygen:-1}},{id:'recording',name:'無人室で録音を再生する',question:'音そのものへ反応するか。',result:'録音だけでは何も起きない。監視員が息を潜めた瞬間、再生音に四つ目の周期が加わった。',effects:{}},{id:'call',name:'第四の周期へ質問する',question:'意思や記憶を持つ存在か。',result:'呼吸は「ユラ」と答えた。乗員名簿の空欄に、濡れた筆跡で冬城ユラと現れた。',effects:{contamination:1}}],outcomes:[{id:'escape',name:'酸素区画を切り離す',required:0,text:'第四の呼吸を空の区画へ残して離脱した。通信には規則正しい吸気音が残り続ける。',effects:{oxygen:-1},reveal:false},{id:'solve',name:'異なる拍で呼吸し排気する',required:2,text:'同期先を失った呼吸は排気管から海へ抜けた。最後に「忘れないで」と一度だけ声になった。',effects:{score:3},reveal:true},{id:'contain',name:'無音容器へ呼吸を封じる',required:2,text:'容器は鳴らない鐘へ変わった。耳を当てると冬城ユラがミナモの事故を語り続ける。',effects:{contamination:1},relic:'bell',reveal:true},{id:'accept',name:'四人目として名前を呼ぶ',required:3,experiments:2,text:'空席に濡れた隊員が現れた。記録は書き換わり、カイロス7は最初から四人で出航していたことになった。',effects:{score:5,contamination:2},reveal:true}]},
 A08:{nature:{options:['逆流する天候','廃棄すると決めた物の未来を先に終える雨','金属を老化させる微生物'],correct:1},response:{options:['すべての物資を保管指定する','囮だけを廃棄確定して雨を誘導する','雨粒を回収する'],correct:1},truth:'上向きの雨は、廃棄を決めた物が未来に迎える漂流と腐食を現在へ先払いしている。',experiments:[{id:'cancel',name:'廃棄予定を取り消す',question:'決定を変えれば未来も戻るか。',result:'対応する雨粒が止まり、中の錆びた器具だけが空洞になった。',effects:{}},{id:'mark',name:'使用中の索を廃棄候補にする',question:'実際の投棄より意思決定が先か。',result:'まだ接続中の索が切断済みの姿で上昇した。廃棄確定前なので船内の索は切れなかった。',effects:{contamination:1}},{id:'ship',name:'船名を廃棄台帳へ仮記入する',question:'船全体も対象になるか。',result:'カイロス7の錆びた外板が雨になった。未署名でも、台帳は廃棄の意思を読み始めている。',effects:{hull:-2}}],outcomes:[{id:'escape',name:'廃棄台帳を投棄する',required:0,text:'台帳の未来を雨へ渡して離脱した。最後の頁には帰港後の日付で船名が残った。',effects:{score:-1},reveal:false},{id:'solve',name:'囮を廃棄確定して射出する',required:2,text:'雨は囮の長い漂流へ集中し、上方に乾いた航路が開いた。',effects:{score:3},reveal:true},{id:'contain',name:'未来の錆を採取する',required:2,text:'まだ存在しない腐食を瓶へ封じた。触れた物の廃棄時刻だけが見える。',effects:{contamination:1},relic:'rust',reveal:true},{id:'accept',name:'船を一度廃棄して撤回する',required:3,experiments:2,text:'未来で沈んだカイロス7が雨として現れ、現在の船と重なった。船体は直ったが帰港日は失われた。',effects:{hull:4,score:4,contamination:2},reveal:true}]},
 A09:{nature:{options:['周囲の物を吸う容器','発話された説明を実体化し話者から性質を徴収する空欄','文字を複製する標本装置'],correct:1},response:{options:['正しい名称をラベルへ書く','中身を定義せず未記載として遮音する','大量の海水で満たす'],correct:1},truth:'標本瓶は説明された物を作る代わりに、その説明を成立させる性質を発話者から奪う。',experiments:[{id:'silent',name:'無言で魚の隣に置く',question:'近くの物を自動で採取するか。',result:'魚が触れても瓶は空のままだった。距離や接触だけでは徴収されない。',effects:{}},{id:'write',name:'ラベルへ「海水」とだけ書く',question:'文字だけで中身が生まれるか。',result:'変化はない。文字を読み上げた瞬間だけ瓶が曇り、読んだ隊員の舌が乾いた。',effects:{oxygen:-1}},{id:'scale',name:'「鱗」と声に出して指定する',question:'代価はどこから取られるか。',result:'瓶に鱗が現れ、発話者の指紋が消えた。性質は近くの魚ではなく説明した人から奪われた。',effects:{contamination:1}}],outcomes:[{id:'escape',name:'無言で船外へ放す',required:0,text:'瓶は空のまま沈んだ。通信が一度だけ「帰路の標本」と告げ、海図から線が消えた。',effects:{score:-1},reveal:false},{id:'solve',name:'未記載として遮音封印する',required:2,text:'瓶には空白だけが満ち、問いかける船内放送も停止した。',effects:{score:3},reveal:true},{id:'contain',name:'「瞬膜」と指定して採取する',required:2,text:'発話者の視界を一時失う代わりに、暗闇を観察できる標本が残った。',effects:{contamination:1},relic:'specimen',reveal:true},{id:'accept',name:'「失われた記憶」と答える',required:3,experiments:2,text:'瓶に冬城ユラの記憶が満ち、乗員全員から出航前の一日が消えた。',effects:{score:5,contamination:2},reveal:true}]},
 F01:{nature:{options:['事故記録の再生装置','観測された未来を現実へ固定する記録核','乗員を監視する自律船'],correct:1},response:{options:['同じ操作を繰り返す','記録されていない選択で未来を外す','記録核を放置する'],correct:1},truth:'ミナモの記録核は予言装置ではない。観測した未来を記録し、その記録へ現在を一致させる固定装置である。',experiments:[{id:'move',name:'隊員配置を記録と変える',question:'未来の図面は現在へ追従するか。',result:'未来図の人影が乱れ、損傷予定が一つ消えた。記録と異なる現在は固定しにくい。',effects:{}},{id:'repeat',name:'記録済みの命令を再実行する',question:'同じ選択が未来を近づけるか。',result:'実行前に記録どおりの損傷が発生した。未来は予測ではなく再現を要求している。',effects:{hull:-2}},{id:'blank',name:'未記録の無意味な操作を行う',question:'記録にない未来を作れるか。',result:'記録核が一秒停止し、新しい頁を生成した。空白は未来を外せるが、すぐ記録される。',effects:{contamination:1}}],outcomes:[{id:'recover',name:'記録核を回収する',required:2,text:'固定された未来ごと記録核を回収した。浮上事故の記録も船内へ同行する。',effects:{score:5},core:'recover',reveal:true},{id:'destroy',name:'記録核を破壊する',required:1,text:'未来記録は白紙になった。任務は失敗だが、浮上事故も確定先を失った。',effects:{score:-2},core:'destroy',reveal:true},{id:'connect',name:'カイロス7へ接続する',required:3,experiments:2,text:'記録核は現在を出航日に固定した。海面へ出れば、この航海は最初から始まる。',effects:{contamination:3},core:'connect',reveal:true},{id:'escape',name:'記録核を残して離脱する',required:0,text:'ミナモを振り切ったが、帰路の全損傷が記録どおりに始まった。',effects:{hull:-2},core:'destroy',reveal:false}]}
};

// Scenario-specific interaction design. A07 is the vertical slice for the
// revised investigation loop; other anomalies keep the shared fallback until
// their bespoke observations and predictions are authored.
export const SCENARIO_DESIGNS = {
 A07:{
  investigations:[
   {name:'寝台区画の波形を照合',discipline:'記録',question:'眠りの中で呼吸が途切れた時にも、第四波形は現れるか。',observation:'02:14:07、眠るミオの呼吸が寝返りで一拍途切れた。空席の波形は平坦なまま。02:19:31、起きていたアオイが物音へ耳を澄ませた三秒間だけ、空席のマイクに二度の吸気が残った。',reaction:'未使用の呼吸マスクが、内側から一度だけ曇った。',risk:'遠隔照合 / 損傷なし'},
   {name:'無人区画で録音を再生',discipline:'音響',question:'三人分の録音だけでも、第四波形は生まれるか。',observation:'無人室で三人の呼吸記録を十二回再生。再生中の波形は三本のまま。監視担当が再生音へ耳を澄ませ、息を潜めた区間だけ、配管マイクへ短い吸気が一本加わった。',reaction:'再生を止めた後も、壁の内側が担当者より半拍早く吸った。',risk:'隔離実験 / 酸素−1',effects:{oxygen:-1}},
   {name:'三人の呼吸を同期計測',discipline:'生体',question:'呼吸の周期を揃えた時、第四波形はどこへ重なるか。',observation:'三人が同じ拍で九十秒呼吸すると波形は三本。終了の合図でレンだけが一拍止まり、その空白へレンと同じ肺活量の吸気が記録された。音源座標は空席ではなく、船殻の内側。',reaction:'空席の名札に水滴が集まり、読めない一文字の跡を作った。',risk:'直接計測 / 担当の疲労＋1',effects:{fatigue:1}}
  ],
  deduction:{
   trigger:['一定時間、船内が無音になる','誰かが意識して自分の呼吸を空ける','酸素濃度が局所的に下がる'],
   nature:['呼吸音を模倣して狩る深海生物','記録から消された乗員が呼吸の空白を借りている','集音器が未来の乗員音声を受信している'],
   response:['三人分の録音を流して空白を埋める','三人が異なる拍で呼吸し同期先を失わせる','船内を減圧して呼吸音そのものを止める']
  },
  predictions:{
   hold:{options:['止めた瞬間、録音が一拍だけ巻き戻る','二秒後、壁内マイクが止めた人物の声で吸う','酸素の薄い区画へ音源が移る'],correct:1,wrongEffects:{contamination:1},wrongReaction:'予測から外れた吸気が担当者の声を覚え、船内放送でその名を呼んだ。'},
   recording:{options:['録音だけで第四周期が固定される','監視者が息を潜めた時だけ第四周期が混ざる','再生するほど三人の波形が順に消える'],correct:1,wrongEffects:{oxygen:-1},wrongReaction:'再生停止後も一人分多く酸素が減り続けた。'},
   call:{options:['集音器の装置番号を返す','失われた乗員の固有名を返す','最も疲労した隊員の名を返す'],correct:1,wrongEffects:{contamination:1},wrongReaction:'呼びかけに使った名前が名簿から薄れ、その下へ別の筆跡が浮いた。'}
  },
  outcomeUnlocks:{
   escape:{},
   solve:{correctPredictions:1},
   contain:{experiments:['call']},
   accept:{experiments:['call'],correctPredictions:2}
  }
 }
};

// Narrative art is content data: add a matching entry here whenever an event or anomaly is added.
export const SCENES = {
 splash:{src:'assets/scenes/descent.jpg',alt:'深海の光へ降下する調査艇'},
 environments:{
  1:{src:'assets/scenes/env-torii.jpg',alt:'暗い海底へ列を作って沈む鳥居群'},
  2:{src:'assets/scenes/env-white-forest.jpg',alt:'発光する感覚器官が樹木のように広がる白い森'},
  3:{src:'assets/scenes/env-hollow-sea.jpg',alt:'海中に巨大な黒い空洞が浮かぶ逆さの海'},
  4:{src:'assets/scenes/env-minamo.jpg',alt:'暗い最深部に無傷で停泊する先行調査船ミナモ'}
 },
 anomalies:{
  A01:{src:'assets/scenes/anomaly-bellmouth.jpg',alt:'鐘状の口を持つ透明な魚群がソナー波の周囲を旋回する'},
  A02:{src:'assets/scenes/anomaly-white-garden.jpg',alt:'傷や欠けた尾の形を複製する白い珊瑚の庭'},
  A03:{src:'assets/scenes/anomaly-diver.jpg',alt:'海底を天井として逆さに歩く古い潜水士'},
  A04:{src:'assets/scenes/anomaly-window.jpg',alt:'人の目のように閉じかけた巨大な船窓'},
  A05:{src:'assets/scenes/anomaly-depth-eater.jpg',alt:'計器の目盛りを消しながら海溝の奥へ続く巨大な鯨骨'},
  A06:{src:'assets/scenes/anomaly-wet-shadow.jpg',alt:'乾いた船内で影だけが濡れている三人の隊員'},
  A07:{src:'assets/scenes/anomaly-fourth-breath.jpg',alt:'三つの呼吸器の間に浮かぶ存在しない四人目の呼気'},
  A08:{src:'assets/scenes/anomaly-returning-rain.jpg',alt:'未来の錆びた船用品を閉じ込めて海面へ昇る雨粒'},
  A09:{src:'assets/scenes/anomaly-blank-jar.jpg',alt:'話者から奪った指紋と海水が現れ始める空欄の標本瓶'},
  F01:{src:'assets/scenes/env-minamo.jpg',alt:'記録核だけが光る無人の先行調査船ミナモ'}
 },
 events:[
  {src:'assets/scenes/event-distress.jpg',alt:'濡れた手形の残る隔壁と浮いた受話器'},
  {src:'assets/scenes/event-meal.jpg',alt:'三人しかいない船内に用意された四人分の食事'},
  {src:'assets/scenes/event-roster.jpg',alt:'四人目の黒い人影が浮かぶ隊員名簿'},
  {src:'assets/scenes/event-knock.jpg',alt:'巨大な指先のように内側へへこむ外殻'},
  {src:'assets/scenes/event-debris.jpg',alt:'窓の外を漂う自分たちの未来の廃棄物'},
  {src:'assets/scenes/event-card.jpg',alt:'空の病床を写す塩まみれの深海診察券'}
 ]
};
