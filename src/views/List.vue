<template>
  <div class="wrap">
    <madcanner_header
      :current_route="current"
      class="welcome-header"
    ></madcanner_header>
    <div class="wrap-main">
      <div class="select-col">
        <div class="list-col active">{{ $t("collection") }}</div>
        <div class="fen"></div>
        <div class="sale-col" @click="toMine">{{ $t("forsale") }}</div>
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
                <div class="token-item">#{{ item.tokenId }}</div>
                <div
                  class="btn-item"
                  @click="
                    sure_transfer_dialogVisible = true;
                    myTokenID = item;
                  "
                >
                  <div class="img-item">
                    <img src="@/assets/pic/transfer.png" alt="" />
                  </div>
                  <div class="text-item">{{ $t("Transfer.trans") }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="point-col">
          <div
            class="point-item"
            :class="{ active: index == page - 1 }"
            v-for="(item, index) in point_list"
            :key="index"
            @click="changeListNew(index)"
          ></div>
        </div> -->
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

    <loading v-if="showLoading"></loading>

    <el-dialog
      :title="$t('Transfer.Migrate')"
      :visible.sync="isMigrate"
      custom-class="mad-dialog migrate-dialog"
      :show-close="false"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="operation-instructions">
        {{ $t("Transfer.m-text1") }}{{ polyJetClubNumber
        }}{{ $t("Transfer.m-text2") }}
      </div>
      <div slot="footer" class="dialog-footer">
        <button
          class="dialog-btn btn-migrate"
          @click="MigratePolyClub()"
          :disabled="isPending"
        >
          {{ isPending ? $t("Tx.pending") : $t("Transfer.confirm") }}
          {{ step }}/2
        </button>
      </div>
    </el-dialog>

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
  </div>
</template>

<script>
import { get_user_data, get_poly_jet_address } from "@/api/api";
import { get_potion, get_poly_potion_address } from "@/api/apiPotion";

import madcanner_header from "@/components/header.vue";
import { ethers } from "ethers";
import contractAbi from "@/contract/PolyJetClub";
import polyjetClubV2Abi from "@/contract/PolyJetClubV2";
import PolyJetClubProxysAbi from "@/contract/PolyJetClubProxys";
import potionAbi from "@/contract/Potion";
import BigNumber from "bignumber.js";
import loading from "@/components/loading.vue";
import addr from "@/contract/Address.json";
import $ from "jquery";
export default {
  name: "list",
  data() {
    return {
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
      potion_address: "",
      myTokenID: {},
      isMigrate: false,
      polyjetclubcontract_V1: null,
      polyjetclubcontract_V2: null,
      isPending: false,
      polyJetClubNumber: 0,
      step: 0,
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
          await that.getPolyBalance_v1();
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
    async OnisApprovedForAll() {
      let that = this;
      try {
        const txHash = await that.polyjetclubcontract_V1.isApprovedForAll(
          that.myAddress,
          addr.proxyAddress
        );
        return txHash;
      } catch (e) {
        return false;
      }
    },

    async ApproveForProxys() {
      let that = this;
      try {
        const txHash = await that.polyjetclubcontract_V1.setApprovalForAll(
          addr.proxyAddress,
          true
        );
        await txHash.wait();
        return true;
      } catch (e) {
        return false;
      }
    },

    async onClaimMigration() {
      let that = this;
      that.polyjetclubcontract_V2 = new ethers.Contract(
        addr.polyjetclubV2,
        polyjetClubV2Abi,
        that.provider.getSigner()
      );
      try {
        const txtash = await that.polyjetclubcontract_V2.claimMigration();
        await txtash.wait();
        return true;
      } catch (e) {
        return false;
      }
    },

    async getPolyBalance_v1() {
      let that = this;
      that.polyjetclubcontract_V1 = new ethers.Contract(
        addr.polyjetclubV1,
        contractAbi.abi,
        that.provider.getSigner()
      );
      const polybalancev1 = await that.polyjetclubcontract_V1.balanceOf(
        that.myAddress
      );
      that.polyJetClubNumber = new BigNumber(polybalancev1).toString();
      if (new BigNumber(polybalancev1).isGreaterThan(0)) {
        that.isMigrate = true;
      } else {
        that.isMigrate = false;
      }
    },
    async MigratePolyClub() {
      let that = this;

      that.isPending = true;
      that.step = 0;
      const isApprove = await that.OnisApprovedForAll();
      if (!isApprove) {
        const approveTxh = await that.ApproveForProxys();
        if (approveTxh) {
          that.step = that.step + 1;
        } else {
          that.isPending = false;
        }
      } else {
        that.step = that.step + 1;
      }

      const claimTxh = await that.onClaimMigration();
      if (claimTxh) {
        that.isMigrate = false;
        that.step = that.step + 1;
        that.isPending = false;
        that.page = 1;
        let w = $(window).width();
        let type;
        if (w < 768) {
          type = "phone";
        }
        await that.getTokenList(that.page, type);
      } else {
        that.isPending = false;
      }
    },

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

      let resPotion = await get_poly_potion_address();
      that.potion_address = resPotion.data;
    },
    toAsset(obj) {
      let that = this;
      if (obj.type == 1) {
        that.$router.push({
          name: "assetsPotion",
          params: {
            tokenId: obj.tokenId,
            type: "list",
          },
        });
      } else {
        that.$router.push({
          name: "assets",
          params: {
            tokenId: obj.tokenId,
            type: "list",
          },
        });
      }
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
          .transferFrom(that.myAddress, address, that.myTokenID.tokenId)
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

        that.set_location_data(res.hash, "Transfer", "轉賬", "");
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
      let limit = 10000;

      let res = await get_user_data(that.myAddress, page, limit);
      let resPotion = await get_potion(that.myAddress, page, limit);
      // console.log(resPotion)

      if (res.code == 200) {
        [...that.ava_list] = [...res.data.avatars];

        if (resPotion.code == 200) {
          that.ava_list = that.ava_list.concat([...resPotion.data.avatars]);
        }

        for (var i = 0; i < that.ava_list.length; i += 3) {
          that.res_list.push(that.ava_list.slice(i, i + 3));
        }

        that.point_num = Math.ceil((res.data.total + resPotion.data.total) / 3);
        that.point_list.length = that.point_num;
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
    checkifPhoneNew(type) {
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
    changeList(page) {
      let that = this;
      that.page = page;

      [...that.current_list] = [
        that.ava_list[3 * (page - 1)] != undefined
          ? that.ava_list[3 * (page - 1)]
          : null,
        that.ava_list[3 * (page - 1) + 1] != undefined
          ? that.ava_list[3 * (page - 1) + 1]
          : null,
        that.ava_list[3 * (page - 1) + 2] != undefined
          ? that.ava_list[3 * (page - 1) + 2]
          : null,
      ].filter((item) => {
        return item != null;
      });
    },
    changeListNew(index) {
      let that = this;
      that.page = index + 1;

      that.currentIndex = index;
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
    getConstract() {
      let that = this;

      let constract;
      if (that.myTokenID.type == 1) {
        constract = new ethers.Contract(
          that.potion_address,
          potionAbi.abi,
          that.provider.getSigner()
        );
      } else {
        constract = new ethers.Contract(
          that.contract_address,
          contractAbi.abi,
          that.provider.getSigner()
        );
      }

      return constract;
    },

    toMine() {
      let that = this;
      that.$router.push("/mine");
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
};
</script>
<style scoped lang="less">
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
