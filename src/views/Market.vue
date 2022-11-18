<template>
  <div
    class="wrap"
    v-infinite-scroll="getNftList"
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
                  page = 1;
                  getNftList();
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
import { get_poly_jet_address } from "@/api/api";
import { ethers } from "ethers";
import token from "@/contract/token";
export default {
  name: "market",
  data() {
    return {
      token: token.erc20,
      polyject_adderss: "",
      value: "",
      value2: "1",
      list: [],
      myAddress: "",
      s_id: "",
      showLoading: false,
      message: "waiting",
      page: 1,
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
    await that.see_poly_jet_address();
    that.getNftList();
  },
  components: {
    madcanner_header,
    loading,
  },
  methods: {
    async getNftList() {
      let that = this;
      let res = await getList(
        "",
        that.page,
        that.limit,
        Number(that.value) - 1,
        "",
        that.polyject_adderss
      );
      if (res.code == 200) {
        that.list = that.list.concat(res.data);
        that.page += 1;
        that.list.forEach((item) => {
          token.erc20.forEach((erc) => {
            if (item.pay_kind == erc.value) {
              item.price_img = require(`../assets/img/market/icon/${erc.img}`);
            }
          });
        });
      }
    },

    async see_poly_jet_address() {
      let that = this;
      let res = await get_poly_jet_address();
      that.polyject_adderss = res.data;
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
          nftInMarket: JSON.stringify(item),
        },
      });
    },

    searchById(e) {
      let that = this;
      that.showLoading = true;
      that.value = "";
      var keyCode = window.event ? e.keyCode : e.which;

      if (keyCode == 13) {
        that.list.length = 0;
        // is_all, order_by, is_desc, token_id, part

        that.page = -1;
        console.log(that.s_id);
        that.getNftList(
          "",
          that.page,
          that.limit,
          Number(that.value) - 1,
          that.s_id,
          that.polyject_adderss
        );
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
      return arr;
    },
  },
};
</script>

<style scoped lang="less" src="@/assets/css/home.less"></style>
