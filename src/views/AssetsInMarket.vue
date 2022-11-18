<template>
  <div
    class="assets_wrap"
    :class="{ wrap_hidden: isReplace }"
    @click="isReplace = false"
  >
    <madcanner_header :current_route="current"></madcanner_header>

    <div class="top_info">
      <div class="flex-def assets_content">
        <div class="pic">
          <div class="ava-item">
            <div class="img-item">
              <img :src="myImg" alt="" />
            </div>
          </div>
        </div>

        <div class="right-info">
          <p class="p-tokenid">#{{ nftInMarket.token_id }}</p>

          <p class="p-date">{{ $t("Tx.date") }}:{{ myDate }}</p>
          <p class="p-owner">{{ $t("owner") }}:{{ str_Address(myOwner) }}</p>
          <div class="off-col">
            <div class="price-item">
              <div class="img-col">
                <img :src="price_img" alt="" />
              </div>
              <el-popover
                placement="top-start"
                width="200"
                trigger="hover"
                :content="
                  decimal(
                    toBigNumber(toNumber(myPrice)),
                    token[payKind].decimal
                  )
                "
              >
                <div class="text-col" slot="reference">
                  {{
                    decimal(
                      toBigNumber(toNumber(myPrice)),
                      token[payKind].decimal
                    )
                      | formatNum
                      | str_Price
                  }}
                </div>
              </el-popover>
            </div>
            <div class="btn-col" @click="click_sure_buy" v-if="canBuy">
              <a href="javascript:;"> {{ $t("buynow") }} </a>
            </div>
            <div class="btn-col gray" v-if="!canBuy">
              <a href="javascript:;"> {{ $t("buynow") }} </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="assets-info">
      <div class="info-cel">
        <div
          class="d-title"
          :class="{ show_d_title: showIndex.indexOf(2) != -1 }"
          @click="showContent(2)"
        >
          <span class="s-properties">{{ $t("Assets.properties") }}</span>
          <a class="arrow"></a>
        </div>
        <div
          class="d-content d-content-properties"
          :style="{
            display: showIndex.indexOf(2) != -1 ? 'block' : 'none',
          }"
        >
          <div
            class="item-properties"
            v-for="(item, index) in properties"
            :key="index"
          >
            <p class="name">
              {{ p_lang_locale == "zn" ? item.name_ch : item.name }}
            </p>
            <p class="id">
              {{ p_lang_locale == "zn" ? item.value_ch : item.value }}
            </p>
            <p class="p-intro">{{ item.ratio }}% {{ $t("Assets.trait") }}</p>
          </div>
        </div>
      </div>
      <div class="info-cel">
        <div
          class="d-title"
          :class="{ show_d_title: showIndex.indexOf(4) != -1 }"
          @click="showContent(4)"
        >
          <span class="s-details">{{ $t("Assets.details") }}</span>
          <a class="arrow"></a>
        </div>
        <div
          class="d-content d-content-detail"
          :style="{ display: showIndex.indexOf(4) != -1 ? 'block' : 'none' }"
        >
          <div class="i-detail-box">
            <div class="i-detail-col">
              <div class="s-label">{{ $t("Assets.address") }}</div>
              <div class="s-text">
                <a
                  :href="contract_link + 'txs?address=' + contract_address"
                  target="_blank"
                  >{{ str_Address(contract_address) }}</a
                >
              </div>
            </div>
            <div class="i-detail-col">
              <div class="s-label">{{ $t("Assets.token") }}</div>
              <div class="s-text">{{ nftInMarket.token_id }}</div>
            </div>
            <div class="i-detail-col">
              <div class="s-label">{{ $t("Assets.stand") }}</div>
              <div class="s-text">{{ tokenStandard }}</div>
            </div>
            <div class="i-detail-col">
              <div class="s-label">{{ $t("Assets.chain") }}</div>
              <div class="s-text">{{ chain }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="info-cel">
        <div
          class="d-title shezhi"
          :class="{ show_d_title: showIndex.indexOf(6) != -1 }"
          @click="showContent(6)"
        >
          <span class="s-shezhi">{{ $t("Assets.polydao") }}</span>
          <a class="arrow"></a>
        </div>
        <div
          class="d-content d-content-text"
          :style="{ display: showIndex.indexOf(6) != -1 ? 'flex' : 'none' }"
        >
          <span v-if="!ifpolyDao" style="color: #5abc77; font-weight: 900">{{
            $t("yes")
          }}</span>
          <span v-if="ifpolyDao" style="color: #d44040; font-weight: 900">{{
            $t("no")
          }}</span>
        </div>
      </div>

      <div class="info-cel">
        <div
          class="d-title"
          :class="{ show_d_title: showIndex.indexOf(3) != -1 }"
          @click="showContent(3)"
        >
          <span class="s-about">{{ $t("Assets.about") }}</span>
          <a class="arrow"></a>
        </div>
        <div
          class="d-content d-content-text"
          :style="{ display: showIndex.indexOf(3) != -1 ? 'block' : 'none' }"
          v-html="$t('Assets.mess')"
        >
          <!-- {{}} -->
        </div>
      </div>
      <div class="info-cel" v-if="assetsInfo.description != ''">
        <div
          class="d-title"
          :class="{ show_d_title: showIndex.indexOf(1) != -1 }"
          @click="showContent(1)"
        >
          <span class="s-title">{{ $t("Assets.description") }}</span>
          <a class="arrow"></a>
        </div>
        <div
          class="d-content d-content-text"
          :style="{ display: showIndex.indexOf(1) != -1 ? 'flex' : 'none' }"
        >
          {{ $t("Assets.create") }}
          <div class="img-item">
            <img src="@/assets/img/nice.png" alt="" />
          </div>
        </div>
      </div>
      <div class="info-cel">
        <div
          class="d-title"
          :class="{ show_d_title: showIndex.indexOf(5) != -1 }"
          @click="showContent(5)"
        >
          <span class="s-details">{{ $t("Assets.activity") }}</span>
          <a class="arrow"></a>
        </div>
        <div
          class="d-content d-content-detail"
          :style="{ display: showIndex.indexOf(5) != -1 ? 'block' : 'none' }"
        >
          <el-scrollbar style="width: 100%">
            <div class="content-col">
              <div>
                <div class="title-box">
                  <div class="title-item">{{ $t("Assets.eve") }}</div>
                  <div class="title-item">{{ $t("Assets.price") }}</div>
                  <div class="title-item">{{ $t("Assets.from") }}</div>
                  <div class="title-item">{{ $t("Assets.to") }}</div>
                  <div class="title-item">{{ $t("Assets.date") }}</div>
                </div>
                <div class="content-box">
                  <div
                    class="content-item"
                    v-for="(item, index) in gmd_list"
                    :key="index"
                  >
                    <div class="event">
                      <div class="img-item">
                        <img src="@/assets/img/market/buy.png" alt="" />
                      </div>
                      <div class="text-item">Sale</div>
                    </div>
                    <div class="price">
                      <div class="img-item">
                        <img :src="item.price_img" alt="" />
                      </div>
                      <div class="text-item">
                        {{
                          decimal(
                            toBigNumber(toNumber(item.price)),
                            token[item.pay_kind].decimal
                          )
                            | formatNum
                            | str_Price
                        }}
                      </div>
                    </div>
                    <div class="from">{{ str_Address(item.from) }}</div>
                    <div class="to">{{ str_Address(item.to) }}</div>
                    <div class="date">{{ item.time | formatTime }}</div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <el-dialog
      custom-class="mad-dialog per-dialog"
      :title="$t('buynow')"
      :visible.sync="sure_buy_dialogVisible"
      :width="dialogWidth"
    >
      <div class="dialog-split-body align-center">
        <div class="price-item">
          <p>{{ $t("Assets.price") }}</p>
          <div class="img-col">
            <img :src="price_img" alt="" />
          </div>
          <el-popover
            placement="top-start"
            width="200"
            trigger="hover"
            :content="
              decimal(toBigNumber(toNumber(myPrice)), token[payKind].decimal)
            "
          >
            <div class="text-col" slot="reference">
              {{
                decimal(toBigNumber(toNumber(myPrice)), token[payKind].decimal)
                  | formatNum
                  | str_Price
              }}
            </div>
          </el-popover>
        </div>
        <div class="msg-item">
          <p>
            {{ $t("surebuyf") }}
            {{ decimal(toBigNumber(myPrice), token[payKind].decimal) }}
            {{ price_name }}
            {{ $t("surebuyb") }}
          </p>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <button @click="sure_buy_new" class="dialog-btn">
          {{ $t("Transfer.confirm") }}
        </button>
      </div>
    </el-dialog>
    <loading v-if="showLoading"></loading>
  </div>
</template>

<script>
// @ is an alias to /src
import { get_avatar_detail, get_poly_jet_address } from "@/api/api";
import contractAbiERC from "@/contract/erc20";
import {
  sell_status,
  get_gmd_by_token_id,
  getList,
} from "@/api/apiMarket";
import { ethers } from "ethers";
import contractAddress from "@/contract/Address";
import madcanner_header from "@/components/header.vue";
import chains from "@/contract/chains";
import contractAbi from "@/contract/PolyJetClub";
import marketAbi from "@/contract/Market";
import loading from "@/components/loading.vue";
import moment from "moment";
import token from "@/contract/token";
import polydaoabi from "../contract/ploydao.json";
export default {
  name: "assetsmarket",
  data() {
    return {
      token: token.erc20,
      wdc_address: contractAddress.wdc_address,
      type: "",
      p_lang_locale: "",
      current: "market",
      properties: [],
      showIndex: [],
      dialogWidth: 0,
      dialogHeight: 0,
      sure_sell_dialogVisible: false,
      canBuy: false,
      isReplace: false,
      myAddress: "",
      provider: {},
      assetsInfo: { img: "" },
      showLoading: false,
      disabled: true,
      chainId: 6999,
      chain: "",
      contract_link: "",
      wallet_timmer: null,
      tokenStandard: process.env.VUE_APP_TOKEN_STANDARD,
      sure_transfer_dialogVisible: false,
      sure_buy_dialogVisible: false,
      transferToAddress: "",
      canSell: false,
      preloadImgUrl: contractAddress.baseURL,
      isInvalidAddress: false,
      contract_address: "",
      myOwner: "",
      myDate: "",
      myImg: "",
      myPrice: "",
      page: -1,
      limit: "10",
      list: [],
      total: 0,
      gmd_list: [],
      payKind: "0",
      price_img: "",
      price_name: "",
      sj_timestamp: "",
      signature: "",
      ifpolyDao: true,
      polyject_adderss: "",
      nft: "",
      nftInMarket: {},
    };
  },
  components: {
    madcanner_header,
    loading,
  },
  created() {
    this.setDialogWidth();
  },
  async mounted() {
    let that = this;
    that.p_lang_locale = that.$i18n.locale;

    if (!that.$route.params.nftInMarket) {
      that.nftInMarket = JSON.parse(sessionStorage.getItem("nftInMarket"));
    } else {
      that.nftInMarket = that.$route.params.nftInMarket
        ? JSON.parse(that.$route.params.nftInMarket)
        : "";
      sessionStorage.setItem("nftInMarket", JSON.stringify(that.nftInMarket));
    }

    if (window.ethereum) {
      try {
        that.provider = new ethers.providers.Web3Provider(window.ethereum);
        await that.get_pre();
        await that.seeSellStatus();
      } catch (e) {
        console.log(e);
      }
    }
    for (let i = 0; i < chains.length; i++) {
      if (chains[i].chainId == that.chainId) {
        that.chain = chains[i].label;
        that.contract_link = chains[i].link;
      }
    }
    await that.seeIfPolyDao(that.nftInMarket.token_id);
    await that.getNftInfo();
    await that.getNftList();
    await that.getGmd();

    if (window.ethereum) {
      window.ethereum.enable().then(async (res) => {
        that.myAddress = res[0];
        if (that.payKind == "0") {
          that.balance = await that.provider.getBalance(that.myAddress);
        } else {
          let contract = await that.getConstractERC();
          that.balance = await contract.balanceOf(that.myAddress);
        }
        if (
          that.balance.lt(ethers.utils.bigNumberify(that.myPrice.toString()))
        ) {
          that.canBuy = false;
        } else {
          that.canBuy = true;
        }
      });
    }
  },
  methods: {
    async seeSellStatus() {
      let that = this;
      let res = await sell_status(
        that.myAddress,
        that.contract_address,
        that.nftInMarket.token_id
      );
      that.isSold = res.data;
    },

    async getNftList() {
      let that = this;
      let res = await getList(
        "",
        that.page,
        that.limit,
        "2",
        that.nftInMarket.token_id,
        that.contract_address
      );

      if (res.code == 200) {
        that.list = that.list.concat(res.data);

        // that.page += 1;
        that.myDate = that.list[0].sj_time;
        that.myPrice = that.list[0].price;
        that.myOwner = that.list[0].owner;
        that.payKind = that.list[0].pay_kind;
        that.sj_timestamp = that.list[0].sj_timestamp;
        that.signature = that.list[0].signature;
        token.erc20.forEach((erc) => {
          if (erc.value == that.list[0].pay_kind) {
            that.price_img = require(`../assets/img/market/icon/${erc.img}`);
            that.price_name = erc.tokenName;
          }
        });
      }
    },
    async get_pre() {
      let that = this;
      let res = await get_poly_jet_address();
      that.contract_address = res.data;
    },

    async getNftInfo() {
      let that = this;
      let res = await get_avatar_detail(that.nftInMarket.token_id);

      if (res.code == 200) {
        that.myImg = res.data.img;
        that.properties = res.data.parts;
      }
    },

    async handleTransfer() {
      let that = this;
      let constract = that.getConstract();

      if (!that.isInvalidAddress) {
        that.showLoading = true;
        let address = that.transferToAddress.replace(/\s*/g, "");

        let res = await constract
          .transferFrom(that.myAddress, address, that.nftInMarket.token_id)
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

        that.set_location_data(res.hash, "Transfer", "轉賬", "", "");
        await res.wait();
        that.sure_transfer_dialogVisible = false;
        that.showLoading = false;
        that.$router.push({ path: "/list" });
        location.reload();
      }
    },

    //Set the popover width
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
    showContent(num) {
      let that = this;
      if (that.showIndex.indexOf(num) == -1) {
        that.showIndex.push(num);
      } else {
        let index = that.showIndex.indexOf(num);
        that.showIndex.splice(index, 1);
      }
    },

    set_location_data(hash, method, methodcn, data, nft) {
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
        nft: nft,
      };
      txArr.push(obj);
      localStorage.setItem("txArr", JSON.stringify(txArr));
    },
    str_Address(address) {
      let str1 = address.slice(0, 4);
      let str2 = address.slice(-4);
      return str1 + "..." + str2;
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
    judgmentAddress() {
      let that = this;
      let address = that.transferToAddress.trim();
      try {
        ethers.utils.getAddress(address);
        that.isInvalidAddress = false;
      } catch (error) {
        that.isInvalidAddress = true;
      }
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
    click_sure_buy() {
      let that = this;
      that.sure_buy_dialogVisible = true;
    },
    async sure_buy_new() {
      let that = this;
      that.showLoading = true;
      that.sure_buy_dialogVisible = false;
      let isBought = await sell_status(
        that.myOwner,
        that.nftInMarket.nft,
        that.nftInMarket.token_id
      ).catch((err) => {
        console.log(err);
      });
      if (!isBought) {
        that.showLoading = false;
        return this.$message({
          message: that.$i18n.t("Trans.fail"),
          type: "error",
          duration: 5000,
          message_obj: {},
          isLink: true,
        });
      }

      if (that.payKind != "0") {
        let erc = await that.ercApprove();
        if (erc == -1) {
          return;
        }
      }

      let constract = that.getConstractMarket();

      let nonce = await constract.nonces(that.nftInMarket.owner);

      that.showLoading = true;

      let o = {
        from: that.nftInMarket.owner,
        nft: that.nftInMarket.nft,
        tokenId: that.nftInMarket.token_id,
        amount: 1,
        token:
          that.nftInMarket.pay_kind == 0
            ? "0x0000000000000000000000000000000000000000"
            : "",
        price: that.nftInMarket.price,
        nonce: nonce.toString(),
        timestamp: that.nftInMarket.sj_timestamp,
      };

      let res = await constract
        .buy(o, that.myAddress, that.nftInMarket.signature, {
          value:
            that.payKind == "0" ? that.toBigNumber(that.nftInMarket.price) : 0,
        })
        .catch((err) => {
          console.log(err);
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
      } else {
        that.set_location_data(
          res.hash,
          "Buy",
          "購買",
          that.nftInMarket.token_id,
          that.nftInMarket.nft
        );

        // await res.wait().catch((e) => {});
        that.timer = setInterval(async () => {
          let res = await sell_status(
            that.nftInMarket.owner,
            that.nftInMarket.nft,
            that.nftInMarket.token_id
          );
          if (!res.data) {
            clearInterval(that.timer);
            that.showLoading = false;
            that.$router.replace("/list");
          }
        }, 1000);
      }
    },
    getConstractMarket() {
      let that = this;

      let constract = new ethers.Contract(
        contractAddress.MarketAddress,
        marketAbi.abi,
        that.provider.getSigner()
      );
      return constract;
    },
    async getGmd() {
      let that = this;

      let result = await get_gmd_by_token_id(
        1,
        1000,
        that.myTokenID,
        that.contract_address
      );
      that.gmd_list = result.data;
      that.gmd_list.forEach((item) => {
        token.erc20.forEach((erc) => {
          if (erc.value == item.pay_kind) {
            item.price_img = require(`../assets/img/market/icon/${erc.img}`);
          }
        });
      });
    },
    async ercApprove() {
      let that = this;
      let contract = await that.getConstractERC();
      let res = await contract.allowance(
        that.myAddress,
        contractAddress.MarketAddress
      );

      if (res.lt(ethers.utils.bigNumberify("2").pow(254))) {
        let appro = await contract
          .approve(
            contractAddress.MarketAddress,
            ethers.utils.bigNumberify("2").pow(255)
          )
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
          return -1;
        }

        that.set_location_data(appro.hash, "Approve", "批准", "", "");
        await appro.wait();
      }
    },
    async getConstractERC() {
      let that = this;
      let erc_addres = token.erc20[that.payKind].address;
      let constract = new ethers.Contract(
        erc_addres,
        contractAbiERC.abi,
        that.provider.getSigner()
      );
      return constract;
    },
    getConstractpoly() {
      let that = this;
      let constract = new ethers.Contract(
        contractAddress.polydaoAddress,
        polydaoabi,
        that.provider.getSigner()
      );
      return constract;
    },
    async seeIfPolyDao(id) {
      if (!id) return;
      let that = this;
      let contract = that.getConstractpoly();

      let res = await contract.jetValid(id);

      res.toString() == "0"
        ? (that.ifpolyDao = false)
        : (that.ifpolyDao = true);
      return res.toString();
    },
  },
  filters: {
    formatTime(v) {
      let that = this;
      if (v == "") {
        return;
      } else {
        let t = new Date(v);
        let now = new Date().getTime() - Number(8 * 3600 * 1000);
        return moment(t).from(moment(now));
      }
    },
    decimal(v) {
      if (v == "") {
        return;
      }
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
    toFixed(v) {
      return parseFloat(v).toFixed(4);
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

    str_Price(v) {
      if (v.length >= 18) {
        let str1 = v.slice(0, 9);
        return str1 + "...";
      }
      return v;
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
    getLocale() {
      let that = this;
      that.p_lang_locale = this.$store.state.locale;
    },
  },
  beforeDestroy() {
    document.getElementsByTagName("body")[0].style = "";
    document.getElementsByTagName("body")[0].classList.remove("transBody");
  },
  destroyed() {
    if (this.wallet_timmer != null) {
      clearInterval(this.wallet_timmer);
    }
  },
  computed: {
    getLocale() {
      return this.$store.state.locale;
    },
  },
};
</script>

<style lang="less" scope>
@import "../assets/css/assets.less";
</style>
