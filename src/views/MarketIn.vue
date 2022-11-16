<template>
  <div class="wrap">
    <madcanner_header :current_route="current"></madcanner_header>
    <div class="wrap_main">
      <div class="banner-col">
        <div class="banner-item">
          <div class="shadow-item"></div>
          <div class="info-item">
            <div class="title">PolyJet Market</div>
            <div class="msg">
              PolyJet MarketPolyJet MarketPolyJet MarketPolyJet MarketPolyJet
              MarketPolyJet Market PolyJet MarketPolyJet MarketPolyJet
              MarketPolyJet Market.
            </div>
            <div class="btn-col">Enter</div>
          </div>
        </div>
        <div class="banner-item potion_banner">
          <div class="shadow-item"></div>
          <div class="info-item">
            <div class="title">PolyPotion Market</div>
            <div class="msg">
              PolyJet MarketPolyJet MarketPolyJet MarketPolyJet MarketPolyJet
              MarketPolyJet Market PolyJet MarketPolyJet MarketPolyJet
              MarketPolyJet Market.
            </div>
            <div class="btn-col">Enter</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import madcanner_header from "@/components/header.vue";
export default {
  data() {
    return {
      current: "market",
    };
  },
  components: {
    madcanner_header,
  },
};
</script>
<style lang="less" scoped>
.wrap_main {
  .banner-col {
    padding: 48px;
    .info-item {
      padding: 0 106px;
      position: relative;
      z-index: 10;
      color: #fff;
      display: flex;
      flex-direction: column;
      
    }
    .title {
      font-size: 84px;
      margin-top: 90px;
    }

    .msg {
      font-size: 18px;
      margin-top: 24px;
      color: rgba(255, 255, 255, 0.5);
      max-width: 760px;
    }
    .btn-col {
      font-size: 16px;
      width: 148px;
      height: 46px;
      border: 1px solid #fff;
      border-radius: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 24px;
      cursor: pointer;
    }
    .shadow-item {
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      position: absolute;
    }
    .banner-item {
      position: relative;
      background: url(../assets/img/market/poly_market.png) no-repeat center;
      background-size: cover;
      height: 426px;
    }
    .potion_banner {
      background: url(../assets/img/market/potion_market.png) no-repeat center;
      background-size: cover;
      margin-top: 48px;
      .title,.msg{
        text-align: right;
      }
      .info-item{
        align-items: flex-end;
      }
    }
  }
}
</style>
