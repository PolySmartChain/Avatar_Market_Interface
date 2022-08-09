import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    locale:""
  },
  mutations: {
    switchLocale(state,l){
      state.locale = l;
    }
  },
  actions: {},
  modules: {},
});
