import { sleep } from '../../test/utils/sleep';

import { UserIntentService } from './index';

describe('UserIntentService', () => {

    let service: UserIntentService;

    beforeEach(() => {
        service = new UserIntentService();
    });

    describe('start()', () => {

        it('should throw error if invalid name is provided', () => {
            expect(() => service.start('')).toThrow();
        });

        it('should throw error if invalid duration is provided and default duration is not set', () => {
            expect(() => service.start('my-intent')).toThrow();
        });

        it('should not trigger an `incompleted` event when a previous intent with same name does not exist', () => {
            const onIncompleted = jest.fn();
            service.addEventListener('incompleted', onIncompleted);

            // non-existing intent
            service.start('my-intent', 10);

            expect(onIncompleted).not.toHaveBeenCalled();
        });

        it('should trigger a `completed` event when the started event is completed before the duration', async () => {
            const onCompleted = jest.fn();
            service.addEventListener('completed', onCompleted);

            // first time
            service.start('my-intent', 1000, { foo: 'bar' });

            // wait for a while, but not as long as the timeout duration
            await sleep(20);

            // complete the intent before the timeout
            service.complete('my-intent');

            expect(onCompleted).toHaveBeenCalledTimes(1);
            expect(onCompleted).toHaveBeenCalledWith('my-intent', 1000, { foo: 'bar' });
        });

        it('should trigger an `incompleted` event when the intent is was started with the same name', () => {
            const onIncompleted = jest.fn();
            service.addEventListener('incompleted', onIncompleted);

            // first time
            service.start('my-intent', 50, { foo: 'bar' });

            // second time, before the first intent with the same name
            // has not finished yet
            service.start('my-intent', 10, null);

            expect(onIncompleted).toHaveBeenCalledTimes(1);
            expect(onIncompleted).toHaveBeenCalledWith('my-intent', 50, { foo: 'bar' });
        });

        it('should trigger a `timedout` event when the started event is not completed before the duration', async () => {
            const onTimedOut = jest.fn();
            service.addEventListener('timedout', onTimedOut);

            const smallTime = 50;

            // first time
            service.start('my-intent', smallTime, { foo: 'bar' });

            // time elapses
            await sleep(smallTime + 1);

            expect(onTimedOut).toHaveBeenCalledTimes(1);
            expect(onTimedOut).toHaveBeenCalledWith('my-intent', smallTime, { foo: 'bar' });
        });

        it('should use default duration if the duration is not provided', async () => {
            const onTimedOut = jest.fn();
            service.addEventListener('timedout', onTimedOut);

            const defaultDuration = 100;
            service.setDefaultDuration(defaultDuration);

            // no duration is provided
            service.start('my-intent');

            // time elapses, but hasn't reached default duration yet
            await sleep(50);
            expect(onTimedOut).not.toHaveBeenCalled();

            // further time elapses, and passes default duration
            await sleep(60); // time => 110 (> default duration)

            // intent should time out
            expect(onTimedOut).toHaveBeenCalled();
        });

        it('should use default duration if an invalid duration is provided', async () => {
            const onTimedOut = jest.fn();
            service.addEventListener('timedout', onTimedOut);

            const defaultDuration = 50;
            service.setDefaultDuration(defaultDuration);

            // no duration is provided
            service.start('my-intent', 0);

            // time elapses, but hasn't reached default duration yet
            await sleep(defaultDuration - 1);
            expect(onTimedOut).not.toHaveBeenCalled();

            // further time elapses, and passes default duration
            await sleep(2); // time => defaultDuration + 2

            // intent should timeout
            expect(onTimedOut).toHaveBeenCalled();
        });
    });

    describe('complete()', () => {

        // tslint:disable-next-line no-console
        const originalConsoleWarn = console.warn;

        let consoleWarn: jest.SpyInstance;

        beforeEach(() => {
            consoleWarn = jest.fn();
            // tslint:disable-next-line no-console
            console.warn = consoleWarn as any;
        });

        afterEach(() => {
            // tslint:disable-next-line no-console
            console.warn = originalConsoleWarn;
        });

        it('should not log warning if intent was started and is still pending', () => {
            service.start('my-intent', 10);

            // complete pending intent
            service.complete('my-intent');

            expect(consoleWarn).not.toHaveBeenCalled();
        });

        it('should log warning if intent was never started', () => {
            service.start('my-intent', 10);

            // complete non-existing intent
            service.complete('other-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already failed', async () => {
            const duration = 10;
            service.start('my-intent', duration);

            // time elpased and intent failed
            await sleep(duration + 1);

            // complete no longer pending intent
            service.complete('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already been cancelled', () => {
            service.start('my-intent', 10);

            // intent manually cancelled
            service.cancel('my-intent');

            // complete no longer pending intent
            service.complete('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should trigger a `completed` event when the started event is completed before the duration', async () => {
            const onCompleted = jest.fn();
            service.addEventListener('completed', onCompleted);

            // first time
            service.start('my-intent', 1000, { foo: 'bar' });

            // wait for a while, but not as long as the timeout duration
            await sleep(20);

            // complete the intent before the timeout
            service.complete('my-intent');

            expect(onCompleted).toHaveBeenCalledTimes(1);
            expect(onCompleted).toHaveBeenCalledWith('my-intent', 1000, { foo: 'bar' });
        });
    });

    describe('cancel()', () => {

        // tslint:disable-next-line no-console
        const originalConsoleWarn = console.warn;

        let consoleWarn: jest.SpyInstance;

        beforeEach(() => {
            consoleWarn = jest.fn();
            // tslint:disable-next-line no-console
            console.warn = consoleWarn as any;
        });

        afterEach(() => {
            // tslint:disable-next-line no-console
            console.warn = originalConsoleWarn;
        });

        it('should not log warning if intent was started and is still pending', () => {
            service.start('my-intent', 10);

            // cancel pending intent
            service.cancel('my-intent');

            expect(consoleWarn).not.toHaveBeenCalled();
        });

        it('should log warning if intent was never started', () => {
            service.start('my-intent', 10);

            // cancel non-existing intent
            service.cancel('other-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already timed out', async () => {
            const duration = 10;
            service.start('my-intent', duration);

            // time elpased and intent timed out
            await sleep(duration + 1);

            // cancel no longer pending intent
            service.cancel('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already been completed', () => {
            service.start('my-intent', 10);

            // intent completed
            service.complete('my-intent');

            // cancel no longer pending intent
            service.cancel('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should trigger a `cancelled` event when the started event is cancelled before the duration', async () => {
            const onCancelled = jest.fn();
            service.addEventListener('cancelled', onCancelled);

            // first time
            service.start('my-intent', 1000, { foo: 'bar' });

            // wait for a while, but not as long as the timeout duration
            await sleep(20);

            // cancel the intent before the timeout
            service.cancel('my-intent');

            expect(onCancelled).toHaveBeenCalledTimes(1);
            expect(onCancelled).toHaveBeenCalledWith('my-intent', 1000, { foo: 'bar' });
        });
    });

    describe('fail()', () => {

        // tslint:disable-next-line no-console
        const originalConsoleWarn = console.warn;

        let consoleWarn: jest.SpyInstance;

        beforeEach(() => {
            consoleWarn = jest.fn();
            // tslint:disable-next-line no-console
            console.warn = consoleWarn as any;
        });

        afterEach(() => {
            // tslint:disable-next-line no-console
            console.warn = originalConsoleWarn;
        });

        it('should not log warning if intent was started and is still pending', () => {
            service.start('my-intent', 10);

            // fail pending intent
            service.fail('my-intent');

            expect(consoleWarn).not.toHaveBeenCalled();
        });

        it('should log warning if intent was never started', () => {
            service.start('my-intent', 10);

            // fail non-existing intent
            service.fail('other-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already timed out', async () => {
            const duration = 10;
            service.start('my-intent', duration);

            // time elpased and intent timed out
            await sleep(duration + 1);

            // fail no longer pending intent
            service.fail('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already been completed', () => {
            service.start('my-intent', 10);

            // intent completed
            service.complete('my-intent');

            // fail no longer pending intent
            service.fail('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should trigger a `failed` event when the started event is failed before the duration', async () => {
            const onFailed = jest.fn();
            service.addEventListener('failed', onFailed);

            // first time
            service.start('my-intent', 1000, { foo: 'bar' });

            // wait for a while, but not as long as the timeout duration
            await sleep(20);

            // fail the intent before the timeout
            service.fail('my-intent');

            expect(onFailed).toHaveBeenCalledTimes(1);
            expect(onFailed).toHaveBeenCalledWith('my-intent', 1000, { foo: 'bar' });
        });
    });

    describe('ignoreFirstWarning()', () => {

        // tslint:disable-next-line no-console
        const originalConsoleWarn = console.warn;

        let consoleWarn: jest.SpyInstance;

        beforeEach(() => {
            consoleWarn = jest.fn();
            // tslint:disable-next-line no-console
            console.warn = consoleWarn as any;
        });

        afterEach(() => {
            // tslint:disable-next-line no-console
            console.warn = originalConsoleWarn;
        });

        it('should not ignore first warning by default', () => {
            // cause a warning by cancelling a non-existing event
            service.cancel('my-intent');

            // warning is logged
            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should ignore first warning when forced', () => {

            // force ignore first warning
            service.ignoreFirstWarning();

            // cause multiple warnings by cancelling a non-existing events
            service.cancel('my-intent-1');
            service.cancel('my-intent-2');
            service.cancel('my-intent-3');

            // warning is logged, but first one is ignored
            expect(consoleWarn).toHaveBeenCalledTimes(2);
        });
    });

    describe('event listeners', () => {
        it('should not fail when adding an event listener', () => {
            const listener = jest.fn();
            expect(() => service.addEventListener('completed', listener)).not.toThrow();
        });

        it('should not fail when removing an event listener', () => {
            const listener = jest.fn();
            expect(() => service.removeEventListener('completed', listener)).not.toThrow();
        });

        it('should only call active event listeners', async () => {
            const onCompleted1 = jest.fn();
            const onCompleted2 = jest.fn();

            // add both event listeners
            service.addEventListener('completed', onCompleted1);
            service.addEventListener('completed', onCompleted2);

            // first event
            startAndCompleteIntent('my-intent-1');

            // both listeners to should have been triggered
            expect(onCompleted1).toHaveBeenCalledTimes(1);
            expect(onCompleted2).toHaveBeenCalledTimes(1);

            // remove first event listener
            service.removeEventListener('completed', onCompleted1);

            // second event
            startAndCompleteIntent('my-intent-2');

            // only second listener should be called twice
            expect(onCompleted1).toHaveBeenCalledTimes(1);
            expect(onCompleted2).toHaveBeenCalledTimes(2);
        });

        function startAndCompleteIntent(name: string): void {
            service.start(name, 1000);
            service.complete(name);
        }
    });

});