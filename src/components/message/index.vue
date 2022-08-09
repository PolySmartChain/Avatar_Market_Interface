<template>
  <transition name="msgbox-fade" @after-leave="handleAfterLeave">
    <div
      :class="[
        'message_wrapper',
        { success: type === 'success' },
        { warning: type === 'warning' },
        { error: type === 'error' },
        { info: type === 'info' },
      ]"
      v-show="visible"
      :style="{ top: styleTop + 'px' }"
    >
      <div class="pic">
        <img :src="message_obj.img" v-if="message_obj.img" />
      </div>
      <div class="messageBox">
        <div>
          <p class="message-title">{{ message }}</p>
          <p class="ptext" v-if="message_obj.tokenID">
            TokenId:#{{ message_obj.tokenID }}
          </p>
          <p v-if="isLink">
            <a
              class="transaction_view"
              :href="'https://scan.polysmartchain.com/tx/' + message_obj.txhash"
              target="_blank"
              >{{ view }} &gt&gt</a
            >
          </p>
        </div>
      </div>

      <a class="close" @click="close_message($el)"></a>
    </div>
  </transition>
</template>

<script>
export default {
  name: "message",
  data() {
    return {
      // prompt message text
      message: "",
      // Types
      type: "",
      message_obj: "",
      isLink: false,
      // show/hide
      visible: false,
      // positioning height
      styleTop: 20,
      view: "",
    };
  },
  async mounted() {
    let that = this;
    localStorage.getItem("p_lang_locale") == "zn"
      ? (that.view = "在 PSCscan 上查看")
      : (that.view = "View On PSCscan");
  },
  methods: {
    /**
     * @description: message show
     */
    messageShow() {
      this.visible = true;
    },

    /**
     * @description: message hide
     */
    messageHide() {
      this.visible = false;
    },

    /**
     * @description: destroy component
     */
    handleAfterLeave() {
      this.$destroy(true);
      this.$el.parentNode.removeChild(this.$el);
    },
  },
};
</script>



<style scoped lang="less">
.message_wrapper {
  position: fixed;
  min-width: 380px;
  //left: 50%;
  z-index: 99999;
  color: #fff;
  padding: 15px 15px 15px 20px;
  font-size: 14px;
  top: 104px;
  // transform: translateX(-50%);
  background: rgba(229, 241, 251, 0.8);
  color: #909399;
  //box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  line-height: 1;
  right: 0px;
  height: 136px;
  padding-left: 136px;
  .pic {
    width: 136px;
    height: 136px;
    position: absolute;
    left: 0px;
    top: 0px;
  }
  .pic img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .messageBox {
    width: 260px;
    display: flex;
    display: -webkit-flex;
    display: -moz-flex;
    height: 100%;
    -webkit-box-align: center;
    -moz-align-items: center;
    -webkit-align-items: center;
    align-items: center;
  }
  .messageBox div {
    width: 100%;
    text-align: center;
  }
  i {
    margin-right: 4px;
  }
  .transaction_view {
    font-size: 18px;
    color: #255ea2;
    cursor: pointer;
  }
  p {
    padding: 4px 0;
    line-height: 26px;
  }
  .ptext {
    font-size: 18px;
    color: #23282e;
  }
  .close {
    width: 30px;
    height: 30px;
    position: absolute;
    right: 5px;
    top: 10px;
    background: url(../../assets/img/menu_close.png) center no-repeat;
    cursor: pointer;
  }
}
.message_wrapper.success {
  // background: mix(#ffffff, #67C23A, 90%);
  .pic {
    background: url(../../assets/img/icon_successs.png) center no-repeat
      rgba(66, 175, 177, 0.8);
  }
  color: #42afb1;
  .message-title {
    color: #42afb1;
    font-size: 20px;
  }
}
.message_wrapper.warning {
  //background: mix(#ffffff, #E6A23C, 90%);
  .pic {
    background: url(../../assets/img/icon_warning.png) center no-repeat
      rgba(230, 162, 60, 0.8);
  }
  color: #e6a23c;
}
.message_wrapper.error {
  // background: mix(#ffffff, #F56C6C, 90%);
  color: #d63f3f;
  .pic {
    background: url(../../assets/img/icon_fail.png) center no-repeat
      rgba(214, 63, 63, 0.8);
  }
  .message-title {
    color: #d63f3f;
    font-size: 20px;
  }
}
.message_wrapper.info {
  //background: mix(#ffffff, #909399, 90%);
  color: #909399;
}
.msgbox-fade-enter-active {
  -webkit-animation: msgbox-fade-in 0.3s;
  animation: msgbox-fade-in 0.3s;
}
.msgbox-fade-leave-active {
  -webkit-animation: msgbox-fade-out 0.1s;
  animation: msgbox-fade-out 0.2s;
}
@keyframes msgbox-fade-in {
  0% {
    transform: translate3d(411px, 0px, 0);
    opacity: 0;
  }
  100% {
    transform: translate3d(0px, 0, 0);
    opacity: 1;
  }
}
@keyframes msgbox-fade-out {
  0% {
    transform: translate3d(0px, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(0px, 0px, 0);
    opacity: 0;
  }
}
</style>