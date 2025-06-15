/**
 * Copyright (c) 2025 Josh Bassett, whondo.com
 * 
 * Filename:    effect.ts
 * Authors:     Sarit Samkumpim, Josh Bassett
 * Date:        11/06/2025
 * Version:     1.1
 * 
 * Description: Base effect class for CSS injection for components.
 */

export class Effects {

    /**
     * @brief A method that provides a effect shorthand property.
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
     * @returns {literal} A CSS string literal with effect properties
     */
    prop(aniName: string, duration: string, timing = "ease", delay = "0", iterate = "1", direction = "normal", fillMode = "none" ) {

        return `${aniName} ${duration}s ${timing} ${delay}s ${iterate} ${direction} ${fillMode};`;
    
    }

    /**
    * @brief A method that provides an effect for fading in an element.
    * 
    * @returns {literal} A CSS string literal with effect properties
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
     * @brief A method that provides an effect for fading out an element.
     *
     * @returns {literal} A CSS string literal with effect properties
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
     * @brief A method that provides an effect for fading in an element from the left.
     * 
     * @param {number} translateX
     * 
     * @returns {literal} A CSS string literal with effect properties
     */
    fadeLeft(translateX: number){

        return /*css */ `
            @keyframes fadeLeft {
                0% {
                    opacity: 0;
                    transform: translateX(${translateX}px);
                }

                100% {
                    opacity: 1;
                    transform: translateX(0);

                }

            }
        `;
    
    }

    /**
     * @brief A method that provides an effect for fading in an element from the right.
     * 
     * @param {number} translateX
     * 
     * @returns {literal} A CSS string literal with effect properties
     */
    fadeRight(translateX: number) {

        return /*css*/ `
            @keyframes fadeRight {
                0% {
                    opacity: 0;
                    transform: translateX(0);

                }

                100% {
                    opacity: 1;
                    transform: translateX(${translateX}px);

                }
            }
        `;
    
    } 

    /**
     * @brief A method that provides an effect for sliding an element from the bottom.
     * 
     * @param {number} translateY
     * 
     * @returns {literal} A CSS string literal with effect properties
     */
    slideUp(translateY: number){

        return /* css */ `
            @keyframes slideUp {
                0% {
                    opacity: 0;
                    transform: translateY(${translateY}px);
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
     * @brief A method that provides an effect for sliding an element from the top.
     * 
     * @param {number} translateY
     *
     * @returns {literal} A CSS string literal with effect properties
     */
    slideDown(translateY: number) {

        return /*css */ `
            @keyframes slideDown {
                0% {
                    opacity: 0;
                    transform: translateY(${translateY}px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
    
    }

    /**
     * @brief A method that provides an effect for scaling an element.
     * 
     * @param {number} scaleFrom
     * @param {number} scaleTo
     * 
     * @returns {literal} A CSS string literal with effect properties
     */
    scale(scaleFrom: number, scaleTo: number){

        return /*css */ `
            @keyframes scaleIn {
                0% {
                    opacity: 0;
                    transform: scale(${scaleFrom});
                }

                100% {
                    opacity: 1;
                    transform: scale(${scaleTo});
                }
            }
        `;
    
    }
    
    /**
     * @brief A method that provides an effect for pulsing an element, scales then shrinks.
     * 
     * @returns {literal} A CSS string literal with effect properties
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
     * @brief A method that provides an effect for fading out an element to the right.
     * 
     * @param {number} x
     * 
     * @returns {literal} A CSS string literal with effect properties
     */
    fadeOutRight(translateX: number){

        return /*css */ `
            @keyframes fadeOutRight {
                0% {
                    opacity: 1;
                    transform: translateX(0)

                }

                100% {
                    opacity: 0;
                    transform: translateX(${translateX}px)

                }
            }
        `;
    
    }


    /**
     * @brief A method that provides an effect for fading out an element to the left.
     * 
     * @param {number} x
     * 
     * @returns {literal} A CSS string literal with effect properties
     */
    fadeOutLeft(translateX: number) {

        return /* css */ `
            @keyframes fadeOutLeft {
                0% {
                    opacity: 1;
                    transform: translateX(0)
                }

                100% {
                    opacity: 0;
                    transform: translateX(${translateX}px)
                }
            }
        `;
    
    }

    
}