import { UserIntentService, EventListener } from './user-intents-service';

const singleton = new UserIntentService();

export const startIntent =
    (name: string, duration: number, data?: object): void => singleton.start(name, duration, data);

export const completeIntent =
    (name: string): void => singleton.complete(name);

export const cancelIntent =
    (name: string): void => singleton.cancel(name);

export const addIncompletedEventListener =
    (listener: EventListener): void => singleton.addIncompletedEventListener(listener);

export const removeIncompletedEventListener =
    (listener: EventListener): void => singleton.removeIncompletedEventListener(listener);

export const addCancelledEventListener =
    (listener: EventListener): void => singleton.addCancelledEventListener(listener);

export const removeCancelledEventListener =
    (listener: EventListener): void => singleton.removeCancelledEventListener(listener);

export const addFailedEventListener =
    (listener: EventListener): void => singleton.addFailedEventListener(listener);

export const removeFailedEventListener =
    (listener: EventListener): void => singleton.removeFailedEventListener(listener);
