import {  CLASS_COMPONENT, ELEMENT, FUNCTION_COMPONENT } from '../react/constances'
import {  setProps,toArray,flatten } from '../react/utils'

function createRoot(container){
    return {
        render:function(element){
            let dom=createDOM(element); 
            container.appendChild(dom);
        }
    }
}

function createDOM(element){ 
    const { $$typeof }=element;
    let dom=null; 
    if(!$$typeof){
        dom=document.createTextNode(element);
    }else if($$typeof == ELEMENT){  
        dom=createNativeDOM(element)
    }else if($$typeof == CLASS_COMPONENT){
        dom=createClassComponentDOM(element)
    }else if($$typeof == FUNCTION_COMPONENT){
        dom=createFunctionComponentDOM(element)
    }
    return dom;
}

function createClassComponentDOM(element){
    let { type,props }=element;
    //创建一个组件的实例
    let componentInstance=new type(props);
    //当创建类组件实例后，会在类组件的虚拟DOM对象上添添一个属性componentInstance
    //以后组件的运行当中componentIntance是不变的
    element.componentInstance=componentInstance;
    let renderElement=componentInstance.render();
    //在类组件实例上添加renderElement指向上一次要渲染的虚拟DOM节点
    //因为后面组件更新的时候我们会重新render,然后跟上一次的renderElement进行dom-diff
    componentInstance.renderElement=renderElement;
    let newDOM=createDOM(renderElement);
    renderElement.dom=newDOM;
    return newDOM;
}

function createFunctionComponentDOM(element){
    let { type,props }=element;
    //返回要渲染的react元素
    let renderElement = type(props);
    element.renderElement=renderElement;
    let newDOM=createDOM(renderElement);
    //我们从虚拟domreact元素创建出真实dom
    //创建出来以后会把真实dom创建到虚拟dom的dom属性上
    //虚拟dom的dom属性指向他创建出来的真实dom
    renderElement.dom=newDOM;
    //
    return newDOM;
}

function createNativeDOM(element){ 
    let { type,props }=element; 
    let dom=document.createElement(type);  
    createNativeDOMChildren(dom,element.props.children); 
    setProps(dom,props);
    return dom
}
 
function createNativeDOMChildren(parentNode,children){  
    children && flatten(toArray(children)).forEach((child,index)=>{ 
        //child是虚拟dom 我们会在虚拟dom上加一个属性_mountIndex,指向所在索引
        //在后面我们做dom-diff的时候会变得很重要
        // child._mountIndex=index;
        let childDOM=createDOM(child);
        parentNode.appendChild(childDOM);
    });
}

export { createRoot }