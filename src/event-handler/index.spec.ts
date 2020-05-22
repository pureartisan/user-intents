import { EventHandler } from './index';

type Listner = (foo: string, bar: number) => void;

describe('EventHandler', () => {

    let eventHandler: EventHandler<Listner>;

    beforeEach(() => {
        eventHandler = new EventHandler<Listner>();
    });

    it('should be able to add listener without failing', () => {
        const listener = jest.fn();
        expect(() => eventHandler.add(listener)).not.toThrow();
    });

    it('should be able to add multiple listener without failing', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        expect(() => eventHandler.add(listener1)).not.toThrow('lsitener 1 failed');
        expect(() => eventHandler.add(listener2)).not.toThrow('lsitener 2 failed');
    });

    it('should be able to remove listener without failing', () => {
        const listener = jest.fn();
        expect(() => eventHandler.remove(listener)).not.toThrow();
    });

    it('should call all listeners when an event is triggered', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();

        // add event listeners
        eventHandler.add(listener1);
        eventHandler.add(listener2);

        // trigger event
        eventHandler.trigger('event-1', 123);

        // both listeners should have been called
        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener1).toHaveBeenCalledWith('event-1', 123);

        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledWith('event-1', 123);
    });

    it('should call listener every time an event is triggered', () => {
        const listener = jest.fn();

        // add event listener
        eventHandler.add(listener);

        // trigger events
        eventHandler.trigger('event-1', 123);
        eventHandler.trigger('event-2', 456);

        // listeners once for each event
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledWith('event-1', 123);
        expect(listener).toHaveBeenCalledWith('event-2', 456);
    });

    it('should not call listener when it has been removed', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        const listener3 = jest.fn();

        // add event listeners
        eventHandler.add(listener1);
        eventHandler.add(listener2);
        eventHandler.add(listener3);

        // trigger event
        eventHandler.trigger('event-1', 123);

        // remove second listener
        eventHandler.remove(listener2);

        // trigger another event
        eventHandler.trigger('event-2', 456);

        // event 1 and 3 to be called twice
        expect(listener1).toHaveBeenCalledTimes(2);
        expect(listener1).toHaveBeenCalledWith('event-1', 123);
        expect(listener1).toHaveBeenCalledWith('event-2', 456);

        expect(listener3).toHaveBeenCalledTimes(2);
        expect(listener3).toHaveBeenCalledWith('event-1', 123);
        expect(listener3).toHaveBeenCalledWith('event-2', 456);

        // event 2 only called on the first event
        expect(listener2).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledWith('event-1', 123);
    });

    it('should ignore the same listener being added multiple times', () => {
        const listener = jest.fn();

        // add event listener multiple times
        eventHandler.add(listener);
        eventHandler.add(listener);
        eventHandler.add(listener);

        // trigger event
        eventHandler.trigger('event-1', 123);

        // listener should have been called only once
        expect(listener).toHaveBeenCalledTimes(1);
    });

});