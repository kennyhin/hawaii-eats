# Setting up shared photos

The site stores place data in Firebase Firestore and photos on ImgBB —
both free, neither requires a credit card. (Firebase's own photo storage,
Cloud Storage, now requires upgrading to a paid plan, so we use ImgBB
instead for photos.) Takes about 10 minutes total.

## 1. Create the Firebase project

1. Go to https://console.firebase.google.com and sign in with a Google account.
2. Click **Add project**, name it anything (e.g. `hawaii-eats`), and finish
   the wizard (you can skip Google Analytics).

## 2. Turn on Firestore (the database)

1. In the left sidebar, click **Build -> Firestore Database**.
2. Click **Create database**. Choose any region close to Hawaii (e.g.
   `us-west1`). Start in **production mode**.
3. Go to the **Rules** tab and replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /places/{placeId} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

   This allows anyone with the site's link to read and add/edit places —
   there's no login system, so treat the link itself as the access control
   (don't post it publicly). Click **Publish**.

## 3. Get your Firebase web config

1. Click the gear icon -> **Project settings**.
2. Scroll to **Your apps**, click the **</>** (web) icon to register a new app.
3. Give it any nickname, skip Firebase Hosting.
4. It'll show a `firebaseConfig` object. Copy the values into
   [firebase-config.js](firebase-config.js) in this repo, replacing the
   `PASTE_YOUR_...` placeholders.

## 3b. Add the rule for the Shop feature

The Shop (spending leaderboard points on icons/colors/skins) stores data in
a second collection, `profiles`. Go back to **Firestore Database -> Rules**
and update it to cover both collections:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /places/{placeId} {
      allow read: if true;
      allow write: if true;
    }
    match /profiles/{profileId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

Click **Publish**. Until this is added, the rest of the site works fine —
the Shop will just fail to save purchases (caught gracefully, no crash).

## 4. Set up ImgBB (free photo hosting, no card)

1. Go to https://imgbb.com and create a free account.
2. While logged in, go to https://api.imgbb.com/.
3. Copy the API key shown there into [imgbb-config.js](imgbb-config.js),
   replacing `PASTE_YOUR_IMGBB_API_KEY`.

## 5. Push it

```
git add firebase-config.js imgbb-config.js
git commit -m "Add Firebase and ImgBB config"
git push
```

GitHub Pages will rebuild in a minute or two. The first visitor to the live
site after this will automatically seed the database with the existing 91
places — after that, everyone reads and writes the same shared data, and
any photo someone uploads is visible to everyone else immediately.

## Note on security

There's no login — anyone who has the site's URL can add, edit, or delete
places and upload photos. That's fine for a private family link, but if you
ever want to lock it down further (e.g. a shared family PIN, or real
accounts), that would need Firebase Authentication added on top of this.
