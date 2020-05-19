import { sleep } from '../../test/utils/sleep';

import { UserIntentService } from './index';

describe('UserIntentService', () => {

    let service: UserIntentService;

    beforeEach(() => {
        service = new UserIntentService();
    });

    describe('addEventListener()', () => {

        it('should not fail when adding an event listener', () => {
            const listener = jest.fn();
            expect(() => service.addEventListener('completed', listener)).not.toThrow();
        });

    });

    describe('removeEventListener()', () => {

        it('should not fail when removing an event listener', () => {
            const listener = jest.fn();
            expect(() => service.removeEventListener('completed', listener)).not.toThrow();
        });

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

        it('should trigger a `failed` event when the started event is not completed before the duration', async () => {
            const onFailed = jest.fn();
            service.addEventListener('failed', onFailed);

            const smallTime = 50;

            // first time
            service.start('my-intent', smallTime, { foo: 'bar' });

            // time elapses
            await sleep(smallTime + 1);

            expect(onFailed).toHaveBeenCalledTimes(1);
            expect(onFailed).toHaveBeenCalledWith('my-intent', smallTime, { foo: 'bar' });
        });

        it('should use default duration if the duration is not provided', async () => {
            const onFailed = jest.fn();
            service.addEventListener('failed', onFailed);

            const defaultDuration = 50;
            service.setDefaultDuration(defaultDuration);

            // no duration is provided
            service.start('my-intent');

            // time elapses, but hasn't reached default duration yet
            await sleep(defaultDuration - 1);
            expect(onFailed).not.toHaveBeenCalled();

            // further time elapses, and passes default duration
            await sleep(2); // time => defaultDuration + 2

            // intent should fail
            expect(onFailed).toHaveBeenCalled();
        });

        it('should use default duration if an invalid duration is provided', async () => {
            const onFailed = jest.fn();
            service.addEventListener('failed', onFailed);

            const defaultDuration = 50;
            service.setDefaultDuration(defaultDuration);

            // no duration is provided
            service.start('my-intent', 0);

            // time elapses, but hasn't reached default duration yet
            await sleep(defaultDuration - 1);
            expect(onFailed).not.toHaveBeenCalled();

            // further time elapses, and passes default duration
            await sleep(2); // time => defaultDuration + 2

            // intent should fail
            expect(onFailed).toHaveBeenCalled();
        });

    });

    describe('complete()', () => {

        let consoleWarn: jest.SpyInstance;

        beforeEach(() => {
            consoleWarn = jest.spyOn(global.console, 'warn');
        });

        afterEach(() => {
            consoleWarn.mockRestore();
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

            // complete intent no longer pending
            service.complete('my-intent');

            expect(consoleWarn).toHaveBeenCalled();
        });

        it('should log warning if intent has already been cancelled', () => {
            service.start('my-intent', 10);

            // intent manually cancelled
            service.cancel('my-intent');

            // complete intent no longer pending
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

});