// Shared, declarative field interaction engine. Scenario rules contain no UI code.
export const matches=(values,condition={})=>Object.entries(condition).every(([key,value])=>(Array.isArray(value)?value.includes(values[key]):values[key]===value));
export const createField=design=>({version:2,values:{...design.initial},records:[],last:null,ended:false,stage:'survey',plan:{goal:'',evidence:[]}});
export function performField(field,design,id){
 const action=design.actions.find(a=>a.id===id);
 if(field.ended||!action||!matches(field.values,action.requires))return null;
 const next=structuredClone(field);
 if(action.set&&Object.entries(action.set).every(([k,v])=>next.values[k]===v))return null;
 Object.assign(next.values,action.set);
 const rule=action.rules?.find(r=>matches(next.values,r.when))||{};
 Object.assign(next.values,rule.set);
 if(action.intervention)next.stage='aftercare';
 const entry={id:next.records.length+1,action:id,label:action.label,text:rule.text||action.text,conditions:Object.fromEntries(design.conditions.map(c=>[c.label,c.options[next.values[c.key]]??String(next.values[c.key])])),measurement:!!action.measure,intervention:!!action.intervention,stage:next.stage};
 next.records.push(entry);next.last=entry;next.ended=!!action.final;
 return {field:next,cost:action.cost||{},ending:action.final?{id:rule.ending||id,name:rule.name||action.label,text:entry.text,reveal:false}:null};
}
const measureRules=[
 {when:{location:'lock',chamber:'vacuum'},text:'隔離区画は真空。空気を伝わる吸気は記録されない。船室の回線は、別に確認する必要がある。'},
 {when:{location:'lock',trace:'lock',person:'bunk'},text:'無人になった区画から、十秒ごとに吸気が一つ。未使用マスクが同じ間隔で曇る。'},
 {when:{location:'lock',trace:'lock'},text:'アオイの呼吸の下で、別の吸気が十秒ごとに立ち上がる。未使用マスクが同じ間隔で曇る。'},
 {when:{location:'bunk',trace:'bunk'},text:'寝台の下から十秒ごとに吸気が一つ。乗員の現在位置とは一致しない。'},
 {when:{location:'lock',playback:true},text:'録音の三つの波形が反復する。再生を止めた一秒間、区画の集音器は平坦だった。'},
 {when:{location:'lock',person:'bunk'},text:'区画内：吸気ゼロ。船室の別回線では、三人の呼吸が続いている。'},
 {text:'乗員の吸気と集音器の立ち上がりが重なる。余分な波形は、この十秒間にはない。'}
];
export const FIELD_SCENARIOS={A07:{
 operationConditions:['door','pulse'],
 goals:['反応を別の場所へ移す','船室から分離する','応答を確かめる','標本を確保する'],
 domains:{trace:['none','bunk','lock','container','gone'],casualty:[true,false],chamber:['usable','vacuum'],container:['unused','empty','occupied','released'],contact:['none','heard','named'],pulse:['short','long'],vented:[true,false]},
 initial:{location:'bunk',person:'bunk',breath:'normal',playback:false,door:'open',trace:'none',casualty:false,chamber:'usable',container:'unused',contact:'none',pulse:'short',vented:false},
 conditions:[
 {key:'location',label:'集音位置',options:{bunk:'寝台',lock:'隔離区画'}},
 {key:'person',label:'協力者',options:{bunk:'寝台',lock:'隔離区画'}},
 {key:'breath',label:'呼吸',options:{normal:'自然呼吸',hold:'十秒休止'}},
 {key:'playback',label:'区画内の録音',options:{true:'再生',false:'停止'}},
 {key:'door',label:'隔壁',options:{open:'開放',closed:'閉鎖'}}],
 targets:[
 {id:'sensor',name:'集音器',text:'二つの回線を切り替えられる。測定した十秒間の波形と、その時の条件を保存する。'},
 {id:'crew',name:'協力者',text:'アオイが合図を待っている。配置と呼吸を指定できる。呼吸条件を選び、合図を送って十秒間だけ実行する。計器を読むだけでは条件は実行されない。'},
 {id:'recorder',name:'録音機',text:'出航前に録った三人の呼吸。隔離区画のスピーカーへ送ることができる。'},
 {id:'container',name:'回収容器',requires:{container:['empty','occupied','released']},text:'密封容器を机に固定した。中を観測するか、海へ手放すかを選べる。'},
 {id:'lock',name:'隔離区画',text:'未使用の呼吸マスクと船外排気弁がある。隔壁を閉じたまま、外から中を確認できる。'}],
 actions:[
 {id:'listen-bunk',target:'sensor',label:'集音位置：寝台',set:{location:'bunk'},text:'寝台の回線へ切り替えた。'},
 {id:'listen-lock',target:'sensor',label:'集音位置：隔離区画',set:{location:'lock'},text:'隔離区画の回線へ切り替えた。'},
 {id:'measure',target:'sensor',label:'十秒間を測定・保存',measure:true,rules:measureRules},
 {id:'move-lock',target:'crew',label:'隔離区画へ移動',requires:{door:'open',chamber:'usable',casualty:false},set:{person:'lock'},text:'アオイが区画へ入った。扉の内側で合図を返す。'},
 {id:'move-bunk',target:'crew',label:'寝台へ戻る',requires:{door:'open',chamber:'usable',casualty:false},set:{person:'bunk'},text:'アオイが寝台へ戻った。区画に人影はない。'},
 {id:'normal',target:'crew',label:'自然呼吸で測る',set:{breath:'normal'},text:'次の合図では自然呼吸を続ける。'},
 {id:'hold',target:'crew',label:'十秒だけ息を止める',set:{breath:'hold'},text:'アオイがうなずく。「十秒。終わったら、必ず合図を」'},
 {id:'signal',requirementText:'協力者が活動可能な状態で実行できます。',target:'crew',label:'呼吸の合図を送る',intervention:true,requires:{casualty:false},rules:[
 {when:{trace:'container'},text:'合図の十秒間、容器の外には新しい吸気はなかった。'},
 {when:{trace:'gone'},text:'合図を送った。船内から返るのは、乗員の呼吸だけだった。'},
 {when:{person:'lock',breath:'hold',chamber:'usable',door:'open'},set:{trace:'lock'},text:'アオイが十秒、息を止めた。未使用マスクの内側が曇る。合図を戻すと、アオイは大きく息を吸った。'},
 {when:{person:'bunk',breath:'hold',door:'open'},set:{trace:'bunk'},text:'アオイが息を止めると、枕元で別の吸気がした。十秒後、アオイは呼吸を戻した。'},
 {text:'合図の十秒間が終わった。離れた位置の様子は、集音器で確認できる。'}]},
 {id:'play',target:'recorder',label:'区画内で録音を再生',set:{playback:true},text:'無人のスピーカーから三人の呼吸が流れ始めた。'},
 {id:'stop',target:'recorder',label:'録音を止める',set:{playback:false},text:'スピーカーの再生ランプが消えた。'},
 {id:'inspect',target:'lock',label:'窓越しにマスクを見る',rules:[{when:{trace:'lock'},text:'未使用マスクが内側から曇った。留め具に「冬城」の二文字。乗員名簿には該当する姓がない。'},{text:'三つの使用済みマスク。その横に、封の切られていない四つ目がある。'}]},
 {id:'close',target:'lock',label:'隔壁を閉じる',intervention:true,set:{door:'closed'},text:'隔壁が閉じた。窓の向こうを、配管の影が横切った。'},
 {id:'open',requirementText:'排気した区画は開放できません。',target:'lock',label:'隔壁を開ける',requires:{chamber:'usable'},set:{door:'open'},text:'隔壁を開いた。冷えた空気が足元を流れる。'},
 {id:'vent',requirementText:'隔壁を閉じてください。排気済みの区画は再使用できません。',target:'lock',label:'区画を船外へ排気',intervention:true,cost:{oxygen:2},requires:{door:'closed',chamber:'usable'},warning:'隔壁を閉じた区画の空気を排出します。区画は以後使えません。中に乗員がいれば命を失います。',set:{chamber:'vacuum',vented:true},rules:[
 {when:{person:'lock',trace:'lock'},set:{casualty:true,trace:'gone'},text:'排気が止まった。窓に当たっていたアオイの手が動かない。区画の圧力計はゼロを示している。'},
 {when:{person:'lock'},set:{casualty:true},text:'排気が止まった。窓に当たっていたアオイの手が動かない。区画の圧力計はゼロを示している。'},
 {when:{trace:'lock'},set:{trace:'gone'},text:'窓の外へ、白い息が一度だけ流れた。区画の圧力計はゼロ。船室の集音器はまだ確認していない。'},
 {text:'排気弁が閉じた。区画の圧力計はゼロ。扉のこちら側で、かすかに布が擦れる音がした。'}]},
 {id:'recover',requirementText:'協力者を寝台へ戻し、隔壁を閉じてください。未使用の容器と、排気前の区画が必要です。',target:'lock',label:'マスクを容器へ密封',intervention:true,cost:{oxygen:1},requires:{door:'closed',person:'bunk',container:'unused',chamber:'usable'},warning:'無人区画からマスクを回収します。容器は一つだけです。回収後も観測を続けられます。',rules:[
 {when:{trace:'lock'},set:{trace:'container',container:'occupied'},text:'マニピュレーターがマスクを容器へ収めた。密封が完了した直後、容器の内側が曇った。机の上に、回収容器が置かれた。'},
 {set:{container:'empty'},text:'マスクを容器へ収めた。内側は曇らない。容器は使用済みになった。船室の状態は、測り直す必要がある。'}]},
 {id:'short',target:'lock',label:'一拍だけ回線を開く',set:{pulse:'short'},text:'一拍の送信を準備した。'},
 {id:'long',target:'lock',label:'十秒間回線を開く',set:{pulse:'long'},text:'十秒の送信を準備した。'},
 {id:'call',requirementText:'排気した区画では音声通信できません。',target:'lock',label:'区画へ呼びかける',intervention:true,requires:{chamber:'usable'},rules:[
 {when:{trace:'lock',door:'closed',person:'bunk',pulse:'long',contact:'heard'},set:{contact:'named'},text:'十秒間、回線を開いた。三拍、五拍、八拍。「ふゆ……しろ、ゆら」。続いて「出航の……点呼を」。三人の名簿には、その名前がない。'},
 {when:{trace:'lock',door:'closed',person:'bunk',pulse:'long',contact:'named'},text:'「出航の、点呼を」。同じ言葉が、こちらの送信を終えた後にだけ返ってくる。'},
 {when:{trace:'lock',door:'closed',person:'bunk',contact:'named'},text:'「ふ……」で回線が閉じた。記録済みの名前は残っているが、今回の送信では続きを聞き取れなかった。'},
 {when:{trace:'lock',door:'closed',person:'bunk'},set:{contact:'heard'},text:'「ふ……」で回線が閉じた。切れた後も、区画のメーターが三拍、五拍、八拍と振れた。'},
 {text:'自分の声が配管に響いた。返事に聞こえるものはなかった。'}]},
 {id:'watch-container',target:'container',label:'容器内を観測・保存',measure:true,requires:{container:['empty','occupied','released']},rules:[{when:{container:'occupied'},text:'容器の内側が十秒ごとに曇る。中に人影はない。机の下の集音器には、容器に触れた時だけ小さな振動が残った。'},{when:{container:'released'},text:'固定台だけが机に残っている。海へ放した容器は、もう見えない。'},{text:'マスクは乾いたまま。容器の内側に、呼気の曇りは見えない。'}]},
 {id:'release',requirementText:'異常を密封した容器がある時だけ実行できます。',target:'container',label:'容器を船外へ放す',intervention:true,requires:{container:'occupied'},warning:'回収した標本を失います。放した容器は取り戻せません。',set:{container:'released',trace:'gone'},text:'容器が暗い海へ沈んでいく。最後の曇りが、窓の外で一度だけ白く光った。'},
 {id:'leave',target:'sensor',label:'この現場を離れて浮上',final:true,rules:[
 {when:{casualty:true},ending:'sacrifice',name:'返事のない隔壁',text:'帰還記録のアオイの欄は空白になった。排気した区画は、海面に出ても開けられなかった。'},
 {when:{container:'occupied',contact:'named'},ending:'named-specimen',name:'名前のある標本',text:'容器の内側で呼吸が続く。記録には冬城ユラという名前と、点呼を求める声を残した。彼女がなぜ名簿から消えたのかは、まだ分からない。'},
 {when:{container:'occupied'},ending:'specimen',name:'呼吸する標本',text:'密封容器を持ち帰った。内側が十秒ごとに曇る。何を閉じ込めたのか、名前も理由も分からないままだ。'},
 {when:{trace:'gone',contact:'named'},ending:'farewell',name:'点呼に残した名前',text:'船内から余分な呼吸は消えた。帰還報告に冬城ユラという名前を記した。返事をする声は、もう船内にない。'},
 {when:{trace:'gone'},ending:'severed',name:'三人分の帰路',text:'船内の余分な呼吸が消えた状態で海面へ出た。何が応答していたのかを確かめる手段は、海の底に残った。'},
 {when:{trace:'lock',door:'closed'},ending:'contained',name:'閉じたままの第四室',text:'隔離区画を閉じたまま帰還した。扉の内側では吸気が続いている。この扉を開けるかどうかは、まだ決めていない。'},
 {when:{trace:'bunk'},ending:'leak',name:'船内の吸気',text:'海面の光が差す寝台で、三人のものではない吸気が続いている。ここに残したものとともに帰還した。'},
 {ending:'unresolved',name:'数えなかった呼吸',text:'調査を打ち切った。点呼は三人。最初の録音にあった四つ目の呼吸を説明できないまま、記録を持ち帰った。'}]}
 ]}};
FIELD_SCENARIOS.A07.conditions.push({key:'pulse',label:'呼びかけ時間',options:{short:'一拍',long:'十秒'}});
