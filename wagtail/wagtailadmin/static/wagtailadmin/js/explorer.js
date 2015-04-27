import React from 'react';
import EventEmitter from 'events';


var Card = React.createClass({
    render() {
        var data = this.props.data;
        var active = this.props.store.getActive();
        var isActive = active.indexOf(data) > -1;

        var classes = ['explorer-card'];

        if (isActive) {
            classes.push('-active');
        }

        return (
            <div className={classes.join(' ')} onClick={this.props.clickHandler}>
                <a className='explorer-card-heading icon icon-folder-open-inverse' href="#">
                    {data.title}
                    <StatusIndicator data={data} />
                </a>
                    <span className='icon icon-arrow-right'></span>
            </div>
        );
    }
});


var Node = React.createClass({
    selectNode(item) {
        this.props.store.addActive(item);
    },
    render() {
        const { data } = this.props;
        var children = [];

        if (data.children) {
            children = data.children.map(function(item, index) {
                return (
                    <Card store={this.props.store} key={index} data={item} clickHandler={this.selectNode.bind(this, item)} />
                );
            }, this);
        }

        return (
            <div className='explorer-node'>
                {children}
            </div>
        );
    }
});

var ColumnView = React.createClass({
    render() {
        var children = this.props.data.map(function(item, index) {
            return <Node data={item} key={index} store={this.props.store} />
        }, this);

        return (
            <div className='explorer-column-view'>
                {children}
            </div>
        );
    }
});




var StatusIndicator = React.createClass({
    render() {
        var data = this.props.data;
        var badgeClass = ['badge'];
        badgeClass.push('badge-' + data.status);

        if (data.status === "live") {
            return <span></span>
        }

        return (
            <span className={badgeClass.join(' ')}>
                {data.status}
            </span>
        )
    }
});


var TreeView = React.createClass({
    getInitialState() {
        var collapsed = true;

        if (typeof(this.props.collapsed) !== "undefined") {
            collapsed = this.props.collapsed;
        }

        if (typeof(this.props.data.collapsed) !== "undefined") {
            collapsed = this.props.data.collapsed;
        }

        return {
            collapsed: collapsed
        }
    },
    handleUserInteraction() {
        var collapsed = this.props.data.collapsed;
        var item = this.props.data;

        if (typeof(collapsed) === 'undefined') {
            collapsed = true;
        }

        item.collapsed = !collapsed;
        this.props.store.addActive(item);
    },
    handleActions() {

    },
    render() {
        var data = this.props.data;
        var collapsed = this.props.data.collapsed;
        var classes = ['icon', 'explorer-treeview-icon'];

        if (typeof(this.props.data.collapsed) === 'undefined') {
            collapsed = true;
        }

        var childNodes = data.children.map(function(item, index) {
            return <TreeView data={item} key={index} store={this.props.store} />
        }, this);

        // It's the rootnode, so just print the children
        if (!data.parent) {
            return (
                <div>
                    {childNodes}
                </div>
            );
        }

        if (collapsed) {
            classes.push('icon-folder-inverse');
        } else {
            classes.push('icon-folder-open-inverse');
        }

        return (
            <div className='explorer-treeview'>
                <p>
                    <span className={classes.join(' ')} onClick={this.handleUserInteraction}></span>
                    <span onClick={this.handleActions}>
                        {data.title}
                    </span>
                    <StatusIndicator data={data} />
                </p>
                {data.children && !collapsed ? childNodes : null}
            </div>
        );
    }
});




var Explorer = React.createClass({
    getInitialState() {
        return {
            store: [],
            active: [],
            explorerState: {}
        }
    },
    componentDidMount() {
        const { store } = this.props;

        store.on('change', function(data) {
            this.setState({
                store: store.getAll(),
                active: store.getActive(),
                explorerState: store.getState()
            });
        }.bind(this));
    },
    setActive(item){
        this.props.store.addActive(item);
    },
    setViewColumn() {
        this.props.store.setViewType("ColumnView");
    },
    setViewTree() {
        this.props.store.setViewType("TreeView");
    },
    render() {
        const { store, active, explorerState } = this.state;

        if (!explorerState.isActive) {
            return (<span />);
        }


        var breadcrumb = active.map(function(item, index) {
            const title = item.title;

            var el = <span onClick={this.setActive.bind(this, item)}>{title}</span>

            if (index === 0) {
                el = <span className='icon icon-home'></span>
            }

            return (
                <span key={index}>
                    {el}
                    <span className='icon icon-arrow-right'></span>
                </span>
            );
        }, this);

        var element;

        switch (explorerState.viewType) {
            case "TreeView":
                element = React.createElement(TreeView, {
                    data: this.props.store.data,
                    store: this.props.store,
                    collapsed: false
                });
                break;
            case "ColumnView":
            default:
                element = React.createElement(ColumnView, {
                    data: active,
                    store: this.props.store
                });

                break;
        }

        return (<div className='explorer-ui clearfix'>
                <div className='explorer-pathbar'>
                    {breadcrumb}
                </div>
                <div className='explorer-header clearfix'>
                    <h2>Explorer</h2>
                    <span className='explorer-toggle'>
                        <span onClick={this.setViewColumn}>ColumnView</span>
                        <span onClick={this.setViewTree}>TreeView</span>
                    </span>
                </div>

                <div className='explorer-wrapper'>
                    <div className='explorer-overlay'>
                        {element}
                    </div>
                </div>
            </div>
        );
    }
});









class Store extends EventEmitter {
    constructor() {
        super()
        this.data = [];
        this.viewType = "ColumnView";
    }
    fetch(url) {
        this.url = url;

        function addParentReferences(node) {
            if (node.children) {
                node.children = node.children.map(function(item) {
                    item.parent = node;
                    return addParentReferences(item);
                });
            }
            return node;
        }

        $.get(url, function(result) {
            this.data = addParentReferences(result);
            this.active = [ this.data ];
            this.emit('change');
        }.bind(this));
    }
    getAll() {
        return this.data.nodes || [];
    }
    getActive() {
        return this.active || [];
    }
    getState() {
        return {
            isActive: this.isActive,
            viewType: this.viewType
        }
    }

    getPathFor(node) {
        var path = [node];
        function getParentNode(item) {
            if (item.parent) {
                path.push(item.parent);
                getParentNode(item.parent);
            }
        }
        getParentNode(node);
        return path.reverse();
    }

    setViewType(str) {
        this.viewType = str;
        this.emit('change');
    }

    addActive(item) {
        var index = this.active.indexOf(item);
        this.active = this.getPathFor(item);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        this.emit('change');
    }
    closeMenu() {
        this.isActive = false;
        this.emit('change');
    }
    showMenu() {
        this.isActive = true;
        this.emit('change');
    }
    toggleMenu() {
        this.isActive = !this.isActive;
        this.emit('change');
    }
}

function init(e) {
    var container = document.querySelector('.content-wrapper');
    var mount = document.createElement('div');
    var button = document.querySelector('[data-explorer-menu-url]');
    var url = button.dataset.explorerMenuUrl;
    var store = new Store();
    container.parentNode.appendChild(mount);

    const KEY_ESC = 27;

    document.addEventListener('keydown', function(e) {
        if (e.keyCode == KEY_ESC) {
            store.closeMenu();
        }
    });

    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!mount.childNodes.length) {
            React.render(React.createElement(Explorer, {
                store: store
            }), mount);
        }

        store.fetch(url);
        store.toggleMenu();
    });

}

document.addEventListener('DOMContentLoaded', init, false);
