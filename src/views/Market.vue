<template>
  <div
    class="wrap"
    v-infinite-scroll="getWholeList"
    style="overflow-y: auto; height: 100%"
    infinite-immediate-check="true"
    infinite-scroll-disabled="disabled"
    infinite-scroll-throttle-delay="800"
    infinite-scroll-distance="1"
    infinite-scroll-immediate="true"
  >
    <madcanner_header :current_route="current"></madcanner_header>
    <div class="wrap_main" :class="{ 'no-scroll-wrap-main': total < limit }">
      <div class="banner">
        <div class="mask"></div>
        <div class="img-col">
          <img src="@/assets/img/market/banner_bg.png" alt="" />
        </div>
        <div class="text-col">
          <p>{{ $t("welcome") }}</p>
        </div>
      </div>
      <div class="w1470">
        <div class="filter-col">
          <div class="search-item">
            <div>
              <div class="img-col">
                <img src="@/assets/img/market/icon/s_icon.png" alt="" />
              </div>
              <div class="input-col">
                <input
                  type="text"
                  :placeholder="$t('search')"
                  v-model="s_id"
                  @keyup.enter.prevent="searchById($event)"
                />
              </div>
            </div>
          </div>
          <div class="sel-item">
            <div class="fir-item">
              <el-select
                v-model="value"
                :placeholder="$t('select')"
                @change="
                  list.length = 0;
                  s_id = '';
                  page = -1;
                  getWholeList();
                "
              >
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

        <div class="content-col">
          <div
            class="content-item"
            v-for="(item, index) in list"
            :key="index"
            @click="getAssets(item)"
          >
            <div class="img-col">
              <img :src="item.img" alt="" />
            </div>
            <div class="info-col">
              <div class="id-item">#{{ item.token_id }}</div>
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
    </div>
    <loading :mess="message" v-if="showLoading"></loading>
  </div>
</template>
<script>
import madcanner_header from "@/components/header.vue";
import loading from "@/components/loading.vue";
import { getList } from "@/api/apiMarket";
import { ethers } from "ethers";
import token from "@/contract/token";
export default {
  name: "market",
  data() {
    return {
      // options: [
      //   {
      //     value: "2",
      //     label: "Date：Oldest",
      //   },
      //   {
      //     value: "3",
      //     label: "Date：Newest",
      //   },
      //   {
      //     value: "4",
      //     label: "Price：Highest",
      //   },
      //   {
      //     value: "5",
      //     label: "Price：Lowest",
      //   },
      // ],
      token: token.erc20,
      options2: [
        {
          value2: "1",
          label2: "All",
        },
        {
          value2: "2",
          label2: "Canner",
        },

        {
          value2: "3",
          label2: "Background",
        },
        {
          value2: "4",
          label2: "Eyes",
        },
        {
          value2: "5",
          label2: "Mouth",
        },
        {
          value2: "6",
          label2: "Body",
        },
        {
          value2: "7",
          label2: "Top",
        },
        {
          value2: "8",
          label2: "Straw",
        },
        {
          value2: "9",
          label2: "Gesture",
        },
        {
          value2: "10",
          label2: "Template",
        },
      ],
      value: "",
      value2: "1",
      label2: "All",
      list: [],
      myAddress: "",
      s_id: "",
      showLoading: false,
      message: "waiting",
      page: -1,
      limit: 28,
      total: 0,
      disabled: true,
      disabledFlag: false,
      orderFlag: false,
      keyMap: {},
      current: "market",
      provider: {},
      min_price: "0",
      payKind: "0",
      src: require("../assets/img/market/icon/wdc_price.png"),
    };
  },
  created() {},
  async mounted() {
    let that = this;
    // that.showLoading = true;

    if (window.ethereum) {
      try {
        that.provider = new ethers.providers.Web3Provider(window.ethereum);
      } catch (e) {
        console.log(e);
      }

      try {
        await window.ethereum.enable().then((res) => {
          that.myAddress = res[0];
        });
      } catch (e) {
        console.log(e);
      }
    }

    that.getWholeList();
    // that.getLowest();
  },
  components: {
    madcanner_header,
    loading,
  },
  methods: {
    async getLowest() {
      // let that = this;
      // let res = await get_the_lowest_price();
      // that.min_price = res.data;
    },

    async getWholeList() {
      let that = this;
      let args = [];
      //order_by_price

      // is_all, order_by, is_desc, token_id, pay_kind

      // if (that.value == "2") {
      //   args = [0, "1", "1", "", ""];
      // } else if (that.value == "3") {
      //   args = [0, "1", "0", "", ""];
      // } else if (that.value == "4") {
      //   args = [0, "2", "0", "", "0"];
      // } else if (that.value == "5") {
      //   args = [0, "2", "1", "", "0"];
      // } else if (that.value == "6") {
      //   args = [0, "2", "0", "", "1"];
      // } else if (that.value == "7") {
      //   args = [0, "2", "1", "", "1"];
      // } else if (that.value == "") {
      //   args = [0, "", "", "", ""];
      // }

      if (that.value == "2") {
        args = [0, "1", "1", "", ""];
      } else if (that.value == "3") {
        args = [0, "1", "0", "", ""];
      } else if (that.value == "") {
        args = [0, "1", "0", "", ""];
      } else {
        if (that.value % 2 == 0) {
          args = [0, "2", "0", "", (that.value - 4) / 2];
        } else {
          args = [0, "2", "1", "", (that.value - 5) / 2];
        }
      }
      that.getNftList(...args);
    },

    async getWholeListNew() {
      let that = this;
      let args = [];

      if (that.value == "2") {
        args = [0, "1", "1", ""];
      } else if (that.value == "3") {
        args = [0, "1", "0", ""];
      } else if (that.value == "4") {
        args = [0, "2", "0", ""];
      } else if (that.value == "5") {
        args = [0, "2", "1", ""];
      }
      that.getNftList(...args);
      // is_all, order_by, is_desc, token_id
      // if (that.value == "2") {
      //   that.getNftList(0, "1", "1", "");
      // } else if (that.value == "3") {
      //   that.getNftList(0, "1", "0", "");
      // } else if (that.value == "4") {
      //   that.getNftList(0, "2", "0", "");
      // } else if (that.value == "5") {
      //   that.getNftList(0, "2", "1", "");
      // }
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
    getAssets(item) {
      let that = this;
      that.$router.push({
        name: "assetsmarket",
        params: {
          tokenId: item.token_id,
        },
      });
    },
    async getNftList(is_all, order_by, is_desc, token_id, pay_kind) {
      let that = this;
      // that.showLoading = true;
      // address,
      // page,
      // per_page,
      // is_all,
      // order_by,
      // is_desc,
      // token_id
 
      if (!that.disabledFlag) {
        that.disabledFlag = true;
        let res = await getList(
          that.myAddress,
          that.page + 1,
          that.limit,
          is_all,
          order_by,
          is_desc,
          token_id,
          pay_kind
        );
        if (res.code == 200) {
          that.list = that.list.concat(res.data.content);
          that.total = res.data.content.length;
          that.disabled = res.data.last;
          that.page += 1;
          that.list.forEach((item) => {
            token.erc20.forEach((erc) => {
              if (item.pay_kind == erc.value) {
                item.price_img = require(`../assets/img/market/icon/${erc.img}`);
              }
            });
          });
          that.disabledFlag = false;
        }
      }
    },
    async postLikeOrNoLike(item) {
      let that = this;
      if (!window.ethereum || that.myAddress == "") {
        return;
      }
      let res = {};
      var obj = {
        address: that.myAddress.toLowerCase(),
        token_id: item.token_id,
      };
      if (item.if_like == 0) {
        item.if_like = 1;
        item.like_count += 1;
        res = await addTokenLike(obj);
      } else {
        item.if_like = 0;
        item.like_count -= 1;
        res = await deleteTokenLike(obj);
      }
    },
    searchById(e) {
      let that = this;
      that.showLoading = true;
      that.value2 = "1";
      that.value = "";
      var keyCode = window.event ? e.keyCode : e.which;

      if (keyCode == 13) {
        that.list.length = 0;
        // is_all, order_by, is_desc, token_id, part
        that.page = -1;
        that.getNftList(0, 0, 0, that.formateSpe(that.s_id), "");
        that.showLoading = false;
      }
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
    formateSpe(keyword) {
      var Special_symbols =
        /[_+=[！\/!`@#$%^&*()￥……（）{}-【】;:："“”> |、<>《》.。?？，',\\\]]/g;
      keyword = keyword.replace(Special_symbols, "a");
      return keyword;
    },
  },
  filters: {
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

    str_Price(v) {
      if (v.length >= 18) {
        let str1 = v.slice(0, 9);
        return str1 + "...";
      }
      return v;
    },
  },
  computed: {
    options() {
      let that = this;
      let arr = [
        {
          value: "2",
          // label: "Date：Oldest",
          label: that.$i18n.t("dateold"),
        },
        {
          value: "3",
          label: that.$i18n.t("datenew"),
        },
      ];

      let count = 3;
      token.erc20.forEach((item) => {
        let obj = {
          value: ++count,
          label: item.label + that.$i18n.t("pricehigh"),
        };
        let obj1 = {
          value: ++count,
          label: item.label + that.$i18n.t("pricelow"),
        };
        arr.push(obj, obj1);
      });

      // return [
      //   {
      //     value: "2",
      //     // label: "Date：Oldest",
      //     label: that.$i18n.t("dateold"),
      //   },
      //   {
      //     value: "3",
      //     label: that.$i18n.t("datenew"),
      //   },
      //   {
      //     value: "4",
      //     label: "PSC " + that.$i18n.t("pricehigh"),
      //   },
      //   {
      //     value: "5",
      //     label: "PSC " + that.$i18n.t("pricelow"),
      //   },
      //   {
      //     value: "6",
      //     label: "WDC " + that.$i18n.t("pricehigh"),
      //   },
      //   {
      //     value: "7",
      //     label: "WDC " + that.$i18n.t("pricelow"),
      //   },
      // ];
      return arr;
    },
  },
};
</script>

<style scoped lang="less" src="@/assets/css/home.less"></style>
