/**
 * Copyright (c) 2025 Josh Bassett, whondo.com
 * 
 * Filename:    animation.js
 * Author:      Sarit Samkumpim
 * Date:        11/06/2025
 * Version:     1.1
 * 
 * Description: Base animation class for CSS injection for components.
 */

export class Animate {

    /**
     * @brief A method that provides a animation shorthand property.
     * 
     * @param {string} aniName 
     * @param {int}    duration 
     * @param {string} timing 
     * @param {int}    delay 
     * @param {int}    iterate 
     * @param {string} direction
     * 
     * @param {string} fillMode 
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    prop(aniName, duration, timing = "ease", delay = "0", iterate = "1", direction = "normal", fillMode = "none" ) {

        return `${aniName} ${duration}s ${timing} ${delay}s ${iterate} ${direction} ${fillMode};`;
    
    }

    /**
    * @brief A method that provides an animation for fading in an element.
    * 
    * @returns {literal} A CSS string literal with animation properties
    */
    fadeIn(){

        return /* css */ `
        @keyframes fadeIn {
            0% {
                opacity: 0;
            }

            100% {
                opacity: 1;
            }
        }
      `;
    
    }

    /**
     * @brief A method that provides an animation for fading out an element.
     *
     * @returns {literal} A CSS string literal with animation properties
     */
    fadeOut(){

        return /* css */ `
        @keyframes fadeOut {
            100% {
                opacity: 0;
            }

            0% {
                opacity: 1;
            }
        }
      `;
    
    }

    /**
     * @brief A method that provides an animation for fading in an element from the left.
     * 
     * @param {number} x
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    fadeLeft(x){

        return /*css */ `
            @keyframes fadeLeft {
                0% {
                    opacity: 0;
                    transform: translateX(${x}px);
                }

                100% {
                    opacity: 1;
                    transform: translateX(0);

                }

            }
        `;
    
    }

    /**
     * @brief A method that provides an animation for fading in an element from the right.
     * 
     * @param {number} x
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    fadeRight(x) {

        return /*css*/ `
            @keyframes fadeRight {
                0% {
                    opacity: 0;
                    transform: translateX(0);

                }

                100% {
                    opacity: 1;
                    transform: translateX(${x}px);

                }
            }
        `;
    
    } 

    /**
     * @brief A method that provides an animation for sliding an element from the bottom.
     * 
     * @param {number} y
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    slideUp(y){

        return /* css */ `
            @keyframes slideUp {
                0% {
                    opacity: 0;
                    transform: translateY(${y}px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;

    }

    /**
     * 
     * @brief A method that provides an animation for sliding an element from the top.
     * 
     * @param {number} y
     *
     * @returns {literal} A CSS string literal with animation properties
     */
    slideDown(y) {

        return /*css */ `
            @keyframes slideDown {
                0% {
                    opacity: 0;
                    transform: translateY(${y}px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
    
    }

    /**
     * @brief A method that provides an animation for scaling an element.
     * 
     * @param {number} to
     * @param {number} from
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    scale(to, from){

        return /*css */ `
            @keyframes scaleIn {
                0% {
                    opacity: 0;
                    transform: scale(${to});
                }

                100% {
                    opacity: 1;
                    transform: scale(${from});
                }
            }
        `;
    
    }
    
    /**
     * @brief A method that provides an animation for pulsing an element, scales then shrinks.
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    pulse() {

        return /*css */ `
            @keyframes pulsing {
                0% {
                    transform: scale(1);
                }

                50% {
                    transform: scale(1.05);
                }

                100% {
                    transform: scale(1);
                }
            }
        `;
    
    }

    /**
     * @brief A method that provides an animation for fading out an element to the right.
     * 
     * @param {number} x
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    fadeOutRight(x){

        return /*css */ `
            @keyframes fadeOutRight {
                0% {
                    opacity: 1;
                    transform: translateX(0)

                }

                100% {
                    opacity: 0;
                    transform: translateX(${x}px)

                }
            }
        `;
    
    }


    /**
     * @brief A method that provides an animation for fading out an element to the left.
     * 
     * @param {number} x
     * 
     * @returns {literal} A CSS string literal with animation properties
     */
    fadeOutLeft(x) {

        return /* css */ `
            @keyframes fadeOutLeft {
                0% {
                    opacity: 1;
                    transform: translateX(0)
                }

                100% {
                    opacity: 0;
                    transform: translateX(${x}px)
                }
            }
        `;
    
    }

    
}