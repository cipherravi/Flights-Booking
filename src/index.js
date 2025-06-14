const express = require("express");
const cookieParser = require("cookie-parser");
const { serverConfig } = require("./config");
const apiRoutes = require("./routes");
const getLogger = require("./config/logger-config");
const { removeTempBooking } = require("./utils/helper/cleanUp-cron");
const app = express();

const logger = getLogger(__filename);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", apiRoutes);

app.listen(serverConfig.PORT, () => {
  removeTempBooking();

  logger.info(`Server started running at PORT :: ${serverConfig.PORT}`);
});
