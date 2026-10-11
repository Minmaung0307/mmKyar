# မြန်မာကျား — Updated project

## ထည့်ပြင်ထားတဲ့အရာတွေ

- စက်ရုပ်နဲ့ကစားခြင်း: Easy (အများဆုံး 4-ply / 350 ms), Medium (8-ply / 1.5 s), Difficult (12-ply / 4.5 s), Advanced (18-ply / 12 s). အကွက်ရှုပ်ထွေးမှုနဲ့ device speed ပေါ်မူတည်ပြီး ပြည့်ပြည့်စုံစုံတွက်နိုင်တဲ့ depth က ကွာနိုင်ပါတယ်။ အလှည့်ပြည့်တစ်ခုကို ply တစ်ခုအဖြစ်တွက်ပါတယ်။ Easy လည်း random move မဟုတ်တော့ပါ။ Web Worker ကြောင့် စဉ်းစားနေချိန် UI မပိတ်ပါ။
- AI မှာ compulsory capture exchanges ကို leaf evaluation မလုပ်ခင် အဆုံးထိတွက်တဲ့ quiescence search၊ principal move ordering၊ killer/history ordering၊ draw-context-aware transposition bounds၊ ကင်းတက်/အကာအကွယ်/သွားကွက်/အကောင်အရေအတွက် အကဲဖြတ်မှု ထည့်ထားပါတယ်။ Pro player အစစ်နဲ့ benchmark မစမ်းရသေးတာကြောင့် Pro-level အာမခံချက် မပေးထားပါ။
- လူလူချင်း စက်တစ်လုံးတည်းကစားခြင်းကို ဆက်ထားပါတယ်။
- Online room code / invite link နဲ့ သူငယ်ချင်းကစားခြင်း။ Room ဖွင့်သူ အနီ၊ ဝင်သူ အမည်း။ အလှည့်နဲ့ legal move ကို host မှာ စစ်ပြီး နှစ်ဖက် sync လုပ်ပါတယ်။
- Mobile, tablet, iPad, desktop အတွက် responsive board, board flip, fullscreen (browser support ရှိရင်), အသံပိတ်ဖွင့်၊ အနိုင်ရ celebration.
- Local/AI မှာ undo. Online မှာ undo မပါပါ။ ပွဲပြီးတဲ့အခါ အနိုင်ရသူက အနီ/အမည်းရွေးပြီး Room အတူတူမှာ နောက်ပွဲဆက်ကစားနိုင်ပါတယ်။ သရေဆိုရင် Room ဖွင့်သူက ရွေးပါတယ်။ Local mode မှာလည်း အနိုင်ရသူအရောင်ရွေးပြီး နောက်ပွဲအတွက် ကစားသမားအမှတ်ကို ထိန်းထားပါတယ်။ အနီက အမြဲစပါတယ်။
- မူရင်း HTML မှာ ရေးထားတဲ့အတိုင်း သာမန်ကျား ရှေ့ကိုပဲရွှေ့/ရှေ့ကိုပဲစား၊ ဒမ် ထောင့်ဖြတ်အဝေးသွား/စား။ မဖြစ်မနေစားပြီး ဆက်စားနိုင်သမျှ ဆက်စား။ စားအရေအတွက်အများဆုံးကို ရွေးဖို့တော့ မကန့်သတ်ပါ။ ထိပ်စည်းရောက်ချိန် ဒမ်တက်ပြီး အလှည့်ချက်ချင်းဆုံးပါတယ်။ တစ်ဖက်ကို အလှည့်ပေးပြီးမှ ဒမ်အနေနဲ့ ရှေ့နောက်ရွှေ့စားနိုင်ပါတယ်။
- ကျားကျန်/ကျားကုန် နှစ်မျိုးလုံး။ ကျားကုန်မှာ အကောင်ကုန်ခြင်း သို့မဟုတ် သွားကွက်မရှိခြင်းက အနိုင်ဖြစ်ပါတယ်။ ကွက်တူ ၃ ကြိမ်၊ မစား/ဒမ်မတက်ဘဲ အလှည့် ၈၀ = သရေ။

## မိမိ Mac မှာ စမ်းရန်

ZIP ဖြည်ပြီး `myKyar` folder ထဲက Terminal မှာ:

```bash
python3 -m http.server 8000 --directory public
```

Browser မှာ `http://localhost:8000` ဖွင့်ပါ။ Python မရှိရင် Firebase Hosting emulator သို့မဟုတ် VS Code Live Server သုံးပါ။ HTML ကို double-click / file:// နဲ့မဖွင့်ပါနဲ့ — AI Worker နဲ့ Online ကို HTTP/HTTPS မှာ သုံးပါ။

## Firebase Hosting တင်ရန်

မူရင်း Firebase project `kyar-mm` ကို ထိန်းထားပါတယ်။ ဒီ project မှာ deploy permission ရှိတဲ့ account နဲ့ login ဝင်ပါ။

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only hosting --project kyar-mm
```

Deploy ပြီး `https://kyar-mm.web.app` မှာ စမ်းပါ။ တခြား project သုံးချင်ရင် `.firebaserc` ကို ပြင်ပါ။ ဒီ update ကို live website ပေါ်မှာ deploy မလုပ်ရသေးပါ။

## Online ကစားရန်

1. နှစ်ဦးစလုံး တူညီတဲ့ updated website ကို ဖွင့်ပါ။
2. ဖွင့်သူ: Online mode → ကစားနည်းရွေး → Room အသစ်ဖွင့်မယ် → Link ကူးမယ်။
3. Link ကို သူငယ်ချင်းဆီ ပို့ပါ။ သူငယ်ချင်းက link ဖွင့်ပြီး “ဝင်မယ်” နှိပ်ပါ။ Code ကို သီးခြားထည့်ပြီးလည်း ဝင်နိုင်ပါတယ်။
4. ချိတ်ဆက်ပြီး အနီ စရွှေ့ပါ။ ပွဲပြီးတဲ့ dialog မှာ အနိုင်ရသူက အနီ/အမည်းရွေးပါ။ နောက်ပွဲအလိုအလျောက် sync ဖြစ်ပြီး အနီက အရင်စပါမယ်။ Dialog ကိုပိတ်ထားရင် “ပွဲအသစ်” နှိပ်ပြီး ပြန်ဖွင့်ပါ။ Flip Board က ကိုယ့်ဘက်ကိုပဲ လှည့်ပြီး သူငယ်ချင်းရဲ့ view၊ အရောင်၊ အလှည့်ကို မပြောင်းပါ။ စက်နှစ်လုံးလုံး page ဖွင့်ထားရပါတယ်။ Refresh/ပိတ်လိုက်ရင် ပွဲပြတ်ပါတယ်။ ချိတ်ဆက်မှုမရရင် Room အသစ်လုပ်ပြီး ပြန်ချိတ်ပါ။

Online က PeerJS 1.5.5 (CDN) နဲ့ WebRTC သုံးပါတယ်။ Firebase database/auth setup မလိုပါ။ Public PeerServer signaling အပေါ် မှီခိုပါတယ်။ VPN/firewall/အချို့ network တွေမှာ TURN relay သို့မဟုတ် မိမိ PeerServer လိုနိုင်ပါတယ်။ `public/network-config.js` မှာ Peer options ကို ပြင်နိုင်ပါတယ်။ Production TURN credential ကို အချိန်တို သက်တမ်းရှိအောင် server က ထုတ်ပေးပါ; long-lived secret ကို public JS မှာ မထားပါနဲ့။ Remote gameplay က friendly play အတွက်ပါ; ranked/anti-cheat server၊ login၊ match history၊ ပြတ်နေတဲ့ပွဲပြန်ဆက်ခြင်း မပါပါ။

## ဖိုင်များ

- public/index.html — UI
- public/styles.css — responsive design
- public/engine.js — shared game rules + AI search
- public/ai-worker.js — background AI
- public/app.js — UI / remote protocol
- public/network-config.js — optional signaling/ICE configuration
- original-backup/ — မပြင်ခင် မူရင်း UI/source backup

## စစ်ဆေးထားမှု

```bash
node tests/engine.test.cjs
node tests/network.test.cjs
node tests/ai-tactics.test.cjs
```

Engine tests passed: initial layout, forced forward-only capture, chain capture, crowning ends turn, screenshot regressions, flying kings, blockade, draws, 4 AI levels, random full games.
Remote protocol tests passed with an in-memory mock transport: room join, both turns, synchronized state, illegal/out-of-turn rejection, winner-only color choice, switched-side rematch, local color choice, independent board flip. Real PeerJS/WebRTC external connection မစမ်းနိုင်ခဲ့ပါ။

AI tactical regression test: အကောင် ၂ ကောင်ထက်မနည်းကို စားခွင့်ပေးမယ့်အကွက်ကို အဆင့် ၄ မျိုးလုံးက ရှောင်နိုင်တာ စစ်ထားပါတယ်။ Reference runtime ရဲ့ starting position မှာ completed depths: Easy 4, Medium 8, Difficult 12, Advanced 13 (12 seconds budget). Device/position အလိုက် depth ကွာပါတယ်။ ဒါက professional human rating မဟုတ်ပါ။

Online အသစ်မှာ protocol version guard ပါပါတယ်။ နှစ်ဦးစလုံး website အသစ်ကို refresh လုပ်ပြီးမှ Room ပြန်ချိတ်ပါ။ အဟောင်းနဲ့အသစ် version ရောပြီးမကစားနိုင်ပါ။

`tests/ui.cjs` မှာ Playwright viewport/local/AI smoke test ထည့်ထားပါတယ်။ ဒီ environment မှာ browser binary download မအောင်မြင်တာကြောင့် browser rendering tests မပြေးနိုင်ခဲ့ပါ။ မိမိစက်မှာ:

```bash
npm install --no-save playwright
npx playwright install chromium
python3 -m http.server 8765 --directory public
# အခြား Terminal မှာ
node tests/ui.cjs
```

Mobile/iPad အစစ်၊ Safari fullscreen fallback၊ မတူညီတဲ့ Wi-Fi/mobile-data network နှစ်ခုနဲ့ Online ကစားမှုကို deploy ပြီးစမ်းပါ။

## Footer links ပြင်ရန်

`public/config.js` ထဲက `links` မှာ မိမိ URL တွေထည့်ပါ:

```js
window.KYAR_SITE_CONFIG = {
  links: {
    coffee: 'https://your-coffee-link.example',
    burger: 'https://your-burger-link.example',
    bigMeal: 'https://your-big-meal-link.example',
    privacy: 'https://your-site.example/privacy',
    terms: 'https://your-site.example/terms'
  }
};
```

အပေါ်က example URL တွေအစား မိမိ link အစစ်ကိုထည့်ပါ။ Link အလွတ်ထားရင် ခလုတ်မြင်ရပေမယ့် နှိပ်လို့မရပါ။ Privacy / Terms အတွက် မိမိရဲ့ policy page link ကို ထည့်ပါ; policy စာမျက်နှာအသစ်ကို ဒီ update မှာ မရေးထားပါ။ ပြင်ပြီးရင် deploy ပြန်လုပ်ပါ။

Footer မှာ Coffee ☕ / Burger 🍔 / Big Meal 🍽️၊ Privacy / Terms၊ Made by MM ♥၊ © current year myKyar ပါပါတယ်။ Year က device ရဲ့ date အလိုက် အလိုအလျောက်ပြောင်းပါတယ်။ External link တွေက tab အသစ်မှာ ဖွင့်ပါတယ်။
