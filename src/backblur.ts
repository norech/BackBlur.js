declare namespace BackBlur {
    export interface Settings {
        [index:string]: any
        selector?: string | Element | Element[]
        background_color?: string
        apply_zindex?: boolean
        blur_radius?: number
        tmp_prefix?: string
        cache?: boolean
    }
}

var BackBlur = (function(){

    /**
     * BackBlur helper functions
     *
     * @internal
     */
    class Helper {
        
        /**
         * Get all HTML elements found by a CSS selector.
         * @param selector CSS selector
         */
        static getAllBySelector(selector : string)
        {
            return Helper.arrayOf<HTMLElement>(document.querySelectorAll(selector))
        }       

        /**
         * Get first HTML element found by a CSS selector.
         * @param selector CSS selector
         */
        static getBySelector(selector : string)
        {
            return document.querySelector(selector) as HTMLElement
        }

        /**
         * Convert an array-like object to array.
         * @param element Element to convert
         */
        static arrayOf<T>(element: any)
        {
            return Array.prototype.slice.call(element) as Array<T>
        } 
        
        /**
         * Check if color is valid.
         * @param string Color string
         */
        static isValidColor(string : string)
        {
            return /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))$/.test(string)
        }
        
        /**
         * Check if a CSS class name is valid.
         * @param string Class name string
         */
        static isValidCSSClassName(string : string)
        {
            return /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*\s*$/.test(string)
        }
        
        /**
         * Add an event listener.
         * @param object Object who owns event listener
         * @param type Event to listen
         * @param callback Function to call
         */
        static addEvent(object: any, type: any, callback: any)
        {
            if (object == null || typeof(object) == 'undefined') return
            if (object.addEventListener) {
                object.addEventListener(type, callback, false)
            } else if (object.attachEvent) {
                object.attachEvent("on" + type, callback)
            } else {
                object["on"+type] = callback;
            }
        }

        /**
         * Check and update settings.
         * @param usersettings User-provided settings
         * @param settings Default settings
         */
        static checkSettings(usersettings : BackBlur.Settings, settings : BackBlur.Settings)
        {
            if(typeof usersettings === "undefined") usersettings = {}
            if(typeof usersettings !== "object") throw new TypeError("BackBlur - The settings argument must be an object.")
            
            Object.keys(settings).forEach(key => {
                if(typeof usersettings[key] != "undefined"){
                    settings[key] = usersettings[key]
                }
            });

            return settings
        }

        /**
         * Quote string to use it in RegExp.
         * @param str String to escape
         */
        static regExpQuote(str : string) {
            return (str+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&");
        };
    }

    /**
     * BackBlur class
     *
     * @class
     */
    return class BackBlur {
        settings: BackBlur.Settings = []
        elements: HTMLElement[] = []
        tmpName: string = ''

        /**
         * Create a new BackBlur.
         * @param settings Settings object
         */
        constructor(settings : BackBlur.Settings)
        {
            this.settings = Helper.checkSettings(settings, {
                selector: ".backblur",
                background_color: 'rgba(255, 255, 255, 0.65)',
                apply_zindex: true,
                blur_radius: 15,
                tmp_prefix: '__BACKBLUR',
                cache: true
            })

            if(!Helper.isValidCSSClassName(this.settings.tmp_prefix || "")) throw new Error(`BackBlur - "${this.settings.tmp_prefix}" is not a valid name.`)

            this.tmpName = this.settings.tmp_prefix + "_" + Math.floor(Math.random() * 9999999)
            Helper.addEvent(window, 'resize', () => this.update())
            this.update()
        }

        /**
         * Select elements to apply blur effect.
         */
        getElements()
        {
            var selector = this.settings.selector
            var getAllBySelector = Helper.getAllBySelector

            if(typeof selector === 'string'){

                if(!this.settings.cache){
                    return getAllBySelector(selector)
                }
                else if(this.elements.length == 0){
                    this.elements = getAllBySelector(selector)
                }
                return this.elements
            }else if ( Object.prototype.toString.call( selector ) === '[object Array]' ){
                return selector as HTMLElement[]
            }else return [<HTMLElement>selector]
        }

        /**
         * Clear the cache
         */
        clearCache()
        {
            if(this.settings.cache == true)
                this.elements = []
        }
        
        /**
         * Updates the blurs.
         */
        update()
        {
            this.erase()
            this.draw()
        }

        /**
         * Clears the styles.
         */
        erase()
        {
            Helper.getAllBySelector("*[class*='" + this.tmpName + "_']").forEach(item => {
                item.className = item.className.replace(new RegExp("[ ]*" + Helper.regExpQuote(this.tmpName+'_')+"([0-9]+)[ ]*", "g"), '')
            })
        }

        /**
         * Draws the blurs.
         */
        draw()
        {
            var css = '';
            var elements = this.getElements()
            var settings = this.settings

            elements.forEach(element => {
                var parent : HTMLElement | null

                if(element.hasAttribute("data-backblur-parent")){
                    parent = Helper.getBySelector(element.getAttribute("data-backblur-parent")!!)
                } else parent = element.parentElement
                if(parent != null){

                    var bStyle = '';
                    var aStyle = '';
                    var element_class = this.tmpName + '_' + Math.floor(Math.random() * 9999999)
                    var parent_computed = document.defaultView.getComputedStyle(parent, undefined)
                    
                    var blur_radius = parseFloat(settings.blur_radius!!.toString())

                    element.className += ' ' + element_class

                    aStyle += `content: "";`
                    if(settings.apply_zindex){
                        aStyle += `z-index: 0;`
                    }

                    aStyle += `filter: blur(${blur_radius}px);`
                    aStyle += `position: absolute;`
                    aStyle += `top: ${parent.offsetTop - element.offsetTop}px;`
                    aStyle += `left: ${parent.offsetLeft - element.offsetLeft}px;`
                    aStyle += `right: ${(element.offsetLeft + element.offsetWidth) - (parent.offsetLeft + parent.offsetWidth)}px;`
                    aStyle += `bottom: ${(element.offsetTop + element.offsetHeight) - (parent.offsetTop + parent.offsetHeight)}px;`

                    ;["background-image", "background-position", "background-size", "background-repeat",
                        "background-attachment", "background-origin", "background-clip", "background-color"]
                    .forEach(prop => {
                        aStyle += `${prop}: ${parent_computed.getPropertyValue(prop)};`
                    })


                    if(!Helper.isValidColor(settings.background_color!!)) throw new Error(`BackBlur - "${settings.background_color}" is not a valid color.`)

                    bStyle += `content: '';`
                    if(settings.apply_zindex){
                        bStyle += `z-index: 0;`
                    }
                    bStyle += `background: ${settings.background_color};`
                    bStyle += `position: absolute;`
                    bStyle += `left: 0px;`
                    bStyle += `top: 0px;`
                    bStyle += `bottom: 0px;`
                    bStyle += `right: 0px;`

                    css += `.${element_class}::before{${aStyle}}`
                    css += `.${element_class}::after{${bStyle}}`

                    if(settings.apply_zindex){
                        css += `.${element_class} *{position:relative;z-index:1;}`
                    }
                }
            })
            document.head.insertAdjacentHTML('beforeend', `<style id="${this.tmpName}_STYLE">${css}</style>`);
        }
    }

})()