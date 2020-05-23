# user-intents

A light-weight library for User Intents on Web Applications. Supports ES6 and TypeScript.

## What is an Intent?

A user's intention to perform an action is considered an "Intent". For example, a user clicking a the "save" button on the settings page would be the "save-settings" intent.

In the above example, we would expect the settings to be saved in less than 30 seconds, or the user experience is disturbed. If everything goes well, we will get a `completed` event. However, if the action to save settings takes more than 30 seconds, we would get a `failed` event when the timeout is reached.

Therefore, we will consider the "user intent" to be `save-settings` with a timeout of `30000 miliseconds` (or 30 seconds).

When such events occur, we can decide what we want to do with them. For exmaple, log an error, or perhaps even let the user know the action is taking a bit longer, etc.

## Get started

```
npm install --save user-intents
```

## Usage

```
import {
    addEventListener,
    startIntent, completeIntent, cancelIntent, failIntent
} from 'user-intents';

addEventListener('failed', (intent, timeout, data) => {
    console.error(`${intent} failed`, data);
});

...

const SAVE_SETTINGS_INTENT_NAME = 'save-settings';

...

function onUserClicksOnSaveButton() {
    // save settings via API call or any asynchronous action
    callAsyncAction();

    // ---- start user intent
    const timeuot = 30000;
    // arbitarary data passed to events
    const data = { profile: true };
    startIntent(SAVE_SETTINGS_INTENT_NAME, timeuot, data);
}

function onUserClicksCancelButtonWhileSavingInProgress() {
    // intent is cancelled
    // it will trigger the `cancelled` event
    cancelIntent(SAVE_SETTINGS_INTENT_NAME);
}

function onSaveSuccessful() {
    // intent was successful
    // it will trigger the `completed` event
    completeIntent(SAVE_SETTINGS_INTENT_NAME);
}

function onSaveError() {
    // user intented to save, but it failed
    // so mark it as failed, it will trigger the `failed` event
    failIntent(SAVE_SETTINGS_INTENT_NAME);
}

```