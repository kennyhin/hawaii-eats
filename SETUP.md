# Setting up shared photos (Firebase)

The site now stores all places and photos in Firebase so everyone in the
family sees the same data and photos from any device. You need to create
one free Firebase project and paste its config in. Takes about 5 minutes.

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

## 3. Turn on Storage (the photos)

1. In the left sidebar, click **Build -> Storage**.
2. Click **Get started**, accept the defaults.
3. Go to the **Rules** tab and replace the contents with:

   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /photos/{allPaths=**} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

   Click **Publish**.

## 4. Get your web config

1. Click the gear icon -> **Project settings**.
2. Scroll to **Your apps**, click the **</>** (web) icon to register a new app.
3. Give it any nickname, skip Firebase Hosting.
4. It'll show a `firebaseConfig` object. Copy the values into
   [firebase-config.js](firebase-config.js) in this repo, replacing the
   `PASTE_YOUR_...` placeholders.

## 5. Push it

```
git add firebase-config.js
git commit -m "Add Firebase config"
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
