import { CookieJar } from "request";

export interface GetDocumentResponse {
    document: Document;
    cookieJar: CookieJar
}

export interface JSONRequestParams {
    uri: string;
    qs?: Object;
    headers?: Object;
    json: true;
}

export interface PostFormParams {
    method: 'POST';
    uri: string;
    form: object;
    jar?: CookieJar;
    headers?: object;
    followAllRedirects?: boolean;
}
