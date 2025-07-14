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

/** Response type */
    export interface ApiResponse<T> {
        ok: boolean;
        status: number;
        data?: T;
        error?: string;
    }

/**
 * Class for HTTP requests.
 *
 * Provides a method `request` to abstract from JavaScript's `fetch` API.
 */
export class API {

    /**
     * API perfoms a GET or POST HTTP Request.
     * 
     * The method provides a nice abstraction to the fetch API to help developers
     * focus on the response rather than the request details.
     */
    public async request<T>(url: string, method: string, data?: Object): Promise<ApiResponse<T>> {
        if (method !== "POST" && method !== "GET") {
            return {
                ok: false,
                status: 0,
                error: `Unsupported HTTP method: ${method}`
            };
        }

        const options: RequestInit = {
            method: method,
            headers: { "Content-Type": "application/json" }
        };

        if (method === "POST") options.body = JSON.stringify(data);

        try {
            const response = await fetch(url, options);
            const result: ApiResponse<T> = {ok: response.ok, status: response.status};

            try {
                const data = await response.json();
                if (result.ok) result.data = data;
                else result.error = data?.message || JSON.stringify(data);
            } catch (jsonErr) {
                if (!response.ok) result.error = `HTTP ${response.status} ${response.statusText}`;
            }
            return result;
        } catch (networkErr: any) {
            return {
                ok: false,
                status: 0,
                error: networkErr.message || String(networkErr)
            };
        } 
    }

    /**
     * Sends a `FormData` payload via POST using `fetch()`, returns parsed JSON.
     */
    public async submitForm<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
        const init: RequestInit = {
            method: "POST",
            body: formData
        };

        try {
            const response = await fetch(url, init);
            const result: ApiResponse<T> = {ok: response.ok, status: response.status};

            try {
                const data = await response.json();
                if (result.ok) result.data = data;
                else result.error = data?.error || JSON.stringify(data);
            } catch (jsonErr) {
                if (!response.ok) result.error = `HTTP ${response.status} ${response.statusText}`;
            }
            return result;
        } catch (networkErr: any) {
            return {
                ok: false,
                status: 0,
                error: networkErr.message || String(networkErr)
            };
        } 

    }
}