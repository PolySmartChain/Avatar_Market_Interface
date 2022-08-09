import axios from "./http";
import qs from "qs";

var getTokenID = function () {
  return axios.get("/tokenId/get_unused");
};
var getCannerFee = function () {
  return axios.get("/tokenId/fee");
};

var get_poly_jet_address = function () {
  return axios.get("/get_poly_jet_address");
};

var get_unused = function (type) {
  return axios.get("/poly_jet/get_unused?type=" + type);
};
var fee = function () {
  return axios.get("/poly_jet/fee");
};
var get_user_data = function (address, page, limit) {
  return axios.get(
    "/users/get_user_data?address=" +
      address +
      "&page=" +
      page +
      "&limit=" +
      limit
  );
};


var get_avatar_detail = function (tokenId) {
  return axios.get("/users/get_avatar_detail?tokenId=" + tokenId);
};



export {
  get_poly_jet_address,
  get_unused,
  fee,
  get_user_data,
  get_avatar_detail,
};

function getJson(data) {
  return qs.stringify(data);
}
