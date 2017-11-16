import 'mocha';
import * as chai from 'chai';
import * as nock from 'nock';
const assert = chai.assert;

import * as utils from './index';

import { JSONRequestParams } from './interfaces';

describe('Utilities', () => {
    describe('everyObjectHasOwnProperty', () => {
        it('returns true if every object in the array has its own property matching the one provided', () => {
            const objects = [
                { foo: 1 },
                { foo: 2 }
            ];

            assert.isTrue(utils.everyObjectHasOwnProperty(objects, 'foo'));
        });
        it('returns false if any object in the array does not have its own property matching the one provided', () => {
            const objects = [
                { foo: 1 },
                { bar: 1 }
            ];

            assert.isFalse(utils.everyObjectHasOwnProperty(objects, 'foo'));
        });
    });
    describe('everyObjectHasUniquePropertyValue', () => {
        it('returns true if every object in the array has a unique value for the given property', () => {
            const objects = [
                { foo: 1 },
                { foo: 2 }
            ];
            assert.isTrue(utils.everyObjectHasUniquePropertyValue(objects, 'foo'));
        });
        it('returns false if every object in the array does not have a unique value for the given property', () => {
            const objects = [
                { foo: 1 },
                { foo: 1 },
                { foo: undefined }
            ];
            assert.isFalse(utils.everyObjectHasUniquePropertyValue(objects, 'foo'));
        });
    });
    describe('getJSON', () => {
        let fakeServer;

        before(() => {
            fakeServer = nock('http://example.com')
                .persist()
                .get('/users/1')
                .reply(200, {
                    _id: '123ABC',
                    _rev: '946B7D1C',
                    username: 'pgte',
                    email: 'pedro.teixeira@gmail.com'
                });
        });
        describe('successful request', () => {
            it('returns an object', async () => {
                const options: JSONRequestParams = {
                    uri: 'http://example.com/users/1',
                    json: true,
                }
                const result = await utils.getJSON(options);
                assert.isObject(result);
            });
        });
        describe('unsuccessful request', () => {
            it('throws an error', async () => {

                const options: JSONRequestParams = {
                    uri: 'http://httpstat.us/500',
                    json: true,
                }

                let err;

                try {
                    const result = await utils.getJSON(options);
                } catch (e) {
                    err = e;
                }

                assert.typeOf(err, 'Error');
            });
        });
    });
});