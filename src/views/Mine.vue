<template>
  <div class="wrap">
    <madcanner_header
      :current_route="current"
      class="welcome-header"
    ></madcanner_header>
    <div class="wrap-main">
      <div class="select-col">
        <div class="list-col" @click="toList">{{ $t("collection") }}</div>
        <div class="fen"></div>
        <div class="sale-col active">{{ $t("forsale") }}</div>
      </div>
      <div class="w1836">
        <div class="ava-list">
          <div
            class="ava-arr"
            v-for="(arr, index1) in res_list"
            :key="index1"
            :class="{ active: index1 == currentIndex }"
          >
            <div
              class="ava-item"
              v-for="(item, index) in arr"
              :key="index"
              ref="ava_item"
            >
              <div class="img-col" @click="toAsset(item)">
                <img :src="item.img" alt="" />
              </div>
              <div class="des-col">
                <div class="token-item">#{{ item.token_id }}</div>
                <div class="price-item">
                  <div class="img-item">
                    <!-- <img
                    src="@/assets/img/market/icon/price_icon.png"
                    alt=""
                    v-if="item.pay_kind == 0"
                  />
                  <img
                    src="@/assets/img/market/icon/wdc_price.png"
                    alt=""
                    v-if="item.pay_kind == 1"
                  /> -->
                    <img :src="item.price_img" alt="" />
                  </div>
                  <el-popover
                    placement="top-start"
                    width="200"
                    trigger="hover"
                    :content="
                      decimal(
                        toBigNumber(toNumber(item.price)),
                        token[item.pay_kind].decimal
                      )
                    "
                  >
                    <div class="text-item" slot="reference">
                      {{
                        decimal(
                          toBigNumber(toNumber(item.price)),
                          token[item.pay_kind].decimal
                        )
                          | formatNum
                          | str_Price
                      }}
                    </div>
                  </el-popover>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="point-col-new" v-if="ava_list.length != 0">
          <el-pagination
            layout="prev, pager, next"
            :page-count="point_num"
            @current-change="handleCurrentChange"
            :hide-on-single-page="true"
          >
          </el-pagination>
        </div>
      </div>
    </div>

    <el-dialog
      custom-class="mad-dialog"
      :title="$t('Transfer.transItem')"
      :visible.sync="sure_transfer_dialogVisible"
      :width="dialogWidth"
    >
      <div class="dialog-split-body align-center">
        <div class="new_dialog_label">
          <label>{{ $t("Transfer.address") }}</label>
        </div>
        <div class="input-col">
          <div class="input-item input-item-transfer">
            <input
              type="text"
              placeholder="e.g. 0x1ed3... or destination.eth"
              v-model="transferToAddress"
              @input="judgmentAddress"
            />
          </div>
        </div>
        <div class="Input-error">
          <div v-if="isInvalidAddress">
            <i class="el-dialog__close el-icon el-icon-close"></i>
            {{ $t("Transfer.invalid") }}
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <button
          @click="
            transferToAddress != '' && !isInvalidAddress ? handleTransfer() : ''
          "
          class="dialog-btn"
          :disabled="transferToAddress == '' || isInvalidAddress"
          style="cursor: pointer"
        >
          {{ $t("Transfer.confirm") }}
        </button>
      </div>
    </el-dialog>
    <loading v-if="showLoading"></loading>
  </div>
</template>

<script>
import { get_poly_jet_address } from "@/api/api";
import { getList } from "@/api/apiMarket";
import madcanner_header from "@/components/header.vue";
import { ethers } from "ethers";
import contractAbi from "@/contract/PolyJetClub";
import loading from "@/components/loading.vue";
import $ from "jquery";
import token from '../contract/token.json'
export default {
  name: "mine",
  data() {
    return {
      token:token.erc20,
      isActive: true,
      current: "list",
      currentIndex: 0,
      ava_list: [],
      current_list: [],
      res_list: [],
      point_list: [],
      sure_transfer_dialogVisible: false,
      isInvalidAddress: false,
      transferToAddress: "",
      myAddress: "",
      page: 0,
      point_num: 0,
      showLoading: false,
      contract_address: "",
      myTokenID: "",
    };
  },
  created() {
    this.setDialogWidth();
  },
  async mounted() {
    let that = this;
    window.addEventListener("resize", that.debounce(that.resize, 50), false);
    await that.get_pre();

    try {
      that.provider = new ethers.providers.Web3Provider(window.ethereum);
    } catch (e) {
      console.log(e);
    }
    if (window.ethereum) {
      try {
        window.ethereum.enable().then(async (res) => {
          that.myAddress = res[0];
          that.page = 1;
          // await that.resize();
          let w = $(window).width();
          let type;
          if (w < 768) {
            type = "phone";
          }
          await that.getTokenList(that.page, type);
        });
      } catch (e) {
        console.log(e);
      }
    }
  },
  components: {
    madcanner_header,
    loading,
  },
  methods: {
    handleCurrentChange(val) {
      let that = this;
      that.changeListNew(val - 1);
    },
    async resize() {
      let that = this;
      let w = $(window).width();
      if (w < 768) {
        that.page = 1;
        that.checkifPhone("phone");
      } else {
        that.page = 1;
        that.checkifPhone();
      }
    },
    debounce(operate, delay) {
      let time = null;
      let timer = null;
      let newTime = null;
      function task() {
        newTime = +new Date();
        if (newTime - time < delay) {
          timer = setTimeout(task, delay);
        } else {
          operate();
          timer = null;
        }
        time = newTime;
      }
      return function () {
        time = +new Date();
        if (!timer) {
          timer = setTimeout(task, delay);
        }
      };
    },
    async get_pre() {
      let that = this;
      let res = await get_poly_jet_address();
      that.contract_address = res.data;
    },
    toAsset(obj) {
      let that = this;

      that.$router.push({
        name: "assets",
        params: {
          tokenId: obj.token_id,
          type: "mine",
        },
      });
    },
    setDialogWidth() {
      var val = document.body.clientWidth;
      const def = 700; // default width
      const defh = 420; // default height
      if (val < def) {
        this.dialogWidth = "80%";
      } else {
        this.dialogWidth = def + "px";
        this.dialogHeight = defh + "px";
      }
    },
    async handleTransfer() {
      let that = this;
      let constract = that.getConstract();

      if (!that.isInvalidAddress) {
        that.showLoading = true;
        let address = that.transferToAddress.replace(/\s*/g, "");

        let res = await constract
          .transferFrom(that.myAddress, address, that.myTokenID)
          .catch((err) => {
            return -1;
          });

        if (res == -1) {
          that.sure_transfer_dialogVisible = false;
          that.showLoading = false;
          this.$message({
            message: that.$i18n.t("Trans.fail"),
            type: "error",
            duration: 5000,
            message_obj: {},
            isLink: true,
          });
          return;
        }

        that.set_location_data(res.hash, "Transfer", "");
        await res.wait();
        that.sure_transfer_dialogVisible = false;
        that.showLoading = false;
        that.$router.push({ path: "/list" });
        location.reload();
      }
    },
    judgmentAddress() {
      let that = this;
      // let address = that.transferToAddress.replace(/\s*/g, "");
      let address = that.transferToAddress.trim();
      try {
        ethers.utils.getAddress(address);
        that.isInvalidAddress = false;
      } catch (error) {
        that.isInvalidAddress = true;
      }
    },
    async getTokenList(page, type) {
      let that = this;

      let res = await getList(
        that.myAddress,
        1,
        10000,
        "2",
        "",
        that.contract_address
      );
      console.log(res);
      if (res.code == 200) {
        [...that.ava_list] = [...res.data];
        that.ava_list.forEach((item) => {
          token.erc20.forEach((erc) => {
            if (item.pay_kind == erc.value) {
              item.price_img = require(`../assets/img/market/icon/${erc.img}`);
            }
          });
        });
        for (var i = 0; i < that.ava_list.length; i += 3) {
          that.res_list.push(that.ava_list.slice(i, i + 3));
        }
        that.point_num = Math.ceil(res.data.totalElements / 3);
        that.page = page;

        that.checkifPhone(type);
      }
    },
    checkifPhone(type) {
      let that = this;
      type == "phone"
        ? ([...that.current_list] = [...that.ava_list])
        : ([...that.current_list] = [
            that.ava_list[3 * (that.page - 1)] != undefined
              ? that.ava_list[3 * (that.page - 1)]
              : null,
            that.ava_list[3 * (that.page - 1) + 1] != undefined
              ? that.ava_list[3 * (that.page - 1) + 1]
              : null,
            that.ava_list[3 * (that.page - 1) + 2] != undefined
              ? that.ava_list[3 * (that.page - 1) + 2]
              : null,
          ].filter((item) => {
            return item != null;
          }));
    },

    changeListNew(index) {
      let that = this;
      that.page = index + 1;

      that.currentIndex = index;
    },
    set_location_data(hash, method, data) {
      var txArr = JSON.parse(localStorage.getItem("txArr"));
      if (!txArr) {
        txArr = [];
      }
      let obj = {
        method: method,
        hash: hash,
        time: this.getNowFormatDate(),
        data: data,
      };
      txArr.push(obj);
      localStorage.setItem("txArr", JSON.stringify(txArr));
    },
    getNowFormatDate() {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var d = date.getDate();
      var hour = date.getHours();
      var minute = date.getMinutes();
      var second = date.getSeconds();

      if (month < 10) {
        month = "0" + month;
      }
      if (d < 10) {
        d = "0" + d;
      }
      if (hour < 10) {
        hour = "0" + hour;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }
      return (
        year + "-" + month + "-" + d + " " + hour + ":" + minute + ":" + second
      );
    },
    getConstract() {
      let that = this;
      let constract = new ethers.Contract(
        that.contract_address,
        contractAbi.abi,
        that.provider.getSigner()
      );
      return constract;
    },
    toList() {
      let that = this;
      that.$router.push("/list");
    },
    decimal(v, decimals) {
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
      return ethers.utils.bigNumberify(v);
    },
    toNumber(v) {
      var num = new Number(v);
      var arr = num.toLocaleString().split("");
      arr = arr.filter((item) => item != ",");
      var str = arr.join("");
      return str;
    },
  },
  watch: {
    sure_transfer_dialogVisible() {
      let that = this;
      if (that.sure_transfer_dialogVisible == false) {
        that.transferToAddress = "";
        that.isInvalidAddress = false;
      }
    },
  },
  filters:{
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

    str_Price(v) {
      if (v.length >= 18) {
        let str1 = v.slice(0, 9);
        return str1 + "...";
      }
      return v;
    },
  }
};
</script>
<style scoped lang="less" scoped>
@import "../assets/css/list.less";
</style>
<style scoped lang="less">
button:disabled {
  pointer-events: none;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  -webkit-box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  -moz-box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
}
</style>
