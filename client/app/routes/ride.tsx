/* eslint-disable import/no-unresolved */
import { useState } from "react";
import { useActionData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  json,
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { ride } from "~/apis/ride";
import RideDetails from "~/component/RideDetails";

import DriverDetails from "~/component/DriverDetails";

import styles from "../styles/ride.css?url";
import useRideDetails from "~/hooks/useRideDetails";
import useRideSocket from "~/hooks/useRideSocket";

import { requireRideCookie } from "~/utils/rideCookie.server";
import { requireAuthCookie } from "~/utils/auth.server";
import { formatSourceDestination } from "./user/route";

export interface Ride {
  id: string;
  source: Coordinates;
  destination: Coordinates;
  price: string;
  user_id: string;
}

type Coordinates = {
  x?: number;
  y?: number;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const intent = formData.get("intent");

  const isCancel = intent === "cancel";
  const isUpdate = intent === "update";
  const isRequestForRide = intent === "request-for-ride";

  const rideId = String(await requireRideCookie(request));

  if (isRequestForRide) {
    const message = await ride.requestForRide(rideId);
    return json({ message });
  }

  if (isUpdate) {
    console.log("inside update");
    const userId = String(await requireAuthCookie(request));
    const sourceString = String(formData.get("source"));
    const destinationString = String(formData.get("destination"));

    console.log(`destination string is ${destinationString}`);
    console.log(`source string is${sourceString}`);

    const data = formatSourceDestination(sourceString, destinationString);

    if (!data) {
      return { message: "select source/destination" };
    }

    const { source, destination } = data;

    console.log(source);
    console.log(destination);

    const message = await ride.updateRide({
      rideId,
      userId,
      source,
      destination,
    });
    return json({ message });
  }

  if (isCancel) {
    const message = await ride.cancelRide(rideId);
    return json({ message });
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const rideId = await requireRideCookie(request);

  const rideDetails: Ride = await ride.getRideDetails(rideId);

  if (!rideDetails) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ rideDetails });
};

export default function Ride() {
  const [isEditable, setIsEditable] = useState(true);
  const [isRideCancelled, setRideCancelled] = useState(false);

  const message = useActionData<typeof action>();

  const {
    rideDetails,
    source,
    destination,
    setSource,
    setDestination,
    MapComponent,
    sourceName,
    destinationName,
    setSourceName,
    setDestinationName,
  } = useRideDetails();

  const { isRideAccepted, driverDetails } = useRideSocket({
    rideDetails,
    isRideCancelled,
  });

  return (
    <div className="flex flex-row">
      <p className="flex flex-col">
        <RideDetails
          rideDetails={rideDetails}
          sourceName={sourceName}
          destinationName={destinationName}
        />
        {isRideAccepted ? (
          <DriverDetails driverDetails={driverDetails} />
        ) : (
          message && <p className="ride-message">{message.message}</p>
        )}
      </p>
      {MapComponent && (
        <MapComponent
          source={source}
          destination={destination}
          setSource={setSource}
          setDestination={setDestination}
          setSourceName={setSourceName}
          setDestinationName={setDestinationName}
          isEditable={isEditable}
        />
      )}
    </div>
  );
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
