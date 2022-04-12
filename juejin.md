# 为啥需要学习源码？

学习React底层源码到底有什么用？个人觉得最大的作用是```1.看/解决问题的思维方式2.面试官的提问。```如果你看不下去源码，那么可以和我一起写一个mini-react，所谓“麻雀虽小，五脏俱全”，亲手实现了React的所有功能，你还怕回答不出来面试官的问题吗？
 
我们使用cra创建一个React项目。cra现在默认创建的React项目已经是React18了。我们可以一起来实现React18的所有功能（无法保证和源码保持一致，但是我们可以实现React18的大部分功能）。

> react18将渲染节点的render方法改为了createRoot方法。

```js 
//src/index.js
import { createRoot } from 'react-dom/client';

const element=(
    <div>hello world</div>
);

const root=createRoot(document.getElementById('root'));

root.render(element);
```

以上代码在浏览器中渲染了hello world

接下来我们一步一步的带大家实现React18的所有功能。如果大家有哪个环节不清晰，欢迎在评论区留下你们的声音。

# jsx Api

- 17前 vs 17后

在React17之前，开发者需要手动引入React，React配合Babel插件自动将Jsx语法转化为React.createElement。 
在React17以后，开发者无需手动引入React，其配合的Babel就会自动导入其react/jsx-runtime中的jsx函数，并将Jsx语法转化为_jsx包裹的函数。

```js
//react17之前
//其中react需要自己手动引入，否则会报错
import React from 'react';

const element=(<div>hello world</div>) => babel转码后：React.createElement('div',null,'hello world')

//react17之后
//react/jsx-runtime无需手动引入，babel自动导入
import { jsx as _jsx } from 'react/jsx-runtime';

const element=(<div>hello world</div>) => babel转码后：_jsx('div',null,'hello world')
``` 

> 转化是在编译过程中执行的，开发者不用单独进行处理。

> 有的面试官会问你为啥在组件里面需要使用```import React from 'react'```,原因就是为了考察你的JSX相关基础知识（React17之前）。

- 我们一起来实现这个jsx api吧！

在cra的src文件夹新建react、react-dom文件夹，模拟react、react-dom库。

> 由文档可知，jsx的三个参数分别是

1. type：标签名字符串（如'div'、'span'）或者react组件类型（如class组件、函数组件）、react fragment类型。
2. props 即标签上的属性。 
3. children 表示子节点以及其属性（其中第三个参数以后都属于children，故我们结构为数组）。

- 新建constances.js文件

> 向外暴露出一下React类型定义$$typeof进行使用

```js
//src/react/constances.js
export const TEXT=Symbol.for('TEXT');//文本类型 a、b、c
export const ELEMENT=Symbol.for('ELEMENT');//react元素类型 button、div、span
``` 

```js
//src/react/jsx-runtime.js
import { TEXT, ELEMENT } from './constances';
import { ReactElement } from './element';

function jsx(type, config, ...children) { 
    //将key、ref和其他属性从props中解构出来
    let { key, ref=null, ...props } = config || {};
    //$$typeof 标识是什么类型的组件 后续会使用到
    let $$typeof = null;
    //type为字符串 表示一个原生dom元素标签 如span、div
    if (typeof type === 'string') {
        $$typeof = ELEMENT;//是一个原生的DOM类型
    } 
    //将children赋值给props的children属性 
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

```

```js
//src/react/element.js
//该函数的作用只有一个 就是返回element
function ReactElement($$typeof,type,key,ref,props){
    let element={
        $$typeof,type,key,ref,props
    }
    return element;
}
```

我们试验一下可不可以使用:如下代码完全可用，在浏览器成功渲染出来了hello world。jsx API我们大概已经完成了。

```js
import { createRoot } from 'react-dom/client';
import { jsx as _jsx } from './react/jsx-runtime';

// const element=(
//     <div>hello world</div>
// );

const element=_jsx('div',null,'hello world'); 

const root=createRoot(document.getElementById('root'));

root.render(element);
```

# createRoot API

在react 18之前我们是使用的react-dom导出的render方法进行渲染，在18之后，我们使用了react-dom/client包中的createRoot 方法进行渲染。

```js
//r18之前
import ReactDOM from 'react-dom';

ReactDOM.render(dom,container);
//r18之后
import { createRoot } from 'react-dom/client';

const root=createRoot(container);

root.render(element);
```

上节我们实现了jsx FUNC计算出了jsx转化后的结果，这节课我们就实现最简单的渲染方法createRoot。

```js
//react-dom/client
//由上面demo可知createRoot的第一个参数是container，而其第返回值对象上的render方法第一个参数是需要挂在的react元素对象，所以可以得出下面的代码
function createRoot(container){
    return {
        render:function(element){
            //1.将虚拟dom转化为真实dom
            let dom=createDOM(element);
            //2.将真实dom挂载到container上
            //这个方法的最后一步是将生成好的真实dom挂载到container上面
            container.appendChild(dom);
        }
    }
}
//react-dom/client
//根据element创建dom的方法（暂时只支持原生dom/数字/字符串等）
function createDOM(element){ 
    const { $$typeof }=element;
    let dom=null;
    //没有说明可能是一个文本节点 比如字符串或者数字
    if(!$$typeof){
        dom=document.createTextNode(element);
    }else if($$typeof == ELEMENT){ 
        //如果此虚拟dom是一个原生dom节点
        dom=createNativeDOM(element)
    }
    return dom;
} 
//react-dom/client
//创建原生dom的方法
function createNativeDOM(element){ 
    let { type,props }=element;//span button div
    let dom=document.createElement(type);//真实的button dom对象
    //1. 创建此虚拟dom节点的子节点
    createNativeDOMChildren(dom,element.props.children);
    //2. 给此DOM元素添加属性
    setProps(dom,props);
    return dom
}
//react-dom/client
function createNativeDOMChildren(parentNode,children){ 
    //flat(infinity)可以将不是父子层级的children打平
    children && toArray(children).flat(Infinity).forEach(child=>{
        //创建子虚拟节点的真实dom元素
        let childDOM=createDOM(child);
        parentNode.appendChild(childDOM);
    });
}
//react/utils
function setProp(dom,key,value){
    if(/^on/.test(key)){//如果属性名是以on开头的说明要绑定事件
        dom[key.toLowerCase()]=value;
    }else if(key==='style'){
        for(let styleName in value){
            dom.style[styleName]=value[styleName];
        }
    }else{
        dom.setAttribute(key,value);
    }
}
//react/utils
//兼容真实react元素
export function toArray(obj){
    return Array.isArray(obj)?obj:[obj];
}
```

- 流程图如下

内部在创建children的过程中采用了递归创建节点的调用方式。如下调用方式click事件、id、style等方式都可以生效

```js
import { createRoot } from './react-dom/client';
import { jsx as _jsx } from './react/jsx-runtime';

// const element=1; 
const element=(
    <div>
        <button onClick={()=>alert('测试')}>测试</button>
        <span style={{color:'red'}} id="hello">hello world</span>
    </div>
)

// const element=_jsx('div',null,_jsx('button',{
//     onClick:()=>alert('测试')
// },'测试'),_jsx('span',{style:{color:'red'},id:'hello'},'hello world'));  
  
const root=createRoot(document.getElementById('root'));

root.render(element);
```

# 合成事件

在上节课中，我们绑定事件是直接将事件绑定在了dom元素上，但是在React中我们并不是要把事件绑定在DOM节点上，而绑定到document上，类似于事件委托。

- React为什么要采用合成事件呢？

1. 因为合成事件可以屏蔽浏览器的差异，不同浏览器绑定事件和触发事件的方法不一样。

```js
//大部分浏览器
obj.addEventListener(event,callback,false)
//IE8及以下
obj.attachEvent('on'+event,callback)
```

2. 合成事件可以实现事件对象的复用，重用，减少垃圾回收，提高性能。

3. 因为默认需要实现批量更新，2个setState会合并成一次更新，需要合成事件里面实现。


- 编写合成事件方法

新建event.js文件

```js
//src/react/utils
function setProp(dom,key,value){
    //....
    if(/^on/.test(key)){//如果属性名是以on开头的说明要绑定事件
        //dom[key]=value
        //将直接绑定在dom上的事件替换成下面的方法
        addEvent(dom,key,value) 
    }else if(key==='style'){
    //....
}
```

- addEvent方法

1. 在React中并不是把事件绑在要绑定的DOM节点上，而绑定到document类似于事件委托。
2. dom为要绑定事件的dom节点，eventType表示要绑定的事件类型，listener事件处理函数

```js
//src/react/event.js 
export function addEvent(dom,eventType,listener){
    //addEventListener方法中的event参数没有'on'
    eventType=eventType.toLowerCase().slice(2);//onClick=>click
    //在要绑定的DOM节点上挂载一个对象，准备存放监听函数
    let eventStore=dom.eventStore||(dom.eventStore={});
    //eventStore.onclick=()=>alert('hello');
    //因为事件监听都是挂载到document对象上，为了区分点击时的应该调用哪个listener回调事件
    eventStore[eventType]=listener;  
    //增加监听
    document.addEventListener(eventType,dispatchEvent,false);
} 
```

- 编写dispatchEvent方法

1. 真正事件触发的统一是这个dispatchEvent方法
2. event是原生的事件对象，但是传递给我们监听函数的不是它而是合成事件对象syntheticEvent

```js
//src/react/event.js 
function dispatchEvent(event){ 
    let { type,target }=event;//type=click target=button
    let eventType='on'+type;//onclick
    let syntheticEvent;
    //模拟事件冒泡
    while(target){
        let { eventStore }=target;
        let listener=eventStore && eventStore[eventType];
        if(listener){
            if(!syntheticEvent){
                syntheticEvent=createSyntheticEvent(event);
                syntheticEvent.currentTarget=target;
                listener.call(target,syntheticEvent)
            }
        }
        target=target.parentNode;
    }
}
```

使用document监听事件的触发，当被触发元素没有事件绑定，就会接着找他的父节点来模拟事件冒泡的功能。

- 合成事件对象

当dispatchEvent函数触发时，每一次都会创建一个syntheticEvent对象，并将真正触发的事件的元素放到合成事件syntheticEvent的currentTarget属性上，然后将合成事件传递给设置的监听函数上。

1.  createSyntheticEvent把原生事件对象上的方法和属性都拷贝到了合成事件对象上

```js
//src/react/event.js 
function createSyntheticEvent(nativeEvent){
    let syntheticEvent=new SyntheticEvent(nativeEvent);
   
    for(let key in nativeEvent){
        if(typeof nativeEvent[key]==='function'){
            syntheticEvent[key]=nativeEvent[key].bind(nativeEvent);
        }else{
            syntheticEvent[key]=nativeEvent[key];
        }
    }
    return syntheticEvent;
}
```

2. SyntheticEvent类

合成对象是SyntheticEvent类的实例

```js
//src/react/event.js 
class SyntheticEvent{
    constructor(nativeEvent){
        this.nativeEvent=nativeEvent;
    }
}
```

- 清除事件对象

在react中，每当回调函数执行完以后，就会清空合成事件对象，我们将syntheticEvent从函数中提出来变成全局变量，每当函数执行完以后清除合成事件，

```js
//src/react/event.js 
let syntheticEvent; 
function dispatchEvent(event){ 
    let { type,target }=event; 
    let eventType='on'+type;  
    while(target){
        let { eventStore }=target;
        let listener=eventStore && eventStore[eventType];
        if(listener){
            if(!syntheticEvent){
                syntheticEvent=createSyntheticEvent(event); 
            }
            syntheticEvent.currentTarget=target;
            listener.call(target,syntheticEvent)
        }
        target=target.parentNode;
    }
    //当函数执行完以后清除合成事件函数
    for(let key in syntheticEvent){ 
        syntheticEvent[key]=null;
    }
}
```

- 关于持久化

在react17以前，合成事件对象一直以来有个bug就是在异步的过程中无法获取到event对象，如下：

```js 
const handleClick=(e)=>{
    //可以获取到event对象
    console.log(e,"==handleClick==") 
    setInterval(()=>{
        //无法获取到event对象
        console.log(e,"==handleClick==") 
    },10000)
}
```

那么具体原因是什么呢？回顾我们上节课中的代码，我们在执行完回调以后，直接就将event对象上的属性变成了null，所以在异步环境下无法获取到完整属性的合成事件对象。

官方提供了一个persist()方法来实现持久化，即如果执行persist方法，event对象上的属性就不会被重置。那么具体是如何实现的呢？

我们改造一下，将创建合成事件对象的方法放到函数里面：

```js
//src/react/event.js 
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
//src/react/event.js 
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
//src/react/event.js 
let syntheticEvent; 

class SyntheticEvent{
    constructor(nativeEvent){
        this.nativeEvent=nativeEvent;
    }
    persist(){
        syntheticEvent=new SyntheticEvent(this.nativeEvent) 
    }
}
```

在合成对象类中增加persist方法，这个方法其实很简单，就是将全局对象syntheticEvent指向了一个新的对象。

- 持久化的原理

在用户调用持久话方法persist以后，将全局的syntheticEvent合成事件对象重新赋值，让其指向一个新的对象这事再后面清除属性的时候就清除的是新创建赋值的对象，之前传递给监听函数的事件对象就不会被清除。

这个其实理解起来有点抽象，可以理解为将一个引用类型重新赋予了新的内存，之前的内存不会被销毁。

所以这也注定了经常调用persist，会使过多的对象无法被销毁，可能会造成内存泄漏。

- 如何避免内存泄漏

如上所说，使用persist会导致内存泄漏，那么应该如何避免呢？可以这样：

```js
const handleClick=(e)=>{
    console.log(e.target,e.currentTarget,"==handleClick==")
    e.persist();
    setInterval(()=>{
        console.log(e)
        //将事件对象变成null 即可被垃圾回收
        e=null;
    },1000)
}
```

# 如何渲染类组件

之前我们只成功渲染出了普通dom元素和数字，字符串等，现在我们补充一下渲染类组件。