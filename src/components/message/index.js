
import Vue from 'vue'
import messageComponent from './index.vue'


const messageConstructor = Vue.extend(messageComponent)
let instances = []
let seed = 1
function messageFun(obj) {
    let { message, type, duration,message_obj,isLink } = obj
    const messageDom = new messageConstructor({
        el: document.createElement('div'),
        data() {
            return {
                message: message,
                type: type,
                message_obj:message_obj,
                isLink:isLink
            }
        },
       
        
    })
    let id = 'my_message_' + seed++
    let styleTop = 108

    document.body.appendChild(messageDom.$el)
    //<a class="close" @click="handleAfterLeave"></a>
    messageDom.id = id
    instances.forEach(item => {
        //styleTop += item.$el.offsetHeight + 16;
        styleTop += item.$el.offsetHeight + 16;
    })
    messageDom.styleTop = styleTop
    messageDom.messageShow()
    instances.push(messageDom)
    // hide after duration time
    duration = duration ? duration : 3000
    setTimeout(() => {
        let len = instances.length
        messageDom.messageHide()
        let removedHeight = messageDom.$el.offsetHeight;
        let index = instances.findIndex(e => e.id === messageDom.id)
        if (len > 1) {
            for (let i = index; i < len; i++) {
                try{
                let dom = instances[i].$el;
                dom.style['top'] =
                    parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px'
                }  
                catch(error){

                }
            }
        }
        instances.splice(index, 1)
    }, duration)

    messageDom.close_message = (dom) =>{
        let len = instances.length
        messageDom.messageHide()
        let removedHeight =messageDom.$el.offsetHeight;
        let index = instances.findIndex(e => e.id === messageDom.id)
        if (len > 1) {
            for (let i = index; i < len; i++) {
                try{
                let dom = instances[i].$el
                 //console.log(parseInt(dom.style['top'], 10))
                 dom.style['top'] =  parseInt(dom.style['top'], 10) - removedHeight - 16 + 'px'
                }
                catch(error){

                }
             
               
            }
        }

        instances.splice(index, 1)
     
    }
   
}



function message() {
    window.$message = Vue.prototype.$message = messageFun
}
export default message