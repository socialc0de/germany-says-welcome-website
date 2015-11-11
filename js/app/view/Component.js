define(function(require) {

    var $ = require('jquery');
    var bs = require('bootstrap');

    var parser = require('html2hscript');
    var VirtualDOM = require('virtual-dom');

    var h = VirtualDOM.h;

    var ID = 1;

    Component.prototype.render = function(state, props, children) {
        return '<div></div>';
    };

    Component.prototype.subscribe = function(hoverboard, namespace) {
        var setter = function(state) {
            this.setState(state, namespace);
        };
        return hoverboard.getState($.proxy(setter, this));
    };

    Component.prototype.setState = function(newState, namespace) {
        _mergeStates(this.state, newState, namespace);
        this._tree.render(this.state);
    };

    Component.prototype.replaceState = function(namespace, newState) {
        _resetState(this.state, namespace);
        _mergeStates(this.state, newState, namespace);
        this._tree.render(this.state);
    };

    Component.prototype.resetState = function(namespace) {
        _resetState(this.state, namespace);
        _mergeStates(this.state, {}, namespace);
        this._tree.render(this.state);
    };

    function _mergeStates(state, newState, namespace) {
        if ( namespace ) {
            if ( !state[namespace] ) {
                state[namespace] = {};
            }
            $.extend(state[namespace], newState);
        } else {
            $.extend(state, newState);
        }
        return state;
    }

    function _resetState(state, namespace) {
        if ( namespace ) {
            state[namespace] = {};
        } else {
            state = {};
        }
        return state;
    }

    var _Tree = function(component, props) {

        var children = {};
        var state = {};
        var tree = undefined;


        this.html = function() {
            return tree;
        };

        this.render = function(state) {
            var _state = $.extend(true, {}, state);
            var _props = $.extend(true, {}, props);
            var _childTrees = {};
            for ( var id in children ) {
                _childTrees[id] = children._tree.html();
            }
            var values = component.render(_state, _props, _childTrees);
            var html = undefined;
            var selector = undefined;
            var callback = undefined;
            for ( var i=0; i<values.length; i++ ) {
                var val = values[i];
                if ( typeof val === 'function' && callback === undefined ) {
                    callback = val;
                    continue;
                }
                if ( typeof val === 'string' && html === undefined ) {
                    html = val;
                    continue;
                }
                if ( selector === undefined ) {
                    selector = val;
                    continue;
                }
            }
            if ( html === undefined ) {
                throw new Error("Need at least one HTML string as return value from render() to render Component.");
            }
            var targetElement = selector ? $(selector) : undefined;
            var newTree = undefined;
            var hs;
            parser(html, function(err, hscript) {
                hs = hscript;
                newTree = eval(hscript);
            });
            while (!newTree) {}
            var event = 'update';
            if ( tree === undefined ) {
                event = 'create';
                var node = VirtualDOM.create(newTree);
                if ( targetElement ) {
                    var id = $(targetElement).prop('id');
                    node.id = id;
                    $(targetElement).replaceWith(node);
                }
            } else if (targetElement) {
                var patches = VirtualDOM.diff(tree, newTree);
                var domNode = $(targetElement).get(0);
                if ( domNode !== undefined ) {
                    VirtualDOM.patch(domNode, patches);
                }
            }
            if ( callback !== undefined ) {
                callback(event)
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
        this.addChild = function(child, id) {
            if ( id === undefined ) {
                id = ID++;
                while ( children[id] ) { id++; }
            }
            if ( !isComponent(child) ) {
                throw new Error("Unable to add " +  JSON.stringify(child) + " as child component: Not a Component object.");
            }
            children[id] = child;
            return id;
        };

        this.removeChild = function(id) {
            var child = children[id];
            if ( !child ) { return null; }
            delete children[id];
            return child;
        };

        this.removeAllChildren = function(id) {
            children = {};
        };

        /**
         * Performs duck type check of 'obj' for Component interface. Components must have a "_tree" property
         * which has methods "render", "html" and "setState".
         * @param obj
         * @returns {boolean}
         */
        function isComponent(obj) {
            if ( !obj ) return false;
            if ( !obj._tree ) return false;
            if ( !obj._tree.render || !(typeof obj._tree.render === 'function') ) return false;
            if ( !obj._tree.setState || !(typeof obj._tree.setState === 'function') ) return false;
            if ( !obj._tree.html || !(typeof obj._tree.html === 'function') ) return false;
            return true;
        }

    };

    function Component(props) {
        this._tree = new _Tree(this, props || {});
        this.subscriptions = {};
        this.state = {};
    }

    return Component;

});
