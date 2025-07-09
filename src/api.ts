/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    api.ts
 * Author:      Josh Bassett
 * Date:        08/06/2025
 * Version:     1.0
 * 
 * Licence:     Apache 2.0
 */

/**
 * # API
 * 
 * Class for HTTP requests.
 * 
 * ### Overview:
 * Provides a method `request` to abstract from JavaScript's `fetch` API.
 * 
 * ### Methods:
 * - **request()**: Makes a GET or POST HTTP request.
 */
export class API {

    /**
     * API perfoms a GET or POST HTTP Request.
     * 
     * The method provides a nice abstraction to the fetch API to help developers
     * focus on the response rather than the request details.
     */
    public async request<T>(url: string, method: string, data?: Object): Promise<T> {
        if (method !== "POST" && method !== "GET") {
            throw new Error("Unsupported or invalid method type");
        }

        const options: RequestInit = {
            method: method,
            headers: { "Content-Type": "application/json" }
        };

        if (method === "POST") options.body = JSON.stringify(data);

        try {
            const response: Response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ERROR: Status: ${response.status}`);
            return await response.json();
        } catch (error: any) { throw new Error(error.message);}
    }

    /**
     * Sends a `FormData` payload via POST using `fetch()`, returns parsed JSON.
     */
    public async submitForm<T>(url: string, formData: FormData): Promise<T> {
        const init: RequestInit = {
            method: "POST",
            body: formData
            // NOTE: fetch will auto-set the correct multipart boundary
        };

        const resp = await fetch(url, init);
        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
        }
        return resp.json() as Promise<T>;
    }
}