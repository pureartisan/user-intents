import { UserIntentService, EventListener, EventType } from './user-intents-service';

const singleton = new UserIntentService();

export { EventType, EventListener };

/**
 * Start a user intent with a given name.
 * The intent is expected to be completed within the given timeout.
 * If the intent is not completed on time, a `timedout` event will be triggered.
 * If another intent of the same name was started before the current intent was completed/cancelled/failed, an `incompleted` event will be triggered.
 * @param name The name of the user intent, will be matched exactly
 * @param timeout The max diration the intent should take
 * @param data Any state data that will be passed to event listeners when an event occurs
 */
export const startIntent = (name: string, timeout?: number, data?: object): void => {
  singleton.start(name, timeout, data);
};

/**
 * Mark an event as completed. This will trigger a `completed` event.
 * If there is no such event, a warning will be logged into console.
 * @param name The name of the event
 */
export const completeIntent = (name: string): void => {
  singleton.complete(name);
};

/**
 * Mark an event as cancelled. This will trigger a `cancelled` event.
 * If there is no such event, a warning will be logged into console.
 * @param name The name of the event
 */
export const cancelIntent = (name: string): void => {
  singleton.cancel(name);
};

/**
 * Mark an event as failed. This will trigger a `failed` event.
 * If there is no such event, a warning will be logged into console.
 * @param name The name of the event
 */
export const failIntent = (name: string): void => {
  singleton.fail(name);
};

/**
 * Add an event listener, that gets called when the appropriate event gets triggered.
 * @param type The type of event to listen to ('completed', 'incompleted', 'cancelled', 'failed')
 * @param listener The callback function. The `name`, `timeout` and `data` will be passed as parameters to the callback function.
 */
export const addEventListener = (type: EventType, listener: EventListener): void => {
  singleton.addEventListener(type, listener);
};

/**
 * Remove an already added event listener.
 * If the listener doesn't exists, the action will be ignroed.
 * @param type  The type of event to listen to ('completed', 'incompleted', 'cancelled', 'failed')
 * @param listener The callback function reference.
 */
export const removeEventListener = (type: EventType, listener: EventListener): void => {
  singleton.removeEventListener(type, listener);
};

/**
 * Enable warnings. Warnings are enabled by default, so this is useful when we want to re-enable
 * warnings after disabling them.
 */
export const enableWarnings = (): void => {
  singleton.enableWarnings();
};

/**
 * Disable warnings completely. Warnings are enabled by default.
 */
export const disableWarnings = (): void => {
  singleton.disableWarnings();
};

/**
 * Ignore first "non existing event" warning from being logged.
 * This is useful for when completing an event when the first page loads in an application.
 */
export const ignoreFirstWarning = (): void => {
  singleton.ignoreFirstWarning();
};
