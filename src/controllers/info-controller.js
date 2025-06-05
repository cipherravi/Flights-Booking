function info(req, res) {
  res.json({ Status: "OK", SERVICE: "BOOKING" });
}

module.exports = info;
