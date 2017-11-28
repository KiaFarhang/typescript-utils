import 'mocha';
import * as chai from 'chai';
import * as nock from 'nock';
import * as sinon from 'sinon';
import * as path from 'path';
import * as rp from 'request-promise-native';
import { cookie } from 'request';
const assert = chai.assert;

import * as utils from './index';

import { JSONRequestParams, PostFormParams } from './interfaces';

describe('Utilities', () => {
    describe('Object code', () => {
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
    });
    describe('Network code', () => {
        const endpoint = 'https://example.com';
        const badEndpoint = 'https://500error.com';
        before(() => {
            const badGetServer = nock(badEndpoint)
                .persist()
                .get('/')
                .reply(500);

            const badPostServer = nock(badEndpoint)
                .persist()
                .post('/')
                .reply(500);
        });
        after(() => {
            nock.cleanAll();
        })
        describe('getJSON', () => {
            let fakeServer;

            before(() => {
                fakeServer = nock('http://foobar.com')
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
                        uri: 'http://foobar.com/users/1',
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
        describe('getDocument', () => {
            before(() => {
                const fakeServer = nock(endpoint)
                    .persist()
                    .get('/')
                    .replyWithFile(200, path.join(__dirname, '/../src/example.html'));
            });
            describe('unsuccessful request', () => {
                it('throws an error if the request does not properly execute', async () => {

                    let err;

                    try {
                        const result = await utils.getDocument(badEndpoint);
                    } catch (e) {
                        err = e;
                    }

                    assert.typeOf(err, 'Error');
                });
            });
            describe('successful request', async () => {
                let response, document, cookieJar;

                before(async () => {
                    response = await utils.getDocument(endpoint);
                    document = response.document;
                    cookieJar = response.cookieJar;
                });
                it('returns an object', () => {
                    assert.isObject(response);
                });
                it('the object has a document property, which is a Document', () => {
                    assert.typeOf(document, 'Document');
                });
                it('the object has a cookieJar property, which is a request CookieJar', () => {
                    assert.isObject(cookieJar);
                    const { setCookie, getCookieString, getCookies } = cookieJar;
                    assert.isFunction(setCookie);
                    assert.isFunction(getCookieString);
                    assert.isFunction(getCookies);
                });
                it('if passed a cookieJar, it returns the same one after a request', async () => {
                    const cookieJar = rp.jar();
                    const theCookie = cookie('foo=bar');
                    cookieJar.setCookie(theCookie, 'http://foobar.com');

                    const response = await utils.getDocument(endpoint, cookieJar);
                    const responseJar = response.cookieJar;

                    assert.strictEqual('foo=bar', responseJar.getCookieString('http://foobar.com'))
                });
            });
        });
        describe('postForm', () => {
            before(() => {
                const fakeServer = nock(endpoint)
                    .persist()
                    .post('/', {
                        username: 'kia',
                        password: 'alvvays'
                    })
                    .reply(200, 'foobar');
            });
            describe('unsuccessful request', () => {
                it('throws an error if the request does not properly execute', async () => {

                    let err;

                    const params: PostFormParams = {
                        method: 'POST',
                        uri: badEndpoint,
                        form: {
                            username: 'kia'
                        }
                    };

                    try {
                        const result = await utils.postForm(params);
                    } catch (e) {
                        err = e;
                    }

                    assert.typeOf(err, 'Error');
                });
            });
            describe('successful request', () => {
                it('returns whatever the server should return', async () => {
                    const params: PostFormParams = {
                        method: 'POST',
                        uri: endpoint,
                        form: {
                            username: 'kia',
                            password: 'alvvays'
                        }
                    };

                    const response = await utils.postForm(params);
                    assert.isString(response);
                    assert.strictEqual(response, 'foobar');
                });
            });
        });
    });
    describe('Date code', () => {
        describe('getAllDatesBetweenInclusive', () => {
            const startDate = new Date('1/1/2017');
            const endDate = new Date('1/3/2017');
            const allDates = utils.getAllDatesBetweenInclusive(startDate, endDate);
            it('returns an array', () => {
                assert.isArray(allDates);
            });
            it('each item in the array is a Date', () => {
                allDates.forEach((date) => {
                    assert.isTrue(Object.prototype.toString.call(date) === '[object Date]');
                });
            });
            it('the array contains every date between the start end end ones, including the start and end', () => {
                const expectedDates = [new Date('1/1/2017'), new Date('1/2/2017'), new Date('1/3/2017')];
                allDates.forEach((date, index) => {
                    const returnedDateDay = date.getDate;
                    assert.strictEqual(returnedDateDay, expectedDates[index].getDate);
                });
            });
            it('if passed a start and end date on the same day, it returns just that one day', () => {
                const singleDate = utils.getAllDatesBetweenInclusive(startDate, startDate);
                assert.lengthOf(singleDate, 1);
                assert.strictEqual(singleDate[0].getDate, startDate.getDate);
            });
            it('if passed an end date earlier than the start date, it returns an empty array', () => {
                const empty = utils.getAllDatesBetweenInclusive(endDate, startDate);
                assert.isEmpty(empty);
            });
        });
        describe('getFirstOfPreviousMonth', () => {
            it('returns a Date', () => {
                const date = new Date();
                const newDate = utils.getFirstOfPreviousMonth(date);

                assert.isTrue(Object.prototype.toString.call(newDate) === '[object Date]');
            });
            it(`the Date's date is 1`, () => {
                const date = new Date();
                const newDate = utils.getFirstOfPreviousMonth(date);

                assert.strictEqual(newDate.getDate(), 1);
            });
            it(`the Date's month is one less than the month of the date passed to it`, () => {
                const date = new Date('11/23/2017');
                const newDate = utils.getFirstOfPreviousMonth(date);

                assert.strictEqual(newDate.getMonth(), 9);
            });
            it('works across years - passing a date in January will get you Dec. 1', () => {
                const date = new Date('1/1/2017');
                const newDate = utils.getFirstOfPreviousMonth(date);

                assert.strictEqual(newDate.getDate(), 1);
                assert.strictEqual(newDate.getMonth(), 11);
                assert.strictEqual(newDate.getFullYear(), 2016);
            });
        });
        describe('getLastOfPreviousMonth', () => {
            it('returns a Date', () => {
                const date = new Date();
                const newDate = utils.getLastOfPreviousMonth(date);

                assert.isTrue(Object.prototype.toString.call(newDate) === '[object Date]');
            });
            it(`the Date's date is set to the last possible day of the previous month`, () => {
                const firstDate = new Date('11/12/2017');
                assert.strictEqual(utils.getLastOfPreviousMonth(firstDate).getDate(), 31);

                const secondDate = new Date('5/1/2017');
                assert.strictEqual(utils.getLastOfPreviousMonth(secondDate).getDate(), 30);

                const thirdDate = new Date('3/7/2017');
                assert.strictEqual(utils.getLastOfPreviousMonth(thirdDate).getDate(), 28);
            });
            it(`works properly for leap years`, () => {
                const leapDate = new Date('3/5/2016');
                assert.strictEqual(utils.getLastOfPreviousMonth(leapDate).getDate(), 29);
            });
            it(`the Date's month is set to one less than the month of the date passed`, () => {
                const date = new Date('10/9/2017');
                const newDate = utils.getLastOfPreviousMonth(date);

                assert.strictEqual(newDate.getMonth(), 8);
            });
            it(`works properly across years`, () => {
                const date = new Date('1/1/2017');
                const newDate = utils.getLastOfPreviousMonth(date);

                assert.strictEqual(newDate.getDate(), 31);
                assert.strictEqual(newDate.getMonth(), 11);
                assert.strictEqual(newDate.getFullYear(), 2016);
            })
        });
    });
    describe('Miscellaneous code', () => {
        describe('getRandomBooleanWithSetChance', () => {
            it('returns a boolean', () => {
                assert.isBoolean(utils.getRandomBooleanWithSetChance(50));
            });
            it('returns true if the random number generated is below the provided chance threshold', () => {
                const randomStub = sinon.stub(Math, 'random');
                randomStub.returns(.4);
                const result = utils.getRandomBooleanWithSetChance(50);
                randomStub.restore();
                assert.isTrue(result);
            });
            it('returns false if the random number generated is below the provided chance threshold', () => {
                const randomStub = sinon.stub(Math, 'random');
                randomStub.returns(.7);
                const result = utils.getRandomBooleanWithSetChance(50);
                randomStub.restore();
                assert.isFalse(result);
            });
        });
    });
});