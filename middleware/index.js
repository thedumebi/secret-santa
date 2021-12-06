const cors = require("./cors");
const auth = require("./auth");
const error = require("./error");

module.exports = {
  ...cors,
  ...auth,
  ...error,
};
