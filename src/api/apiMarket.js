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

var on_deposit = function (data) {
  return axios.post("/market/on_deposit", data, {
    headers: { "Content-Type": "application/json" },
  });
};

var get_gmd_by_token_id = function (page, per_page, token_id, nft_addr) {
  return axios.get(
    "/market/get_gmd_by_token_id?page=" +
      page +
      "&per_page=" +
      per_page +
      "&token_id=" +
      token_id +
      "&nft_addr=" +
      nft_addr
  );
};

export { getTokenID, getList, on_deposit, get_gmd_by_token_id, sell_status };

function getJson(data) {
  return qs.stringify(data);
}
