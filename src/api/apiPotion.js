import axios from "./httpPotion";
import qs from "qs";

var get_potion = function (address, page, limit) {
  return axios.get(
    "/users/get_potion?address=" + address + "&page=" + page + "&limit=" + limit
  );
};

var get_potion_detail = function (tokenId) {
  return axios.get("/users/get_potion_detail?tokenId=" + tokenId);
};

var get_poly_potion_address = function () {
  return axios.get("/get_poly_potion_address");
};

export { get_poly_potion_address, get_potion, get_potion_detail };

function getJson(data) {
  return qs.stringify(data);
}
