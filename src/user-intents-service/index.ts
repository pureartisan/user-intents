import { EventHandler } from '../event-handler';

interface IntentMetaData {
    timeout: number,
    duration: number,
    data?: any
}

// NOTE: remember to initialise all of them in the service
export type EventType = 'completed' | 'incompleted' | 'cancelled' | 'failed' | 'timedout';

export type EventListener = (name: string, duration: number, data?: any) => void;

export class UserIntentService {

    private defaultDuration: number = 0;

    private intents : Map<string, IntentMetaData> = new Map<string, IntentMetaData>();

    private eventHandlers: Map<EventType, EventHandler<EventListener>> = new Map<EventType, EventHandler<EventListener>>();

    private warnings = true;
    private firstEventFinished = false;
    private shouldIgnoreFirstWarning = false;

    constructor() {
        this.initEventHandlers();
    }

    public setDefaultDuration(duration: number): void {
        this.validateDuration(duration);
        this.defaultDuration = duration;
    }

    public start(name: string, duration?: number, data?: any): void {
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
            this.markEventStatuses();
            return;
        }

        this.markEventStatuses();
        this.removeIntent(name, existing);
        this.triggerEvent('completed', name, existing);
    }

    public cancel(name: string): void {
        const existing = this.intents.get(name) as IntentMetaData;
        if (!existing) {
            this.warnNonExistingEvent(name, 'cancel');
            this.markEventStatuses();
            return;
        }

        this.markEventStatuses();
        this.removeIntent(name, existing);
        this.triggerEvent('cancelled', name, existing);
    }

    public fail(name: string): void {
        const existing = this.intents.get(name) as IntentMetaData;
        if (!existing) {
            this.warnNonExistingEvent(name, 'fail');
            this.markEventStatuses();
            return;
        }

        this.markEventStatuses();
        this.removeIntent(name, existing);
        this.triggerEvent('failed', name, existing);
    }

    public addEventListener(type: EventType, listener: EventListener): void {
        this.getEventHandler(type).add(listener);
    }

    public removeEventListener(type: EventType, listener: EventListener): void {
        this.getEventHandler(type).remove(listener);
    }

    public enableWarnings(): void {
        this.warnings = true;
    }

    public disableWarnings(): void {
        this.warnings = false;
    }

    public ignoreFirstWarning(): void {
        this.shouldIgnoreFirstWarning = true;
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

    private addNewIntent(name: string, duration: number, data?: any): void {
        let metaData: IntentMetaData;

        const timeout = window.setTimeout(() => {
            this.markEventStatuses();
            this.removeIntent(name, metaData);
            this.triggerEvent('timedout', name, metaData);
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
        this.getEventHandler(type).trigger(name, metaData.duration, metaData.data);
    }

    private warn(msg: string): void {
        if (!this.warnings) {
            return;
        }
        // tslint:disable-next-line no-console
        console.warn(msg);
    }

    private warnNonExistingEvent(name: string, action: string): void {
        // should we ignore the first warning?
        if (this.shouldIgnoreFirstWarning && !this.firstEventFinished) {
            return;
        }
        this.warn(`Trying to ${action} a non-existing intent: ${name}. Did you forget to start it or has already completed/failed?`);
    }

    private initEventHandlers(): void {
        const types: EventType[] = [
            'completed', 'incompleted', 'cancelled', 'failed', 'timedout'
        ];
        types.forEach(type => {
            this.eventHandlers.set(type, new EventHandler<EventListener>());
        });
    }

    private markEventStatuses(): void {
        if (!this.firstEventFinished) {
            this.firstEventFinished = true;
        }
    }

}