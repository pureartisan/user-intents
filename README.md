# User Intents

A light-weight javascript library for User Intents on Web Applications. Supports ES6 and TypeScript.

## What is an Intent?

A user's intention to perform an action is considered an "Intent". For example, a user clicking a the "save" button on the settings page would be the "save-settings" intent.

In the above example, we would expect the settings to be saved in less than 30 seconds, or the user experience is interrupted. If everything goes well, we will get a `completed` event (which can be listened to). However, if the action to save settings takes more than 30 seconds, we would get a `timedout` event when the timeout is reached.

Therefore, we will consider the "user intent" to be `save-settings` with a timeout of `30000 miliseconds` (or 30 seconds).

When such events occur, we can decide what we want to do with them. For exmaple, log an error, or perhaps even let the user know the action is taking a bit longer than usual, etc.

## Getting started

```
npm install --save user-intents
```

## Usage

```
import {
    addEventListener,
    startIntent, completeIntent, cancelIntent, failIntent
} from 'user-intents';

// or using `require`
// const userIntents = require('user-intents');

addEventListener('failed', (intent, timeout, data) => {
    console.error(`${intent} failed`, data);
});

...

const SAVE_SETTINGS_INTENT_NAME = 'save-settings';

...

function onUserClicksSaveButton() {
    // save settings via API call or any asynchronous action
    callAsyncActionToSave();

    // ---- start user intent
    const timeuot = 30000;
    // arbitarary data passed to events, can be anything you want
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

## Intents

### `startIntent(name, timeout, data?)`

Starts an intent with a given name. Stating an intent with the same name, while the previous intent is still pending will trigger an `incompleted` event for the previously pending intent.

| Parameter | Type | Description |
|-----------|--------|----------------------------------------------------------------------------------------------------------------------|
| `name` | string | Name of the intent, and this is case sensitive. |
| `timeout` | number | The timeout (max duration) this intent should be completed within. Otherwise the `timedout` event will be triggered. |
| `data` | any | [Optional] Arbitaray data that will be passed to events, when an event is triggered for this intent |

### `completeIntent(name)`

Completes a pending intent. If no intent by that name is pending, a warning will be logged in console. Use `disableWarnings()` to suppress the warnings. Completing an intent will trigger the `completed` event for that intent.

| Parameter | Type | Description |
|-----------|--------|----------------------------------------------------------------------------------------------------------------------|
| `name` | string | Name of the intent, and this is case sensitive. |

### `cancelIntent(name)`

Cancels a pending intent. If no intent by that name is pending, a warning will be logged in console. Use `disableWarnings()` to suppress the warnings. Cancelling an intent will trigger the `cancelled` event for that intent.

| Parameter | Type | Description |
|-----------|--------|----------------------------------------------------------------------------------------------------------------------|
| `name` | string | Name of the intent, and this is case sensitive. |

### `failIntent(name)`

Fails a pending intent. If no intent by that name is pending, a warning will be logged in console. Use `disableWarnings()` to suppress the warnings. Failing an intent will trigger the `failed` event for that intent.

| Parameter | Type | Description |
|-----------|--------|----------------------------------------------------------------------------------------------------------------------|
| `name` | string | Name of the intent, and this is case sensitive. |


## Events

You can listen to any of the following events using `addEventListener` or remove an existing event listener using `removeEventListener`.

| Event         | Description |
|---------------|-------------|
| `completed`   | Triggered when the `completeIntent` method is called on a pending intent |
| `failed`      | Triggered when the `failIntent` method is called on a pending intent |
| `timedout`    | Triggered when a pending intent reaches the timeout |
| `cancelled`   | Triggered when the `cancelIntent` method is called on a pending intent |
| `incompleted` | Triggered when the `startIntent` method is called for the same intent name while the previous intent is still pending |

### `addEventListener(event, listener)`

Adds an event listener for a given event.

| Parameter | Type | Description |
|------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `event` | string | Event name and has to be one of the following: [`completed`, `incompleted`, `cancelled`, `failed`, `timedout`] |
| `listener` | function | The callback function. The following will be passed as arguments: [ `name`, `timeout`, `data` ], same as what was passed in when `startIntent()` was called. |


### `removeEventListener(event, listener)`

| Parameter | Type | Description |
|------------|----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `event` | string | Event name and has to be one of the following: [`completed`, `incompleted`, `cancelled`, `failed`, `timedout`] |
| `listener` | function | The callback function. Should the the same reference to the previously added callback function, otherwise this action is ignored. |

## Miscellaneous

### `disableWarnings()`

Warnings are enabled by default. Calling this method will disable logging warnings to console by this library. See `Intents` section above for more descriptions of what kind of warnings are logged to console. To re-enable warnings, simply call `enableWarnings()`

### `enableWarnings()`

Warnings are enabled by default. This method can be used to re-enable warnings if it was disabled at some point during runtime. See above for more details.

### `ignoreFirstWarning()`

This method will ignore the first warning from being logged, and is useful in certain sitautions. In those cases, this method must be called at the start of the application, as early as possible. This method is unnecessary if warnings are disable completely using `disableWarnings()`.

Let's look at an example:
We are tracking intents of the user going between pages/screens in the application. This is usually handled by `startIntent()` when the user clicks on a navigation link on the application to take the user to a certain page. When the page transitions/changes and the user is on the new page, we will call the `completeIntent()` method. However, if we come to this page the very first time and there was no `startIntent()` called at page load, there will be a warning. Calling `ignoreFirstWarning()` allows you to ignore logging this very first warning.
