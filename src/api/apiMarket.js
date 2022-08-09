import axios from "./httpMarket";
import qs from "qs";

var getTokenID = function () {
  return axios.get("/tokenId/get_unused");
};

var getList = function (
  address,
  page,
  per_page,
  is_all,
  order_by,
  is_desc,
  token_id,
  pay_kind
) {
  return axios.get(
    "/market/get_sjd_by_owner?owner=" +
      address +
      "&page=" +
      page +
      "&per_page=" +
      per_page +
      "&is_all=" +
      is_all +
      "&order_by=" +
      order_by +
      "&is_desc=" +
      is_desc +
      "&token_id=" +
      token_id +
      "&pay_kind=" +
      pay_kind
  );
};
var getTopNfts = function (start, page, per_page, order_by, is_desc) {
  return axios.get(
    "/market/get_top_nfts?start_time=" +
      start +
      "&page=" +
      page +
      "&per_page=" +
      per_page +
      "&order_by=" +
      order_by +
      "&is_desc=" +
      is_desc,
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
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

var addTokenLike = function (data) {
  return axios.post("/market/add_token_like", data, {
    headers: { "Content-Type": "application/json" },
  });
};

var deleteTokenLike = function (data) {
  return axios.post("/market/delete_token_like", data, {
    headers: { "Content-Type": "application/json" },
  });
};

var getAvatarDtl = function (tokenId) {
  return axios.get("/users/get_avatar_detail?tokenId=" + tokenId);
};
var changeAvatar = function (hash) {
  return axios.get("/users/change_avatar?hash=" + hash);
};

var on_deposit = function (data) {
  return axios.post("/market/on_deposit", data, {
    headers: { "Content-Type": "application/json" },
  });
};

var on_withdraw = function (data) {
  return axios.post("/market/on_withdraw", data, {
    headers: { "Content-Type": "application/json" },
  });
};
var on_set_price = function (data) {
  return axios.post("/market/on_set_price", data, {
    headers: { "Content-Type": "application/json" },
  });
};

var get_the_lowest_price = function () {
  return axios.get("/market/get_the_lowest_price");
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
var on_cancel = function (data) {
  return axios.post("/market/on_cancel", data, {
    headers: { "Content-Type": "application/json" },
  });
};

export {
  getTokenID,
  getList,
  getAvatarDtl,
  changeAvatar,
  getTopNfts,
  getGmd,
  addTokenLike,
  deleteTokenLike,
  on_deposit,
  on_withdraw,
  on_set_price,
  get_the_lowest_price,
  get_gmd_by_token_id,
  get_token_on_deposit,
  on_cancel,
};

function getJson(data) {
  return qs.stringify(data);
}
