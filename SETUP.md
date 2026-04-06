# Richup Clone — Setup & Deploy (Step-by-step)

Bu hujjat loyihani **ishga tushirish**, **Firebase ulash**, va **deploy** qilish uchun kerak bo‘lgan hamma qadamlarni ketma-ket tushuntiradi.

## 0) Talablar

- Node.js (LTS tavsiya)
- NPM
- Firebase account (Google account)

## 1) Lokal ishga tushirish

Terminalda:

```bash
cd richup-clone
npm i
npm run dev
cd /Users/macbookpro/Desktop/richup_io-clone/richup-clone && WATCHPACK_POLLING=true HOSTNAME=localhost npm run dev -- --hostname localhost --port 3002
npm warn Unknown env config "devdir". This will stop working in the next major version of npm.
```

Brauzerda oching: `http://localhost:3000`

## 2) Firebase project yaratish (Console’da)

1. Firebase Console’ga kiring: `https://console.firebase.google.com/`
2. **Create a project** qiling (masalan: `richup-clone-xxx`).
3. Project ichida quyidagilarni yoqing:
   - **Authentication → Get started**
     - **Email/Password** ni **Enable** qiling
   - **Firestore Database → Create database**
     - Region tanlang (sizga yaqin region tavsiya; masalan `us-central1`).

## 3) Firebase Web App yaratish (config olish)

1. Firebase project ichida **Project settings → Your apps** bo‘limiga kiring.
2. **Web app** qo‘shing.
3. Sizga berilgan Firebase Web config’dan quyidagilarni oling:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`
   - `measurementId` (ixtiyoriy, Analytics uchun)

## 4) `.env.local` tayyorlash

1. `richup-clone/` ichida `.env.example` ni `.env.local` qilib ko‘chiring.
2. `.env.local` ichini to‘ldiring:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Eslatma: bu qiymatlar `src/lib/firebase.ts` tomonidan o‘qiladi.

## 5) Lokal test (multiplayer + gameplay)

1. `http://localhost:3000/signup` ga kiring va account yarating.
2. `Lobby` sahifada **Create private game** bosing.
3. Room ichida **Copy invite link** qiling.
4. Invite link’ni boshqa browser/incognito’da oching va ikkinchi user bilan kiring.
5. Host **Start game** bosadi.
6. Navbat bo‘yicha **Roll dice** bosib, pozitsiya real‑time o‘zgarishini ko‘ring.

## 6) Deploy uchun tayyorgarlik (men davom ettirishim uchun)

Deploy’ni men Firebase CLI orqali yakunlab beraman, lekin buning uchun sizdan 2 narsa kerak bo‘ladi:

### 6.1) Firebase login (authorization code)

1. Men bergan Firebase login link’ni ochib login qiling.
2. U yerdagi **authorization code** ni nusxa qiling.
3. Shu chatga yuboring.

### 6.2) Firebase project ID

1. Firebase Console’da project ro‘yxatidan project’ingizni oching.
2. **Project settings** ichida **Project ID** ni toping.
3. Shu chatga yuboring.

## 7) Deploy (men qiladigan ishlar)

Siz code + project ID yuborganingizdan keyin men:

- Firebase environment’ni to‘g‘ri papkaga yo‘naltiraman (`richup-clone/`)
- Firebase’ni init qilaman (Firestore/Hosting/App Hosting kerakli sozlamalar)
- Next.js SSR bo‘lgani uchun mos `firebase.json` yarataman
- `deploy`ni ishga tushiraman va URL’ni beraman

