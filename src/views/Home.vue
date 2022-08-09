<template>
  <div class="home">
    <madcanner_header class="welcome-header"></madcanner_header>

    <div class="home-wraper flex-def flex-cCenter">
      <div class="left left-pic" v-if="scrennWidth > 1090">
        <div class="avatar-list-box bottom-avatar-list-box">
          <ul
            class="avator_list"
            id="avator_list1"
            :style="{ transform: `translateY(${space}px)` }"
          >
            <li
              class="avator_item"
              v-for="(item, index) in avalist_1"
              :key="index"
              ref="avatar_list_item"
            >
              <img :src="item" />
            </li>
          </ul>
        </div>

        <div class="avatar-list-box">
          <ul
            class="avator_list"
            id="avator_list"
            :style="{ transform: `translateY(${-space}px)` }"
          >
            <li
              class="avator_item"
              v-for="(item, index) in avalist"
              :key="index"
              ref="avatar_list_item"
            >
              <img :src="item" />
            </li>
          </ul>
        </div>
      </div>

      <div class="left-mini" v-if="scrennWidth <= 1090">
        <div class="avatar-list-box">
          <ul
            class="avator_list"
            id="avator_list"
            :style="{ transform: `translateX(${-space}px)` }"
          >
            <li
              class="avator_item"
              v-for="(item, index) in avalist"
              :key="index"
              ref="avatar_list_item"
            >
              <img :src="item" />
            </li>
          </ul>
        </div>

        <div class="avatar-list-box right-avatar-list-box">
          <ul
            class="avator_list"
            id="avator_list1"
            :style="{ transform: `translateX(${space}px)` }"
          >
            <li
              class="avator_item"
              v-for="(item, index) in avalist_1"
              :key="index"
              ref="avatar_list_item"
            >
              <img :src="item" />
            </li>
          </ul>
        </div>
      </div>

      <div class="right">
        <h3 class="text-welcome">
          <p class="p1">{{ $t("Home.welcome1") }}</p>
          <p class="p2">{{ $t("Home.welcome2") }}</p>
        </h3>

        <div class="functionBox">
          <div class="claim-btn-new" @click="claim_new">
            <div class="text-item">{{ $t("Home.claim") }}</div>
            <span class="token-item"
              >&nbsp;&nbsp;{{
                value == "PSC" ? psc_fee_new + " PSC" : wdc_fee_new + " WDC"
              }}</span
            >
            <div class="img-item">
              <img src="@/assets/pic/claim.png" alt="" />
            </div>
          </div>
          <div
            class="claim-btn-new claim-batch-btn-new"
            @click="claim_batch_new"
          >
            <div class="text-item">
              {{ $t("Home.claimBatch") }}10{{ $t("ge") }}
            </div>
            <span class="token-item"
              >&nbsp;&nbsp;{{
                value == "PSC"
                  ? psc_fee_multi_new + " PSC"
                  : wdc_fee_multi_new + " WDC"
              }}</span
            >
            <div class="img-item">
              <img src="@/assets/pic/claim.png" alt="" />
            </div>
          </div>
        </div>
        <div class="select-col">
          {{ $t("payment") }}
          <el-select v-model="value" placeholder="please select">
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </div>

    <loading v-if="showLoading"></loading>
  </div>
</template>

<script>
// @ is an alias to /src
import { get_poly_jet_address, get_unused, fee } from "@/api/api";
import { ethers, utils, Contract } from "ethers";
import madcanner_header from "@/components/header.vue";
import loading from "@/components/loading.vue";
import contractAbi from "@/contract/PolyJetClub";
import contractAbiERC from "@/contract/erc20";
import addr from "@/contract/Address";
export default {
  name: "home",
  data() {
    return {
      white: "",
      wdc_address: addr.wdc_address,
      value: "PSC",
      options: [{ value: "PSC" }, { value: "WDC" }],
      avalist: [
        require("../assets/pic/ava1.png"),
        require("../assets/pic/ava2.png"),
        require("../assets/pic/ava3.png"),
        require("../assets/pic/ava4.png"),
        require("../assets/pic/ava5.png"),
        require("../assets/pic/ava6.png"),
      ],

      avalist_1: [
        require("../assets/pic/ava66.png"),
        require("../assets/pic/ava55.png"),
        require("../assets/pic/ava44.png"),
        require("../assets/pic/ava33.png"),
        require("../assets/pic/ava22.png"),
        require("../assets/pic/ava11.png"),
      ],
      space: 0,
      timer: null,
      provider: {},
      scrennWidth: 0,
      showLoading: false,
      message: "loading...",
      tokenID: 0,
      isClaim: false,
      delay_timer: null,
      newlist: [],
      claim_timmer: null,
      fee: "10000000000000000",
      fee_str: "0.01",
      can_claim: true,
      next_claim_time: "1641975863",
      claim_end: false,
      contract_address: "",
      claim_fee: "",
      psc_fee: "",
      wdc_fee: "",
      psc_fee_multi: "",
      wdc_fee_multi: "",
      psc_fee_new: "",
      wdc_fee_new: "",
      psc_fee_multi_new: "",
      wdc_fee_multi_new: "",
      myAddress: "",
      proxyAddress: addr.proxyAddress,
    };
  },
  components: {
    madcanner_header,
    loading,
  },
  async mounted() {
    let that = this;

    window.cancelAnimationFrame =
      window.cancelAnimationFrame ||
      window.webkitCancelAnimationFrame ||
      window.mozCancelAnimationFrame ||
      window.cancelRequestAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame;

    window.requestAnimationFrame =
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame;

    if (!requestAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (fn) {
        var timer = 0;
        var nowTime = Date.now();
        var time = Math.max(16.7 - (nowTime - lastTime), 0);
        timer = setTimeout(fn, time);
        lastTime = nowTime;
        return timer;
      };
    }
    if (!cancelAnimationFrame) {
      window.cancelAnimationFrame = function (index) {
        clearTimeout(index);
      };
    }

    that.scrollAnimate();
    await that.get_fee();
    await that.claim_pre();

    try {
      that.provider = new ethers.providers.Web3Provider(window.ethereum);
    } catch (e) {
      console.log(e);
    }

    if (window.ethereum) {
      try {
        window.ethereum.enable().then(async (res) => {
          that.myAddress = res[0];
        });
      } catch (e) {
        console.log(e);
      }
    }
  },
  methods: {
    async get_fee() {
      let that = this;
      let res = await fee();

      that.psc_fee = res.data.psc_one;
      that.wdc_fee = res.data.wdc_one;
      that.psc_fee_multi = res.data.psc_ten;
      that.wdc_fee_multi = res.data.wdc_ten;
      that.psc_fee_new = parseInt(ethers.utils.formatUnits(that.psc_fee, 18));
      that.wdc_fee_new = parseInt(ethers.utils.formatUnits(that.wdc_fee, 18));
      that.psc_fee_multi_new = parseInt(
        ethers.utils.formatUnits(that.psc_fee_multi, 18)
      );
      that.wdc_fee_multi_new = parseInt(
        ethers.utils.formatUnits(that.wdc_fee_multi, 18)
      );
    },
    close_message(id) {
      let that = this;
      for (let i = 0; i < that.newlist.length; i++) {
        if (id == that.newlist[i].id) {
          that.newlist.splice(i, 1);
        }
      }
    },
    link_list() {
      let that = this;
      that.$router.push({ path: "/market" });
    },

    async getTokenID() {
      let that = this;

      if (!that.isClaim) {
        that.isClaim = true;
        if (that.$store.state.myAddress == "") {
          return this.$message({
            message: "Please connect to metamask",
            type: "error",
            duration: 5000,
            message_obj: {},
            isLink: false,
          });
        }
        try {
          that.provider = new ethers.providers.Web3Provider(window.ethereum);
        } catch (e) {
          console.log(e);
        }
        that.provider.getNetwork().then((res) => {
          if (res.chainId != 6999) {
            that.chainId = res;
            return this.$message({
              message: "Please switch to PSC",
              type: "error",
              duration: 5000,
              message_obj: {},
              isLink: false,
            });
          } else {
            that.chainId = res;
            that.showLoading = true;
            getTokenID().then((res) => {
              if (res.code == 200) {
                that.tokenID = res.data;
                that.claim(res.data);
              }
            });
          }
        });

        setTimeout(function () {
          that.isClaim = false;
        }, 2000);
      }
    },

    scrollAnimate() {
      let that = this;
      that.space = that.space + 0.5;
      this.timer = requestAnimationFrame(that.scrollAnimate);
      let w =
        this.$refs.avatar_list_item[0].clientWidth == 0
          ? 220
          : this.$refs.avatar_list_item[0].clientWidth;

      let margin_bottom = w >= 415 ? 36 : 20;
      that.scrennWidth = window.innerWidth;
      if (that.space >= parseInt(w + margin_bottom)) {
        try {
          let obj = document.getElementById("avator_list");
          let temp = document
            .getElementById("avator_list")
            .getElementsByTagName("li")[0];
          temp.remove();
          obj.appendChild(temp);

          let leng = that.avalist_1.length;
          let obj1 = document.getElementById("avator_list1");
          let first = document
            .getElementById("avator_list1")
            .getElementsByTagName("li")[0];
          let temp1 = document
            .getElementById("avator_list1")
            .getElementsByTagName("li")[leng - 1];

          temp1.remove();

          obj1.insertBefore(temp1, first);
        } catch (e) {
          console.log(e);
        }

        /*let temp = that.avalist.shift();
        that.avalist.push(temp);
         let temp1 = that.avalist_1.pop();
        that.avalist_1.unshift(temp1);
        */
        that.space = 0;
        //cancelAnimationFrame(this.timer)
      }
    },
    async claim_pre() {
      let that = this;
      let res = await get_poly_jet_address();
      if (res.code == 200) that.contract_address = res.data;
    },
    async claim() {
      let that = this;
      that.showLoading = true;
      let type = 1;
      let tokenid = await that.getRandomId(type);
      let constract = await that.getConstract();

      if (that.value == "WDC") {
        await that.ercApprove();
      }

      let res = await constract
        .claim(tokenid[0], that.value == "PSC" ? "0" : that.wdc_fee, {
          value: ethers.utils.bigNumberify(
            that.value == "PSC" ? that.psc_fee : "0"
          ),
        })
        .catch((err) => {
          return -1;
        });
      if (res == -1) {
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

      that.set_location_data(res.hash, "Claim", "申領", "");
      await res.wait().catch((e) => {});
      that.showLoading = false;
    },
    async claim_batch() {
      let that = this;
      that.showLoading = true;
      let type = 2;
      let tokenid = await that.getRandomId(type);

      let constract = await that.getConstract();

      if (that.value == "WDC") {
        await that.ercApprove();
      }

      let res = await constract
        .claimBatch(tokenid, that.value == "PSC" ? "0" : that.wdc_fee_multi, {
          value: ethers.utils.bigNumberify(
            that.value == "PSC" ? that.psc_fee_multi : "0"
          ),
        })
        .catch((err) => {
          return -1;
        });
      if (res == -1) {
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
      that.set_location_data(res.hash, "Claim", "申領", "");
      await res.wait().catch((e) => {});
      that.showLoading = false;
    },
    async claim_new() {
      let that = this;
      that.showLoading = true;
      let type = 1;
      let tokenid = await that.getRandomId(type);
      let constract = await that.getConstract();

      if (that.value == "WDC") {
        await that.ercApprove();
      }

      let res = await constract
        .claim(tokenid[0], {
          value: ethers.utils.bigNumberify(
            that.value == "PSC" ? that.psc_fee : "0"
          ),
        })
        .catch((err) => {
          return -1;
        });
      if (res == -1) {
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

      that.set_location_data(res.hash, "Claim", "申領", "");
      await res.wait().catch((e) => {});
      that.showLoading = false;
    },
    async claim_batch_new() {
      let that = this;
      that.showLoading = true;
      let type = 2;
      let tokenid = await that.getRandomId(type);

      let constract = await that.getConstract();

      if (that.value == "WDC") {
        await that.ercApprove();
      }

      let res = await constract
        .claimBatch(tokenid, {
          value: ethers.utils.bigNumberify(
            that.value == "PSC" ? that.psc_fee_multi : "0"
          ),
        })
        .catch((err) => {
          return -1;
        });
      if (res == -1) {
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
      that.set_location_data(res.hash, "Claim", "申領", "");
      await res.wait().catch((e) => {});
      that.showLoading = false;
    },

    async getRandomId(type) {
      let that = this;
      let res = await get_unused(type);
      that.claim_fee = res.data.fee;

      return res.data.tokenId;
    },
    async getConstract() {
      let that = this;
      let constract = new ethers.Contract(
        that.contract_address,
        contractAbi.abi,
        that.provider.getSigner()
      );
      return constract;
    },

    async ercApprove() {
      let that = this;
      let contract = await that.getConstractERC();
      let res = await contract.allowance(that.myAddress, that.proxyAddress);

      if (res.lt(ethers.utils.bigNumberify("2").pow(254))) {
        let appro = await contract
          .approve(that.proxyAddress, ethers.utils.bigNumberify("2").pow(255))
          .catch((err) => {
            return -1;
          });
        if (appro == -1) {
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

        that.set_location_data(appro.hash, "Approve", "批准", "");
        await appro.wait();
      }
    },

    async getConstractERC() {
      let that = this;
      let constract = new ethers.Contract(
        that.wdc_address,
        contractAbiERC.abi,
        that.provider.getSigner()
      );
      return constract;
    },
    set_location_data(hash, method, methodcn, data) {
      var txArr = JSON.parse(localStorage.getItem("txArr"));
      if (!txArr) {
        txArr = [];
      }
      let obj = {
        method: method,
        methodcn: methodcn,
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
  },
  destroyed() {
    if (this.timer != null) {
      cancelAnimationFrame(this.timer);
    }
    if (this.delay_timer != null) {
      clearTimeout(this.delay_timer);
    }
    if (this.claim_timmer != null) {
      clearInterval(this.claim_timmer);
    }
  },
};
</script>

<style scoped lang="less">
@import "../assets/css/welcome.less";
</style>

<style scoped lang="less">
/deep/ .el-input__suffix-inner {
  .el-select__caret::before {
    color: #000;
  }
}
</style>
