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
     * ## Request
     * 
     * Performs a GET or POST HTTP request.
     * 
     * ### Behaviour:
     * Method performs an HTTP request, validates the input, handles any errors, and returns
     * a valid JSON response.
     * 
     * To use this method, you need to contain it within an `async` function in order to read
     * the Promise that is returned.
     * 
     * ### Parameters:
     * - **url** (`string`): The URL of the REST API endpoint.
     * - **method** (`string`): The request method, `POST` or `GET`.
     * - **data** (`Object`): The JSON data as a JavaScript object.
     * 
     * ### Returns:
     * `Promise` - The request data.
     * 
     * ### Example:
     * ```js
     * async post(result, json) {
     *     let data = await this.api.request("/login", "POST", json);
     *     (data.status) ? result.innerHTML = data.message : result.innerHTML = data.error;
     * }
     * ```
     * ```js
     * async get() {
     *     const data = await this.api.request("/fact", "GET");
     *     console.log(data.fact);
     * }
     * ```
     */
    public async request<T>(url: string, method: string, data?: Object): Promise<T> {

        if (method !== "POST" && method !== "GET") {

            throw new Error("Unsupported or invalid method type");
        
        }

        const options: RequestInit = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        };

        if (method === "POST") options.body = JSON.stringify(data);

        try {

            const response: Response = await fetch(url, options);

            if (!response.ok) throw new Error(`HTTP ERROR: Status: ${response.status}`);
            
            return await response.json();
        
        } catch (error: any) {

            throw new Error(error.message);
        
        }
    
    }

}