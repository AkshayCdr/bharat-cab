import {
    ActionFunctionArgs,
    LoaderFunctionArgs,
    json,
    redirect,
} from "@remix-run/node";
import { ride } from "~/apis/ride.server";
import { useEffect, useState } from "react";

import useRideDetails, { RideDetails } from "~/hooks/useRideDetails";
import useRideLocation, { handleCancelRide } from "~/hooks/useRideLocation";
import Details from "~/component/Details";
import Review from "~/component/Review";

import Mapcontainer from "~/component/Mapcontainer";
import { useLoaderData } from "@remix-run/react";
import { parse } from "~/utils/auth.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const cookies = request.headers.get("cookie");
    const { rideId } = params;

    const rideDetails: RideDetails = await ride.getRideAndDriver(
        rideId,
        cookies
    );

    if (!rideDetails) {
        throw new Response("Not Found", { status: 404 });
    }

    return json({ rideDetails });
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const cookie = request.headers.get("cookie");
    const { intent } = Object.fromEntries(formData);

    const isReview = intent === "review";
    const isCancel = intent === "cancel";

    if (isReview) {
        const rideDetails = Object.fromEntries(formData);

        if (!rideDetails.review && !rideDetails.rating) {
            return { message: "add review/rating" };
        }

        if (!rideDetails.rating) {
            const updatedRideDetails = { ...rideDetails, rating: 0 };
            const message = await ride.setReview(updatedRideDetails, cookie);
            return message;
        }

        const message = await ride.setReview(rideDetails, cookie);

        return redirect(`/user`);
    }

    if (isCancel) {
        console.log("cancelling ride clicked ....");
        const rideId = String(formData.get("rideId"));

        await ride.cancelRide(rideId, cookie);
        console.log(rideId);
        // handleCancelRide(rideId);
        return redirect(`/`);
    }
}

export default function FinalPageUser() {
    const [isEditable, setIsEditable] = useState(false);
    const [isRideStarted, setRideStated] = useState(false);
    const [isRideEnded, setRideEnded] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const { rideDetails } = useLoaderData<typeof loader>();

    const { source, destination, sourceName, destinationName } =
        useRideDetails(rideDetails);

    const { rideLocation, rideStatus } = useRideLocation();

    const role = "user";

    useEffect(() => {
        switch (rideStatus) {
            case "nearby":
                alert("ride nearby");
                break;

            case "started":
                alert("ride started");
                setRideStated(true);
                break;

            case "ended": {
                alert("ride Ended");
                setRideEnded(true);
                break;
            }
        }
    }, [rideStatus]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <h1>Loading...</h1>;
    }

    return (
        <div className="flex flex-row m-5 p-3">
            <Details
                rideDetails={rideDetails}
                sourceName={sourceName}
                destinationName={destinationName}
                role={role}
            />

            <Mapcontainer
                source={source}
                destination={destination}
                isEditable={isEditable}
                rideLocation={rideLocation}
            ></Mapcontainer>

            {isRideStarted && <p>Ride is started change the location</p>}
            {isRideEnded && <Review rideId={rideDetails.id} />}
            {/* <Review rideId={rideDetails.id} /> */}
        </div>
    );
}
