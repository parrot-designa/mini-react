import { TEXT, ELEMENT, CLASS_COMPONENT, FUNCTION_COMPONENT } from './constances';
import { ReactElement } from './element';

function jsx(type, config, ...children) {  
    let { key, ref=null, ...props } = config || {}; 
    let $$typeof = null; 
    if (typeof type === 'string') {
        $$typeof = ELEMENT; 
    //说明这个类型是一个类组件
    }else if(typeof type === 'function' && type.prototype.isReactComponent){
        $$typeof = CLASS_COMPONENT; 
    }else if(typeof type==='function'){
        $$typeof = FUNCTION_COMPONENT;
    }
    props.children=children
    return ReactElement(
        $$typeof,
        type,
        key,
        ref,
        props
    );
}


export {
    jsx
}

 