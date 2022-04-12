 
export function addEvent(dom,eventType,listener){
    eventType=eventType.toLowerCase(); 
 
    let eventStore=dom.eventStore||(dom.eventStore={}); 

    eventStore[eventType]=listener;  
 
    document.addEventListener(eventType.slice(2),dispatchEvent,false);
}

let syntheticEvent; 

class SyntheticEvent{
    constructor(nativeEvent){
        this.nativeEvent=nativeEvent;
    }
    persist(){
        syntheticEvent=new SyntheticEvent(this.nativeEvent) 
    }
}

function createSyntheticEvent(nativeEvent){
    if(!syntheticEvent){
        syntheticEvent=new SyntheticEvent(nativeEvent); 
    } 
    for(let key in nativeEvent){
        if(typeof nativeEvent[key]==='function'){
            syntheticEvent[key]=nativeEvent[key].bind(nativeEvent);
        }else{
            syntheticEvent[key]=nativeEvent[key];
        }
    } 
    return syntheticEvent;
}

function dispatchEvent(event){ 

    let { type,target }=event; 

    let eventType='on'+type;  

    syntheticEvent=createSyntheticEvent(event); 

    while(target){ 
        let { eventStore }=target;
        let listener=eventStore && eventStore[eventType];
        if(listener){  
            syntheticEvent.currentTarget=target;
            listener.call(target,syntheticEvent);
        }
        target=target.parentNode;
    }
    for(let key in syntheticEvent){
        syntheticEvent[key]=null;
    }
}