/**
 * Copyright (c) 2025 Josh Bassett
 * 
 * Filename:    api.js
 * Author:      Josh Bassett
 * Date:        08/06/2025
 * Version:     1.0
 * 
 * Description: Base API class that handles all Comp HTTP request logic.
 */

export class API {

    /**
     * @brief A method that handles `GET` and `POST` HTTP requests.
     * 
     * The request logic is handled internally, to retrieve an HTTP request value,
     * specify the URL and Method (GET/POST) and data if applicable.
     * 
     * The data needs to be handled in an `async` function to deal with the `Promise` object.
     * 
     * @example
     * // Function returns login REST API values
     * async login(result, json) {
     * 
     *      let data = await this.compAPI.request("/login", "POST", json);
     * 
     *      (data.status) ? result.innerHTML = data.message : result.innerHTML = data.error;
     * }
     * 
     * @param {string} apiURL 
     * @param {string} apiMethod 
     * @param {object} apiData 
     * 
     * @returns {Promise} JSON data to be parsed
     */
    async request(apiURL: string, apiMethod: string, apiData: Object) {

        if (apiMethod === "POST") {
        
            try {

                const response: Response = await fetch(apiURL, {
                    method: apiMethod,
                    body: JSON.stringify(apiData),
                    headers: {
                        "Content-type": "application/json",
                    },
                });

                return await response.json();
        
            } catch {

                throw new Error("ERROR: Unable to execute request check if the URL is correct");
            
            }
        
        } 
        
        if (apiMethod === "GET") {

            try {

                const response = await fetch(apiURL, {
                    method: apiMethod,
                    headers: {
                        "Content-type": "application/json",
                    },
                });
                
                return await response.json(); 
        
            } catch {

                throw new Error("ERROR: Unable to execute request check if the URL is correct");
            
            }
        
        }

    }


}