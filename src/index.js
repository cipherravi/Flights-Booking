const express = require("express");
const app = express();
const { ServerConfig } = require("./config");
const apiRoutes = require("./routes");
const getLogger = require("./config/logger-config");

const logger = getLogger(__filename);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, () => {
  logger.info(`Server started running at PORT :: ${ServerConfig.PORT}`);
});
