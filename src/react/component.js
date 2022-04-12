class Component{
    constructor(props){
        this.props=props;
    }
}
//函数组件编译之后也是函数，通过此属性来区分是函数组件还是类组件
Component.prototype.isReactComponent={};

export {
    Component
}