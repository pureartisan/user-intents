type Callable = (...args: any[]) => void;

export class EventHandler<T extends Callable> {
  private listeners: Set<T> = new Set<T>();

  add(listener: T): void {
    this.listeners.add(listener);
  }

  remove(listener: T): void {
    this.listeners.delete(listener);
  }

  trigger(...args: any[]): void {
    this.listeners.forEach((listener) => {
      listener(...args);
    });
  }
}
