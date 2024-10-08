/* eslint-disable import/no-unresolved */
import {
    ActionFunctionArgs,
    LinksFunction,
    LoaderFunctionArgs,
    redirect,
} from "@remix-run/node";
import LocationInput from "~/component/LocationInput";
import { ride } from "~/apis/ride.server";

import { json, useLoaderData } from "@remix-run/react";
import { user } from "~/apis/user.server";

import styles from "~/styles/user.css?url";

import useMapDetails from "~/hooks/useMapDetails";

import Mapcontainer from "~/component/Mapcontainer";
import { useAuth } from "~/context/authContext";
import { useEffect } from "react";

import { account } from "~/apis/account.server";

export interface User {
    account_id: string;
    name: string;
    email: string;
    phone: string;
}

interface LocationData {
    source: Coordinates;
    destination: Coordinates;
}

export type Coordinates = {
    longitude?: number;
    latitude?: number;
};

export function parseCoordinates(input: string) {
    const [latitude, longitude] = input.split(",").map(parseFloat);
    return { latitude, longitude };
}

export function formatSourceDestination(
    sourceInput: string,
    destinationInput: string
) {
    const isSourceOrDestinationExist = !sourceInput || !destinationInput;

    if (isSourceOrDestinationExist) return null;

    return {
        source: parseCoordinates(sourceInput),
        destination: parseCoordinates(destinationInput),
    };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const cookies = request.headers.get("cookie");

    const response = await account.getAccountId(cookies);

    if (!response?.accountId) {
        throw redirect("/login");
    }

    const userData = await user.getDetails(response.accountId, cookies);

    if (!userData) {
        throw json({ message: "Could not find user details " });
    }

    return json({ userData });
};

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();

    const userId = String(formData.get("userId"));

    const sourceString = String(formData.get("source"));
    const destinationString = String(formData.get("destination"));

    const data = formatSourceDestination(sourceString, destinationString);

    if (!data) {
        return { message: "select source/destination" };
    }

    const { source, destination } = data;

    const rideDetails = {
        userId,
        source,
        destination,
    };

    const rideId = await ride.setLocation(
        rideDetails,
        request.headers.get("cookie")
    );

    if (!rideId) {
        throw new Response("cannot get ride Id ");
    }

    return redirect(`/ride/${rideId}`);
}

export default function User() {
    const { userData } = useLoaderData<typeof loader>();

    const { dispatch } = useAuth();

    useEffect(() => {
        localStorage.setItem("auth", userData.account_id);
        dispatch({
            type: "account/login",
            payload: {
                accountId: userData.account_id,
                accountName: userData.name,
            },
        });
    }, [dispatch, userData.account_id, userData.name]);

    const {
        source,
        destination,
        setSource,
        setDestination,
        sourceName,
        setSourceName,
        destinationName,
        setDestinationName,
        isEditable,
        isMounted,
        isSourceSet,
        setIsSourceSet,
    } = useMapDetails();

    if (!isMounted) {
        return <h1>Loading ...</h1>;
    }

    return (
        <div className="flex flex-col lg:flex-row  bg-gray-950 text-white min-h-screen justify-center ">
            <div className="lg:w-1/4 w-full p-5">
                <LocationInput
                    userId={userData.account_id}
                    sourceName={sourceName}
                    destinationName={destinationName}
                    source={source}
                    destination={destination}
                    setSourceName={setSourceName}
                    setDestinationName={setDestinationName}
                    setSource={setSource}
                    setDestination={setDestination}
                    setIsSourceSet={setIsSourceSet}
                />
            </div>
            <div className="mt-10 lg:w-3/4 w-full p-5">
                <Mapcontainer
                    source={source}
                    destination={destination}
                    setSource={setSource}
                    setDestination={setDestination}
                    setSourceName={setSourceName}
                    setDestinationName={setDestinationName}
                    isEditable={isEditable}
                    isSourceSet={isSourceSet}
                    setIsSourceSet={setIsSourceSet}
                ></Mapcontainer>
            </div>
        </div>
    );
}

export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];
