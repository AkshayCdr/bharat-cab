import { Ride } from "../dtos/ride.dto";
import { User } from "../dtos/user.dto";
import { getDriverId, getLocation, getUserId } from "../model/ride.model";
import { driver } from "../services/driver.services";
import { rideServices } from "../services/ride.services";
import { DriverSocket } from "../types/driverSocket";
import { clientSock } from "./client.socket";

const driverSocket: DriverSocket = {};

function registerDriverSocket(socket: {
    on: (arg0: string, arg1: (driverID: string) => void) => void;
}) {
    socket.on("registerDriver", (driverID) => {
        console.log("driver reg with id:", driverID);
        driverSocket[driverID] = socket;
    });
}

function setOffline(socket: {
    on: (arg0: string, arg1: (driverID: string) => void) => void;
}) {
    socket.on("setOffline", (driverID) => {
        console.log(`driver id ${driverID} went offline`);
        delete driverSocket[driverID];
    });
}

async function rideAccepted(socket: {
    on: (arg0: string, arg1: (rideData: any) => Promise<void>) => void;
}) {
    socket.on("driverAccept", async (rideData) => {
        const { driverId, rideId, userId } = rideData;

        const { status } = await rideServices.getStatus(rideId);

        const isCancelled = status === "cancelled";
        if (isCancelled) return;

        await rideServices.setDriver(rideId, driverId);
        await rideServices.updateStatus(rideId, "driver_accepted");

        const driverDetails = await driver.get(driverId);
        clientSock.rideAccepted(userId, driverDetails);
        lockRide(socket, driverId);
    });
}

function lockRide(
    socket: {
        on: (arg0: string, arg1: (rideData: any) => Promise<void>) => void;
    },
    driverId: string
) {
    emitEventToAllDriver("lockRide", driverId);
}

async function updateLocation(socket: {
    on: (arg0: string, arg1: (data: any) => Promise<void>) => void;
}) {
    socket.on("updateLocation", async (data) => {
        const { rideId, latitude, longitude } = data;
        const { user_id } = await rideServices.read(rideId);

        await clientSock.sendLocation(user_id, latitude, longitude);

        let { source, destination } = await getLocation(rideId);

        const rideLocation = rideServices.renameCoordinates({
            longitude,
            latitude,
        });

        const rideDistanceFromSource = await rideServices.getDistance(
            rideLocation,
            source
        );

        const rideDistanceFromDestination = await rideServices.getDistance(
            rideLocation,
            destination
        );

        eventRideNearby(rideDistanceFromSource, user_id, rideId);
        eventRideStart(rideDistanceFromSource, user_id, rideId);
        eventRideEnd(rideDistanceFromDestination, user_id, rideId);
    });
}

async function eventRideNearby(
    rideDistanceFromSource: number,
    user_id: string,
    rideId: string
) {
    const isRideNearby =
        rideDistanceFromSource &&
        rideDistanceFromSource < 2 &&
        rideDistanceFromSource > 0.5;
    if (!isRideNearby) return;

    await rideNearby(user_id, rideId);
}

async function eventRideStart(
    rideDistanceFromSource: number,
    user_id: string,
    rideId: string
) {
    const isRideStarted =
        (rideDistanceFromSource || rideDistanceFromSource === 0) &&
        rideDistanceFromSource <= 0.5 &&
        rideDistanceFromSource >= 0;

    if (!isRideStarted) return;
    await startRide(user_id, rideId);
}

async function eventRideEnd(
    rideDistanceFromDestination: number,
    user_id: string,
    rideId: string
) {
    const { status } = await rideServices.getStatus(rideId);

    const isRideStarted = status === "onride";

    if (!isRideStarted) return;

    const isRideEnded =
        (rideDistanceFromDestination || rideDistanceFromDestination === 0) &&
        rideDistanceFromDestination <= 0.5 &&
        rideDistanceFromDestination >= 0;

    if (!isRideEnded) return;

    await endRide(user_id, rideId);
}

async function rideNearby(userId: string, rideId: string) {
    await rideServices.updateStatus(rideId, "started");
    clientSock.rideNearby(userId, rideId);
}

async function startRide(userId: string, rideId: string) {
    await rideServices.updateStatus(rideId, "onride");
    clientSock.startRide(userId, rideId);
}

async function endRide(userId: string, rideId: string) {
    await rideServices.updateStatus(userId, "ride_ended");
    clientSock.endRide(userId, rideId);

    const { driverId } = await getDriverId(rideId);

    emitEventToDriver("endRide", driverId, "");
}

async function requestForRide(rideDetails: Ride & User) {
    await rideServices.updateStatus(rideDetails.id, "requested");
    emitEventToAllDriver("rideRequest", rideDetails);
}

async function cancelRide(rideId: string) {
    const { driverId } = await getDriverId(rideId);

    console.log("driver id inside cancel ride ");
    console.log(driverId);

    if (!driverId) return emitEventToAllDriver("cancelRide", rideId);

    emitEventToDriver("cancelRide", driverId, "");
}

function emitEventToAllDriver(eventName: string, data: any) {
    for (let driverId in driverSocket) {
        emitEventToDriver(eventName, driverId, data);
    }
}

function emitEventToDriver(eventName: string, driverId: string, data: any) {
    if (driverSocket[driverId]) {
        driverSocket[driverId].emit(eventName, data);
    }
}

function isDriverExist(socket: any) {
    return Object.values(driverSocket).includes(socket);
}

function deleteClient(socket: any) {
    for (let driverId in driverSocket) {
        if (driverSocket[driverId] === socket) {
            console.log(`driver with ${driverId} disconnected`);
            delete driverSocket[driverId];
            break;
        }
    }
}

export const driverSock = {
    registerDriverSocket,
    setOffline,
    rideAccepted,
    updateLocation,
    requestForRide,
    cancelRide,
    isDriverExist,
    deleteClient,
};
