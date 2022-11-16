import axios from "./httpMarket";
import qs from "qs";

var getTokenID = function () {
  return axios.get("/tokenId/get_unused");
};

var sell_status = function (owner, nft_address, token_id) {
  return axios.get(
    "/market/sell_status?owner=" +
      owner +
      "&nft_address=" +
      nft_address +
      "&token_id=" +
      token_id
  );
};

var getList = function (address, page, per_page, order_by, token_id, nft_addr) {
  return axios.get(
    "/market/get_sjd_by_owner?owner=" +
      address +
      "&page=" +
      page +
      "&per_page=" +
      per_page +
      "&order_by=" +
      order_by +
      "&token_id=" +
      token_id +
      "&nft_addr=" +
      nft_addr
  );
};

var get_token_on_deposit = (tokenIDList) => {
  return axios.get("market/get_token_on_deposit?token_id_list=" + tokenIDList);
};

var getGmd = function (owner, page, per_page) {
  return axios.get(
    "/market/get_gmd_by_owner?owner=" +
      owner +
      "&page=" +
      page +
      "&per_page=" +
      per_page
  );
};

var on_deposit = function (data) {
  return axios.post("/market/on_deposit", data, {
    headers: { "Content-Type": "application/json" },
  });
};

var get_gmd_by_token_id = function (tokenId, per_page, page) {
  return axios.get(
    "/market/get_gmd_by_token_id?token_id=" +
      tokenId +
      "&per_page=" +
      per_page +
      "&page=" +
      page
  );
};

var get_token_on_deposit = function (token_id_list) {
  return axios.get(
    "/market/get_token_on_deposit?token_id_list=" + token_id_list
  );
};

export {
  getTokenID,
  getList,
  getGmd,
  on_deposit,
  get_gmd_by_token_id,
  get_token_on_deposit,
  sell_status,
};

function getJson(data) {
  return qs.stringify(data);
}
