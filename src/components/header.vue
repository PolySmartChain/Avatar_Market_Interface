<template>
  <div class="header">
    <div class="header-box flex-def flex-zBetween flex-cCenter">
      <p class="pageTitle">
        <a href="/"> <img src="../assets/img/logo_header.png" alt="" /></a>
      </p>
      <div class="header-right">
        <a class="header_icon_message">
          <img
            v-show="msgAct"
            src="../assets/img/icon_mesage_click.png"
            alt=""
            @click.stop="hideIsFor"
          />
          <img
            v-show="!msgAct"
            src="../assets/img/icon_mesage.png"
            alt=""
            @click.stop="showIsFor"
          />
          <span v-show="info.length != 0">{{ info.length }}</span>
        </a>
        <a class="header_icon_message">
          <img src="../assets/img/potion.png" alt="" @click.stop="toPotion" />
        </a>

        <a class="header_icon_message" @click="transLan">
          <img src="../assets/img/lan.png" />
        </a>

        <a class="header_icon_message market-icon" @click="link_market">
          <img
            v-show="current == 'market'"
            src="../assets/img/market_click.png"
          />
          <img v-show="current != 'market'" src="../assets/img/market.png" />
        </a>
        <a class="header_icon_message list-icon" @click="link_list">
          <img v-show="current == 'list'" src="../assets/img/ava_click.png" />
          <img v-show="current != 'list'" src="../assets/img/ava.png" />
        </a>

        <div class="header-pc">
          <!-- <a class="link-wallet link-text"> connect </a> -->

          <a href="javascript:;" class="market" @click="link_market">
            <img
              v-show="current == 'market'"
              src="../assets/img/market_click.png"
            />
            <img v-show="current != 'market'" src="../assets/img/market.png" />
          </a>
          <a href="javascript:;" class="market" @click="link_list">
            <img v-show="current == 'list'" src="../assets/img/ava_click.png" />
            <img v-show="current != 'list'" src="../assets/img/ava.png" />
          </a>
          <a
            class="link-wallet"
            @click="connectWallet"
            :class="{ 'link-text': myAddress != '' }"
            >{{ myAddress == "" ? $t("connect") : str_Address(myAddress) }}</a
          >
        </div>
        <div class="header-mini">
          <a
            class="a-menu"
            @click="isShow = !isShow"
            :class="{ 'a-menu-close': isShow }"
          >
          </a>
          <ul class="navList" v-if="isShow">
            <li>
              <a class="link" @click="link_list()">{{ $t("personal") }}</a>
            </li>
            <li>
              <el-tooltip
                class="item"
                effect="dark"
                :content="address_copy"
                placement="top"
                v-if="myAddress != ''"
              >
                <a
                  class="link-wallet"
                  v-clipboard:copy="myAddress"
                  v-clipboard:success="onCopy"
                  v-clipboard:error="onError"
                  >{{ str_Address(myAddress) }}</a
                >
              </el-tooltip>
              <a
                class="link-wallet"
                @click="connectWallet"
                v-clipboard:copy="myAddress"
                v-clipboard:success="onCopy"
                v-clipboard:error="onError"
                v-if="myAddress == ''"
                >{{
                  myAddress == "" ? $t("connect") : str_Address(myAddress)
                }}</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <transition name="slide-fade">
      <ul class="header-info-list" v-if="isfor" @click.stop="isfor = true">
        <li class="title">
          <div>{{ $t("Tx.event") }}</div>
          <div>{{ $t("Tx.txid") }}</div>
          <div>{{ $t("Tx.date") }}</div>
          <div>{{ $t("Tx.state") }}</div>
        </li>
        <li v-for="(item, index) in info" :key="index">
          <div class="event">
            {{ $i18n.locale == "en" ? item.method : item.methodcn }}
          </div>
          <div>{{ str_Address(item.hash) }}</div>
          <div>{{ item.time }}</div>
          <div class="state">{{ $t("Tx.pending") }}</div>
        </li>
        <div class="clear-box" @click.stop="cleartx">
          <a href="javascript:;">{{ $t("clear") }}</a>
        </div>
      </ul>
    </transition>
  </div>
</template>

<script>
import { ethers } from "ethers";
import addr from "@/contract/Address.json";
import { getList as getMarketList } from "@/api/apiMarket";
export default {
  props: ["current_route"],
  data() {
    return {
      addr: {},
      provider: {},
      myAddress: "",
      address_copy: "Copy",
      isShow: false,
      info: [],
      isfor: false,
      wallet_timmer: null,
      off_timer: null,
      isLoad: false,
      current: this.current_route,
      msgAct: false,
    };
  },
  async mounted() {
    let that = this;
    that.addr = addr;

    let appDom = document.querySelector("#app");
    if (appDom) {
      appDom.onclick = function () {
        that.hideIsFor();
      };
    }

    if (window.ethereum) {
      try {
        window.ethereum.enable().then((res) => {
          that.myAddress = res[0];
          that.$store.state.myAddress = that.myAddress;
        });

        window.ethereum.on("accountsChanged", (data) => {
          //this.reload();
          window.location.reload();
          if (that.$route && that.$route.name == "asset") {
            that.$router.push({ path: "/list" });
          }
          that.$store.state.myAddress = data[0];
          that.myAddress = data[0];
        });

        window.ethereum.on("chainChanged", (data) => {
          // this.reload();
          that.autoSwitch();
        });
      } catch (e) {
        console.log(e);
      }
      var txArrF = JSON.parse(localStorage.getItem("txArr"));
      // if (txArrF) {
      //   that.info = txArrF;
      //   if (txArrF.length > 0) {
      //     that.isfor = true;
      //   }
      // }

      that.provider = new ethers.providers.Web3Provider(window.ethereum);
      await that.autoSwitch();
      that.wallet_timmer = setInterval(async () => {
        if (that.isLoad == false) {
          that.isLoad = true;
          var txArr = JSON.parse(localStorage.getItem("txArr"));
          if (txArr) {
            for (let i = txArr.length - 1; i >= 0; i--) {
              if (
                txArr[i].method == "Cancellisting" ||
                txArr[i].method == "Buy"
              ) {
                let res;
                switch (txArr[i].method) {
                  case "Cancellisting":
                    res = await getMarketList(
                      "",
                      0,
                      5,
                      0,
                      0,
                      0,
                      txArr[i].data,
                      "",
                      ""
                    );
                    if (res.data.content.length == 0) {
                      let massagestr;
                      that.$i18n.locale == "en"
                        ? (massagestr = "Cancellisting Successful")
                        : (massagestr = "下架成功");
                      that.$message({
                        message: massagestr,
                        type: "success",
                        duration: 5000,
                        message_obj: { txhash: txArr[i].hash },
                        isLink: true,
                      });
                      txArr.splice(i, 1);
                    }
                    break;

                  case "Buy":
                    res = await getMarketList(
                      "",
                      0,
                      5,
                      0,
                      0,
                      0,
                      txArr[i].data,
                      "",
                      ""
                    );
                    if (res.data.content.length == 0) {
                      let massagestr;

                      that.$i18n.locale == "en"
                        ? (massagestr = "Buy Successful")
                        : (massagestr = "購買成功");
                      that.$message({
                        message: massagestr,
                        type: "success",
                        duration: 5000,
                        message_obj: { txhash: txArr[i].hash },
                        isLink: true,
                      });
                      txArr.splice(i, 1);
                    }
                    break;
                }
              } else {
                let result = await that.provider
                  .getTransaction(txArr[i].hash)
                  .then((res) => {
                    return res;
                  })
                  .catch((err) => {
                    return "";
                  });
                if (
                  result !== "" &&
                  result !== null &&
                  result.blockNumber > 0
                ) {
                  let massagestr;
                  switch (txArr[i].method) {
                    case "Claim":
                      that.$i18n.locale == "en"
                        ? (massagestr = "Claim Successful")
                        : (massagestr = "申領成功");

                      break;
                    case "Approve":
                      that.$i18n.locale == "en"
                        ? (massagestr = "Approve Successful")
                        : (massagestr = "批准成功");
                      break;
                    case "Transfer":
                      that.$i18n.locale == "en"
                        ? (massagestr = "Transfer Successful")
                        : (massagestr = "转账成功");
                      break;
                    case "Cancellisting":
                      that.$i18n.locale == "en"
                        ? (massagestr = "Cancellisting Successful")
                        : (massagestr = "下架成功");
                      break;
                    case "Buy":
                      that.$i18n.locale == "en"
                        ? (massagestr = "Buy Successful")
                        : (massagestr = "購買成功");
                      break;
                  }

                  that.$message({
                    message: massagestr,
                    type: "success",
                    duration: 5000,
                    message_obj: { txhash: txArr[i].hash },
                    isLink: true,
                  });
                  txArr.splice(i, 1);
                }
              }
            }

            localStorage.setItem("txArr", JSON.stringify(txArr));
            that.isLoad = false;
            that.info = txArr;
            // if (that.info.length == 0) {
            //   that.isfor = false;
            // }
          } else {
            that.isLoad = false;
            that.info = [];
          }
        }
      }, 3000);
    }
  },
  beforeDestroy() {
    if (this.wallet_timmer != null) {
      clearInterval(this.wallet_timmer);
    }
  },
  destroyed() {
    if (this.wallet_timmer != null) {
      clearInterval(this.wallet_timmer);
    }
  },
  methods: {
    // get_hash_state(hash) {
    //   let that = this;
    //   that.provider = new ethers.providers.Web3Provider(window.ethereum);
    //   that.provider.getTransaction(hash).then((res) => {
    //     if (res != null && res.blockNumber > 0) {
    //     }
    //   });
    // },
    toPotion() {
      window.open(addr.potionAddress, "_blank");
    },
    transLan() {
      let that = this;

      if (
        !localStorage.getItem("p_lang_locale") ||
        localStorage.getItem("p_lang_locale") == "en"
      ) {
        that.$i18n.locale = "zn";
        that.$store.commit("switchLocale", that.$i18n.locale);
        localStorage.setItem("p_lang_locale", "zn");
      } else {
        that.$i18n.locale = "en";
        that.$store.commit("switchLocale", that.$i18n.locale);
        localStorage.setItem("p_lang_locale", "en");
      }
    },
    link_list() {
      let that = this;
      that.$router.push({ path: "/list" });
    },
    link_market() {
      let that = this;
      that.$router.push({ path: "/market" });
    },
    link_mine() {
      let that = this;
      that.$router.push({ path: "/mine" });
    },

    str_Address(address) {
      let str1 = address.slice(0, 4);
      let str2 = address.slice(-4);

      return str1 + "..." + str2;
    },
    connectWallet() {
      let that = this;
      window.ethereum.send("eth_requestAccounts").then((res) => {
        that.myAddress = res.result[0];
        that.$store.state.myAddress = that.myAddress;
      });
    },

    onCopy: function (e) {
      let that = this;
      that.address_copy = "Copied!";

      setTimeout(function () {
        that.address_copy = "Copy";
      }, 1000);
    },
    onError: function (e) {
      let that = this;
      return this.$message({
        message: "Copy failed, please try again later",
        type: "warning",
        duration: 1000,
      });
    },
    decimal(v) {
      const decimals = 18;
      const chars = "0123456789";
      if (v.isZero()) return "0";
      let i = 1;
      let ret = "";
      let base = ethers.utils.bigNumberify(10);
      let allZero = true;
      while (!v.isZero() || i <= decimals) {
        let remainder = v.mod(base);
        v = v.div(base);
        let ch = remainder.toNumber();
        allZero = allZero && ch == 0;
        if (allZero && i <= decimals) {
        } else {
          ret = chars.charAt(ch) + ret;
        }
        if (i == decimals) {
          if (!allZero) {
            ret = "." + ret;
          }
          if (v.isZero()) {
            ret = "0" + ret;
          }
        }
        i++;
      }
      return ret;
    },
    formatNum(num) {
      if (!/^(-|\+)?(\d+)(\.\d+)?$/.test(num)) {
        return num;
      }
      var sign = RegExp.$1;
      var middle = RegExp.$2;
      var decimals = RegExp.$3;
      var reg = /(\d)(\d{3})(,|$)/;
      while (reg.test(middle)) {
        middle = middle.replace(reg, "$1,$2$3");
      }
      return sign + "" + middle + "" + decimals;
    },
    toBigNumber(v) {
      return ethers.utils.bigNumberify(v.toString());
    },
    toNumber(v) {
      var num = new Number(v);
      var arr = num.toLocaleString().split("");
      arr = arr.filter((item) => item != ",");
      var str = arr.join("");
      return str;
    },
    cleartx() {
      let that = this;
      let txArr = [];
      localStorage.setItem("txArr", JSON.stringify(txArr));
      that.info = [];
      that.isfor = false;
      that.msgAct = false;
    },
    async autoSwitch() {
      let that = this;
      that.provider.getNetwork().then(async (data) => {
        if (data.chainId != addr.chainId) {
          await that.setupNetwork();
          return;
        }
      });
    },
    async setupNetwork() {
      const nodes = [addr.MetaAddr];
      const provider = ethereum;
      if (provider) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "psc",
                chainId: `0x${addr.chainId.toString(16)}`,
                rpcUrls: ["https://seed1.polysmartchain.com/"],

                nativeCurrency: {
                  name: "PSC",
                  symbol: "psc",
                  decimals: 18,
                },
              },
            ],
          });

          return true;
        } catch (error) {
          return false;
        }
      } else {
        console.error(
          "Can't setup the psc network on metamask because window.ethereum is undefined"
        );
        return false;
      }
    },
    showIsFor() {
      let that = this;
      that.msgAct = true;
      that.isfor = true;
    },
    hideIsFor() {
      let that = this;
      that.msgAct = false;
      that.isfor = false;
    },
  },
};
</script>

<style scoped lang="less">
@default_color: #e49c23;
@new_color: #e49c23;

.header {
  position: sticky;
  z-index: 99;
  height: 84px;
  width: 100%;
  left: 0px;
  top: 0px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px;
  -webkit-box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px;
  -moz-box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px;
  z-index: 999;
  a {
    user-select: none;
  }
}
.header-box {
  height: 100%;
}
.welcome-header {
  position: fixed;
  width: 100vw;
}
.pageTitle a {
  font-size: 24px;
  color: #172b4d;
  padding: 0 24px;
  cursor: pointer;
}
.link {
  font-size: 18px;
  color: @default_color;
  font-weight: bold;
  cursor: pointer;
  img {
    vertical-align: middle;
  }
}

.header-right {
  padding-right: 24px;
}
.market {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 18px;
  cursor: pointer;
}
.market:nth-child(3) {
  margin-right: 0;
}

.avabox {
  width: 48px;
  height: 48px;
  display: inline-block;
  vertical-align: middle;
  border-radius: 24px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px;
  -webkit-border-radius: 24px;
  -moz-border-radius: 24px;
  // margin-left: 20px;
  margin-right: 18px;
  cursor: pointer;
}
.marketbox {
  margin-left: 0;
}

.link-wallet {
  cursor: pointer;
  width: 144px;
  height: 48px;
  border: 2px solid @new_color;
  border-radius: 10px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  display: inline-block;
  vertical-align: middle;
  line-height: 44px;
  font-size: 18px;
  font-weight: bold;
  color: @new_color;
  text-align: center;
}
.header-mini {
  display: none;
  position: relative;
  .a-menu {
    width: 40px;
    height: 40px;
    display: block;
    background: url(../assets/img/menu.png) center no-repeat;
    cursor: pointer;
    background-size: 30px;
    -webkit-background-size: 30px;
    -moz-background-size: 30px;
  }
  .a-menu-close {
    background: url(../assets/img/menu_close.png) center no-repeat;
  }
  .link-wallet {
    border: 0 none;
    line-height: normal;
    height: initial;
  }
  .navList {
    position: absolute;
    right: 0px;
    background: #fff;
    top: 60px;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    padding: 12px 0;
    border: 1px solid #f5f5f5;

    li {
      padding: 8px 20px;
      text-align: center;
      // border-top: 1px solid #e5e5e5;
      margin: 0 10px;
      font-family: "PoppinsBold";
      color: #2081e2;
    }
    li:first-child {
      border-top: 0 none;
    }
  }
}
.header-right {
  white-space: nowrap;
}
.header_icon_message {
  width: 48px;
  height: 48px;
  display: inline-block;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  vertical-align: middle;
  border-radius: 24px;
  -webkit-border-radius: 24px;
  position: relative;
  margin-right: 18px;
  // background: url(../assets/img/icon_mesage.png) center no-repeat;
  cursor: pointer;
  img {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  span {
    font-size: 12px;
    background: #d63f3f;
    color: #fff;
    height: 20px;
    line-height: 20px;
    min-width: 20px;
    display: block;
    position: absolute;
    right: -5px;
    top: -5px;
    text-align: center;
    border-radius: 20px;
    -webkit-border-radius: 20px;
  }
}
// .header_icon_message:first-child {
//   margin-right: 18px;
// }
.header_icon_message:nth-child(3) {
  // display: none;
}

.list-icon,
.market-icon {
  display: none;
}
.header-pc {
  display: inline-block;
  vertical-align: middle;
}

.event {
  color: #255ea2;
}
.astate {
  color: #42afb1;
}

.header-info-list {
  position: absolute;
  right: 18px;
  top: 78px;
  width: 720px;
  max-width: 100%;
  background: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  -webkit-box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  -moz-box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  padding: 0 20px;
  border-radius: 5px;
  -webkit-border-radius: 5px;
  -moz-border-radius: 5px;
  transition: all 0.2s linear;
  li {
    display: table;
    border-top: 1px solid #efefef;
    width: 100%;
    height: 50px;
  }
  li div {
    display: table-cell;
    vertical-align: middle;
    width: 25%;
    text-align: center;
  }
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #172b4d;
    border: 0 none;
  }
  .clear-box {
    width: 80px;
    height: 30px;

    // border-radius: 5px;
    // border: 1px solid #172b4d;
    margin: auto;
    margin-bottom: 5px;
    font-size: 0;
    overflow: hidden;
    a {
      display: inline-block;
      width: 100%;
      height: 100%;
      line-height: 30px;
      text-align: center;
      font-size: 14px;
    }
  }
}

.slide-fade-enter-active {
  opacity: 1;

  transition: all 0.2s linear;
  transform: translateY(0px);
}
.slide-fade-leave-active {
  transform: translateY(10px);
  opacity: 0;
  transition: all 0.2s linear;
}
.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media screen and (max-width: 1090px) {
  .header {
    position: sticky;
    margin-bottom: 30px;
  }
}

@media screen and (max-width: 768px) {
  .list-icon,
  .market-icon {
    display: inline-block;
  }
  .header_icon_message:first-child {
    display: none;
  }
  // .header_icon_message:nth-child(3) {
  //   display: inline-block;
  //   margin-left: 12px;
  // }
  .navList {
    li:first-child {
      display: none;
    }
  }

  .pageTitle {
    font-size: 18px;
    img {
      width: 80px;
    }
  }
  .link {
    font-size: 16px;
    color: #e49c23;
    font-family: "PoppinsBold" !important;
  }
  .avabox {
    margin-left: 18px;
  }
  .link-wallet {
    font-size: 16px;
  }
  .header-pc {
    display: none;
  }
  .header-mini {
    display: inline-block;
    vertical-align: middle;
  }
}
</style>
