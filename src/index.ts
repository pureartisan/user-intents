import { UserIntentService, EventListener, EventType } from './user-intents-service';

const singleton = new UserIntentService();

export {
    EventType,
    EventListener
};

/**
 * Start a user intent with a given name.
 * The intent is expected to be completed within the given time duration.
 * If the intent is not completed on time, a `failed` event will be triggered.
 * If another intent of the same name was started before the current intent was completed/cancelled/failed, an `incompleted` event will be triggered.
 * @param name The name of the user intent, will be matched exactly
 * @param duration The max duration the intent should take
 * @param data Any state data that will be passed to event listeners when an event occurs
 */
export const startIntent = (name: string, duration?: number, data?: object): void => {
    singleton.start(name, duration, data);
}

/**
 * Mark an event as completed. This will trigger a `completed` event.
 * If there is no such event, a warning will be logged into console.
 * @param name The name of the event
 */
export const completeIntent = (name: string): void => {
    singleton.complete(name);
}

/**
 * Mark an event as cancelled. This will trigger a `cancelled` event.
 * If there is no such event, a warning will be logged into console.
 * @param name The name of the event
 */
export const cancelIntent = (name: string): void => {
    singleton.cancel(name);
}

/**
 * Add an event listener, that gets called when the appropriate event gets triggered.
 * @param type The type of event to listen to ('completed', 'incompleted', 'cancelled', 'failed')
 * @param listener The callback function. The `name`, `duration` and `data` will be passed as parameters to the callback function.
 */
export const addEventListener = (type: EventType, listener: EventListener): void => {
    singleton.addEventListener(type, listener);
}

/**
 * Remove an already added event listener.
 * If the listener doesn't exists, the action will be ignroed.
 * @param type  The type of event to listen to ('completed', 'incompleted', 'cancelled', 'failed')
 * @param listener The callback function reference.
 */
export const removeEventListener = (type: EventType, listener: EventListener): void => {
    singleton.removeEventListener(type, listener);
}
