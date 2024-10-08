import express from "express";
import UserRouter from "./routes/user.route";
import rideRouter from "./routes/ride.route";
import sessionRoute from "./routes/session.route";
import driverRoute from "./routes/driver.route";
import cookieParser from "cookie-parser";

export function createApp() {
    const app = express();
    app.use(express.json());
    app.use(cookieParser());

    app.get("/", (req, res) => {
        res.send("hello");
    });

    app.use("/user", UserRouter);
    app.use("/ride", rideRouter);
    app.use("/session", sessionRoute);
    app.use("/driver", driverRoute);

    return app;
}
