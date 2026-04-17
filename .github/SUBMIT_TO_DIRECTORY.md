# How to submit to react-native-directory

This takes ~2 minutes. GitHub will fork the repo and create the PR automatically.

## Step 1 — Open the file editor

Click this link (must be logged in to GitHub):
https://github.com/react-native-community/react-native-directory/edit/main/react-native-libraries.json

## Step 2 — Add the entry at the END of the file

Find the very last entry in the file (currently `react-native-bootsplash`):

```json
  {
    "githubUrl": "https://github.com/zoontek/react-native-bootsplash",
    ...
  }
]
```

Add a comma after its closing `}` and paste the new entry BEFORE the `]`:

```json
  {
    "githubUrl": "https://github.com/zoontek/react-native-bootsplash",
    ...
  },
  {
    "githubUrl": "https://github.com/rodrigosouza239/expo-in-app-messaging",
    "npmPkg": "@rodrigo-souza/expo-in-app-messaging",
    "ios": true,
    "android": true,
    "expoGo": false,
    "newArchitecture": true,
    "configPlugin": true
  }
]
```

## Step 3 — Commit and open PR

At the bottom of the page:
- Commit message: `Add @rodrigo-souza/expo-in-app-messaging`
- Select: **"Create a new branch for this commit and start a pull request"**
- Click **"Propose changes"**

## Step 4 — PR description

Use this as the PR body:

```
Adds `@rodrigo-souza/expo-in-app-messaging` — an Expo native module that intercepts
Firebase In-App Messaging before rendering, allowing full custom UI on iOS and Android.

Unlike `@react-native-firebase/in-app-messaging`, this module gives developers
complete control over the presentation layer.

- npm: https://www.npmjs.com/package/@rodrigo-souza/expo-in-app-messaging
- Supports New Architecture (Fabric)
- iOS + Android
- Expo config plugin included
```
