<template>
  <div class="loading-trans">
    <div class="table-div">
      <div class="align-middle">
        <div><img class="roteimg" src="../assets/img/loading.png" /></div>
        <p>{{ mess }}</p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  props: {
    mess: {
      default: "waiting...",
    },
  },
};
</script>
<style lang="less" scoped>
/*loading*/
.loading-trans {
  position: fixed;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);

  .table-div {
    display: table;
    width: 100%;
    height: 100%;
    .align-middle {
      display: table-cell;
      vertical-align: middle;
      text-align: center;
      p {
        font-size: 16px;
        color: #fff;
      }
    }
    .roteimg {
      animation: loading 1s infinite linear;
      -webkit-animation: loading 1s infinite linear;
      -moz-animation: loading 1s infinite linear;
    }
  }
}
@keyframes loading {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(180deg);
  }
}

@-webkit-keyframes loading {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(180deg);
  }
}

@-moz-keyframes loading {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(180deg);
  }
}
</style>
