import * as rp from 'request-promise-native';
import { JSDOM } from 'jsdom';

import { JSONRequestParams, GetDocumentResponse, PostFormParams } from './interfaces';
import { CookieJar } from 'request';

export const everyObjectHasOwnProperty = (objects: object[], property: string): boolean => {
    const propertyTest = (object: object): boolean => {
        return object.hasOwnProperty(property);
    }

    return objects.every(propertyTest);
}

export const everyObjectHasUniquePropertyValue = (objects: object[], property: string): boolean => {
    const properties = new Set(objects.map(object => object[property]));

    return properties.size === objects.length;
}

export const getJSON = async (params: JSONRequestParams): Promise<any> => {
    try {
        const response = await rp(params);
        return response;
    }
    catch (e) {
        throw new Error(e);
    }
}

export const getDocument = async (url: string, jar?: CookieJar): Promise<GetDocumentResponse> => {
    const cookieJar: CookieJar = !jar ? rp.jar() : jar;
    try {
        const html = await rp({ uri: url, jar: cookieJar });
        const page: Document = new JSDOM(html).window.document;

        return {
            document: page,
            cookieJar: cookieJar
        };
    } catch (e) {
        throw new Error(e);
    }
}

export const postForm = async (params: PostFormParams): Promise<any> => {
    try {
        const postResponse = await rp(params);
        return postResponse;
    } catch (e) {
        throw new Error(e);
    }
}

export const getAllDatesBetweenInclusive = (startDate: Date, endDate: Date): Date[] => {
    let currentDate: Date = new Date(startDate.getTime());
    let datesBetween: Date[] = [];

    while (currentDate <= endDate) {
        datesBetween.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesBetween;
}

export const getFirstOfPreviousMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() - 1, 1)
}

export const getLastOfPreviousMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 0)
}

export const getRandomBooleanWithSetChance = (percentChance: number): boolean => {
    return Math.random() * 100 < percentChance;
}