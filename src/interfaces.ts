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