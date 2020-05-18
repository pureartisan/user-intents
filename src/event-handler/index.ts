type Callable = (...args: any[]) => void;

export class EventHandler<T extends Callable> {

    private listeners: T[] = [];

    add(listener: T): void {
        this.listeners.push(listener);
    }

    remove(listener: T): void {
        this.listeners = this.listeners.filter(item => item !== listener);
    }

    trigger(...args: any[]): void {
        this.listeners.forEach(listener => {
            listener(...args);
        });
    }

}