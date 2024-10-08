import {
    ActionFunctionArgs,
    LinksFunction,
    LoaderFunctionArgs,
    json,
    redirect,
} from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";

import { ride } from "~/apis/ride.server";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import useLocation from "~/hooks/useLocation";
import useRideDetails, { RideDetails } from "~/hooks/useRideDetails";
import Details from "../component/Details";

import useRoute from "~/hooks/useRoute";

import Mapcontainer from "~/component/Mapcontainer";
import useRideEvents from "~/hooks/useRideEvents";

// import socket from "~/socket/socket.client";
import socketIntance from "~/socket/socketInstance.client";
import style from "~/styles/finalPageDriver.css?url";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const cookies = request.headers.get("cookie");
    const { rideId } = params;

    if (!rideId) {
        throw new Response("Not Found", { status: 404 });
    }
    const rideDetails = await ride.getRideAndUser(rideId, cookies);

    if (!rideDetails) {
        throw new Response("Not Found", { status: 404 });
    }

    return json({ rideDetails });
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const { intent } = Object.fromEntries(formData);

    const isCancel = intent === "cancel";
    if (!isCancel) return null;
    const rideId = String(formData.get("rideId"));
    const cookie = request.headers.get("cookie");

    await ride.cancelRide(rideId, cookie);

    return redirect("/");
}

export default function FinalPageDriver() {
    const role = "driver";

    const { rideDetails } = useLoaderData<typeof loader>();

    const { source, destination, sourceName, destinationName } =
        useRideDetails(rideDetails);

    const { currentLocation } = useLocation(rideDetails.id);

    const [rideState, setRideState] = useState("idle");

    const [isEditable, setIsEditable] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [isRideStarted, setRideStarted] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const socket = socketIntance.getInstance();
        function handleCancelRide() {
            alert("ride cancelled ...");
            navigate("/login");
        }

        socket.on("startRide", () => {
            setRideStarted(true);
            setRideState("started");
        });
        socket.on("endRide", () => setRideState("ended"));
        socket.on("rideNearby", () => setRideState("nearby"));
        socket.on("cancelRide", handleCancelRide);

        return () => {
            socket.off("startRide");
            socket.off("cancelRide", handleCancelRide);
            socket.off("endRide");
        };
    }, [navigate]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <h1>Loading ....</h1>;
    }

    return (
        <div className="flex flex-col lg:flex-row  p-3 bg-gray-950 text-white min-h-screen justify-center">
            <div className="flex flex-col m-4 p-2 lg:w-1/4 w-full">
                <Details
                    rideDetails={rideDetails}
                    sourceName={sourceName}
                    destinationName={destinationName}
                    role={role}
                    rideState={rideState}
                    setRideState={setRideState}
                />
            </div>
            <div className="mt-10 lg:w-3/4 w-full p-5">
                <Mapcontainer
                    source={source}
                    destination={destination}
                    isEditable={isEditable}
                    rideLocation={currentLocation}
                    isRideStarted={isRideStarted}
                    rideStatus={rideState}
                />
            </div>
        </div>
    );
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: style }];
