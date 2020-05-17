import { EventHandler } from '../event-handler';

interface IntentMetaData {
    timeout: number,
    duration: number,
    data?: object
}

export type EventListener = (name: string, duration: number, data?: object) => void;

export class UserIntentService {

    private intents : Map<string, IntentMetaData> = new Map<string, IntentMetaData>();

    private incompleted: EventHandler<EventListener> = new EventHandler<EventListener>();
    private cancelled: EventHandler<EventListener> = new EventHandler<EventListener>();
    private failed: EventHandler<EventListener> = new EventHandler<EventListener>();

    public start(name: string, duration: number, data?: object): void {
        this.validateName(name);
        this.validateDuration(duration);

        const existing = this.intents.get(name);
        if (existing) {
            this.removeIntent(name, existing);
            this.triggerIncompleted(name, existing);
        }

        this.addNewIntent(name, duration, data);
    }

    public complete(name: string): void {
        const existing = this.intents.get(name);
        if (existing) {
            this.removeIntent(name, existing);
            this.triggerCancelled(name, existing);
        }
    }

    public cancel(name: string): void {
        const existing = this.intents.get(name);
        if (existing) {
            this.removeIntent(name, existing);
        }
    }

    public addIncompletedEventListener(listener: EventListener): void {
        this.incompleted.add(listener);
    }

    public removeIncompletedEventListener(listener: EventListener): void {
        this.incompleted.remove(listener);
    }

    public addCancelledEventListener(listener: EventListener): void {
        this.cancelled.add(listener);
    }

    public removeCancelledEventListener(listener: EventListener): void {
        this.cancelled.remove(listener);
    }

    public addFailedEventListener(listener: EventListener): void {
        this.failed.add(listener);
    }

    public removeFailedEventListener(listener: EventListener): void {
        this.failed.remove(listener);
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
            this.triggerFailed(name, metaData);
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

    private triggerIncompleted(name: string, metaData: IntentMetaData): void {
        this.incompleted.trigger(name, metaData.duration, metaData.duration);
    }

    private triggerCancelled(name: string, metaData: IntentMetaData): void {
        this.cancelled.trigger(name, metaData.duration, metaData.duration);
    }

    private triggerFailed(name: string, metaData: IntentMetaData): void {
        this.failed.trigger(name, metaData.duration, metaData.duration);
    }

}