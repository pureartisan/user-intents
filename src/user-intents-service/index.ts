import { EventHandler } from '../event-handler';

interface IntentMetaData {
    timeout: number,
    duration: number,
    data?: object
}

export type EventType = 'completed' | 'incompleted' | 'cancelled' | 'failed';

export type EventListener = (name: string, duration: number, data?: object) => void;

export class UserIntentService {

    private defaultDuration: number = 0;

    private intents : Map<string, IntentMetaData> = new Map<string, IntentMetaData>();

    private eventHandlers: Map<EventType, EventHandler<EventListener>> = new Map<EventType, EventHandler<EventListener>>();

    public setDefaultDuration(duration: number): void {
        this.validateDuration(duration);
        this.defaultDuration = duration;
    }

    public start(name: string, duration?: number, data?: object): void {
        this.validateName(name);

        duration = duration || this.defaultDuration;
        this.validateDuration(duration);

        const existing = this.intents.get(name);
        if (existing) {
            this.removeIntent(name, existing);
            this.triggerEvent('incompleted', name, existing);
        }

        this.addNewIntent(name, duration, data);
    }

    public complete(name: string): void {
        const existing = this.intents.get(name) as IntentMetaData;
        if (!existing) {
            this.warnNonExistingEvent(name, 'complete');
            return;
        }

        this.removeIntent(name, existing);
        this.triggerEvent('completed', name, existing);
    }

    public cancel(name: string): void {
        const existing = this.intents.get(name) as IntentMetaData;
        if (!existing) {
            this.warnNonExistingEvent(name, 'cancel');
            return;
        }

        this.removeIntent(name, existing);
        this.triggerEvent('cancelled', name, existing);
    }

    public addEventListener(type: EventType, listener: EventListener): void {
        this.getEventHandler(type).add(listener);
    }

    public removeEventListener(type: EventType, listener: EventListener): void {
        this.getEventHandler(type).remove(listener);
    }

    private getEventHandler(type: EventType): EventHandler<EventListener> {
        return this.eventHandlers.get(type) as EventHandler<EventListener>;
    }

    private validateName(name: string): void {
        if (!name || !name.trim()) {
            throw Error(`Invalid intent name provided: ${name}`);
        }
    }

    private validateDuration(duration: number): void {
        if (!duration) {
            throw Error(`Invalid intent duration provided: ${duration}`);
        }
    }

    private addNewIntent(name: string, duration: number, data?: object): void {
        let metaData: IntentMetaData;

        const timeout = window.setTimeout(() => {
            this.triggerEvent('failed', name, metaData);
        }, duration);

        metaData = {
            timeout,
            duration,
            data
        };

        this.intents.set(name, metaData);
    }

    private removeIntent(name: string, metaData: IntentMetaData): void {
        this.intents.delete(name);
        window.clearTimeout(metaData.timeout);
    }

    private triggerEvent(type: EventType, name: string, metaData: IntentMetaData): void {
        this.getEventHandler(type).trigger(name, metaData.duration, metaData.duration);
    }

    private warn(msg: string): void {
        // tslint:disable-next-line no-console
        console.warn(msg);
    }

    private warnNonExistingEvent(name: string, action: string): void {
        this.warn(`Trying to ${action} a non-existing intent: ${name}. Did you forget to start it or has already completed/failed?`);
    }

}