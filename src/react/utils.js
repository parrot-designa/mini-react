
import { addEvent } from './event';
 
export function onlyOne(obj){
    return Array.isArray(obj)?obj[0]:obj;
}
 
export function setProps(dom,props){
    for(let key in props){
        if(key != 'children'){
            let value=props[key];
            setProp(dom,key,value);
        }
    }
}

function setProp(dom,key,value){
    if(/^on/.test(key)){ 
        addEvent(dom,key,value) 
    }else if(key==='style'){
        for(let styleName in value){
            dom.style[styleName]=value[styleName];
        }
    }else if(key==='className'){
        let classes=value.split(' ');
        dom.classList.add(value) 
    }else{
        dom.setAttribute(key,value);
    }
}

export function toArray(obj){
    return Array.isArray(obj)?obj:[obj];
}

//展开一个数组
export function flatten(array){
    let flatten = [];
    (function(array){
        array.forEach(item=>{
            if(Array.isArray(item)){
                flatten(array);
            }else{
                flatten.push(item);
            }
        })
    })(array)
    return flatten;
}