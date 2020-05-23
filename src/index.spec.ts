
import { UserIntentService } from './user-intents-service';

import {
    startIntent,
    completeIntent,
    cancelIntent,
    failIntent,
    addEventListener,
    removeEventListener,
    ignoreFirstWarning
} from './index';

jest.mock('./user-intents-service');

describe('Public API', () => {

    let singleton: jest.Mocked<UserIntentService>;

    beforeEach(() => {
        singleton = (UserIntentService as any).mock.instances[0];
    });

    describe('startIntent()', () => {

        beforeEach(() => {
            singleton.start.mockClear();
        });

        it('should pass through args to the singleton service', () => {
            startIntent('my-intent', 1000, { foo: 'bar' });
            expect(singleton.start).toHaveBeenCalled();
            expect(singleton.start).toHaveBeenCalledWith(
                'my-intent', 1000, { foo: 'bar' }
            );
        });

    });

    describe('completeIntent()', () => {

        beforeEach(() => {
            singleton.complete.mockClear();
        });

        it('should pass through args to the singleton service', () => {
            completeIntent('my-intent');
            expect(singleton.complete).toHaveBeenCalled();
            expect(singleton.complete).toHaveBeenCalledWith('my-intent');
        });

    });

    describe('cancelIntent()', () => {

        beforeEach(() => {
            singleton.cancel.mockClear();
        });

        it('should pass through args to the singleton service', () => {
            cancelIntent('my-intent');
            expect(singleton.cancel).toHaveBeenCalled();
            expect(singleton.cancel).toHaveBeenCalledWith('my-intent');
        });

    });

    describe('failIntent()', () => {

        beforeEach(() => {
            singleton.fail.mockClear();
        });

        it('should pass through args to the singleton service', () => {
            failIntent('my-intent');
            expect(singleton.fail).toHaveBeenCalled();
            expect(singleton.fail).toHaveBeenCalledWith('my-intent');
        });

    });

    describe('addEventListener()', () => {

        beforeEach(() => {
            singleton.addEventListener.mockClear();
        });

        it('should pass through args to the singleton service', () => {
            const listener = jest.fn();
            addEventListener('completed', listener);
            expect(singleton.addEventListener).toHaveBeenCalled();
            expect(singleton.addEventListener).toHaveBeenCalledWith('completed', listener);
        });

    });

    describe('removeEventListener()', () => {

        beforeEach(() => {
            singleton.removeEventListener.mockClear();
        });

        it('should pass through args to the singleton service', () => {
            const listener = jest.fn();
            removeEventListener('completed', listener);
            expect(singleton.removeEventListener).toHaveBeenCalled();
            expect(singleton.removeEventListener).toHaveBeenCalledWith('completed', listener);
        });

    });

    describe('ignoreFirstWarning()', () => {

        beforeEach(() => {
            singleton.ignoreFirstWarning.mockClear();
        });

        it('should pass through to the singleton service', () => {
            ignoreFirstWarning();
            expect(singleton.ignoreFirstWarning).toHaveBeenCalled();
        });

    });

});