define(function (require) {

    var $ = require('jquery');
    var _ = require('underscore');

    var parser = require('html2hscript');
    var VirtualDOM = require('virtual-dom');

    var h = VirtualDOM.h;

    var ID = 1;

    /**
     * This function renders the entire component depending on state, properties
     * and child components. It must return a valid HTML string. The HTML string
     * is used to change the current DOM element by diff'ing and patching its
     * DOM tree.
     *
     * @param state a copy of the state of the component.
     * @param props a copy of the properties of the component.
     * @param children the rendered HTML of all child components as a hash.
     * @returns {string} a HTML string representing the entirely rendered component.
     */
    Component.prototype.render = function (state, props, children) {
        return '<div></div>';
    };

    /**
     * Subscribes the component to a data model. The data model must be
     * a Hoverboard flux style data model. An optional namespace can
     * be submitted. If the data model changes the setState() method
     * of the component is called with the new state and the provided
     * namespace as arguments.
     *
     * @param hoverboard a Hoverboard style data model
     * @param namespace an optional namespace
     * @returns {*} the unsubscribe method.
     */
    Component.prototype.subscribe = function (hoverboard, namespace) {
        var setter = function (state) {
            this.setState(state, namespace);
        };
        return hoverboard.getState($.proxy(setter, this));
    };

    /**
     * Call this method to set the state of the component. The state is merged
     * into the current state leaving all hash properties unchanged which are
     * not present in the new state hash. An optional namespace can be passed
     * to store the state in a separate object property. After the state change
     * the component is re-rendered automatically.
     *
     * @param newState a hash representing the new state
     * @param namespace an optional namespace
     */
    Component.prototype.setState = function (newState, namespace) {
        _mergeStates(this.state, newState, namespace);
        this._tree.setState(this.state);
    };

    /**
     * Call the method to set the state of the component. Unlike setState()
     * the state is not merged but replaced entirely.
     *
     * @param namespace
     * @param newState
     * @see setState
     */
    Component.prototype.replaceState = function (newState, namespace) {
        _resetState(this.state, namespace);
        _mergeStates(this.state, newState, namespace);
        this._tree.render(this.state);
    };

    /**
     * Deletes the current state of the component.
     *
     * @param namespace
     */
    Component.prototype.resetState = function (namespace) {
        _resetState(this.state, namespace);
        this._tree.render(this.state);
    };

    function _mergeStates(state, newState, namespace) {
        if (namespace) {
            if (!state[namespace]) {
                state[namespace] = {};
            }
            $.extend(state[namespace], newState);
        } else {
            $.extend(state, newState);
        }
        return state;
    }

    function _resetState(state, namespace) {
        if (namespace) {
            state[namespace] = {};
        } else {
            state = {};
        }
        return state;
    }

    var _Tree = function (component, selector, props) {

        var children = {};
        var state = {};
        var tree = undefined;

        function cleanState(state) {
            state = state || {};
            return JSON.parse(JSON.stringify(state));
        }


        this.html = function () {
            return tree;
        };

        this.getSelector = function() {
            return selector;
        };

        this.getState = function () {
            return $.extend(true, {}, state);
        };

        this.setState = function (newState) {
            var _setStateFn = this.setState;
            this.setState = function () {
                throw Error("The state of this component is locked to prevent recursive state changes.");
            };
            state = newState;
            this.render();
            this.setState = _setStateFn;
        };

        this.render = function () {
            var _state = $.extend(true, {}, state);
            var _props = $.extend(true, {}, props);
            var _childTrees = {};
            for (var id in children) {
                _childTrees[id] = children._tree.html();
            }
            var html = component.render(_state, _props, _childTrees);
            if (html === undefined) {
                throw new Error("Need at least one HTML string as return value from render() to render Component.");
            }
            var targetElement = $(selector);
            var newTree = undefined;
            var hs;
            parser(html, function (err, hscript) {
                hs = hscript;
                newTree = eval(hscript);
            });
            while (!newTree) {
            }
            if (tree === undefined) {
                targetElement.each(function () {
                    var node = VirtualDOM.create(newTree);
                    var id = $(this).prop('id');
                    if (!_.isEmpty(id)) {
                        node.id = id;
                    }
                    $(this).replaceWith(node);
                    if (_.isFunction(component.onRenderReady)) {
                        _.bind(component.onRenderReady, component)("create", this);
                    }
                });
            } else if (targetElement) {
                targetElement.each(function () {
                    var patches = VirtualDOM.diff(tree, newTree);
                    VirtualDOM.patch(this, patches);
                    if (_.isFunction(component.onRenderReady)) {
                        _.bind(component.onRenderReady, component)("update", this);
                    }
                });
            }
            tree = newTree;
            return tree;
        };

        /**
         * Adds a child component to the tree. If "id" is omitted a new automatic id is created.
         * @param child
         * @param id
         * @returns {*|number} the id of the component.
         * @throws Throws an error if "child" is not a component.
         */
        this.addChild = function (child, id) {
            if (id === undefined) {
                id = ID++;
                while (children[id]) {
                    id++;
                }
            }
            if (!isComponent(child)) {
                throw new Error("Unable to add " + JSON.stringify(child) + " as child component: Not a Component object.");
            }
            children[id] = child;
            return id;
        };

        /**
         * Removes a child component.
         * @param id
         * @returns {*}
         */
        this.removeChild = function (id) {
            var child = children[id];
            if (!child) {
                return null;
            }
            delete children[id];
            return child;
        };

        /**
         * Removes all child components from the component.
         *
         * @param id
         */
        this.removeAllChildren = function (id) {
            children = {};
        };

        /**
         * Performs duck type check of 'obj' for Component interface. Components must have a "_tree" property
         * which has methods "render", "html" and "setState".
         * @param obj
         * @returns {boolean}
         */
        function isComponent(obj) {
            if (!obj) return false;
            if (!obj._tree) return false;
            if (!obj._tree.render || !(typeof obj._tree.render === 'function')) return false;
            if (!obj._tree.setState || !(typeof obj._tree.setState === 'function')) return false;
            if (!obj._tree.html || !(typeof obj._tree.html === 'function')) return false;
            return true;
        }

    };

    function Component(selector, props) {
        if (_.isEmpty(selector)) {
            throw new Error("Need a DOM element selector to render Component.");
        }
        this._tree = new _Tree(this, selector, props || {});
        this.subscriptions = {};
        this.state = {};
    }

    return Component;

});
