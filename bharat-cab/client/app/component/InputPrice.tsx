import { useEffect, useState } from "react";
import { useNavigation } from "@remix-run/react";
import { useFetcher } from "react-router-dom";

const getAutoCompleteData = async (input) => {
    const data = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&filter=countrycode:auto&apiKey=55b3a098f2a1408d8d10675b02843f50`
    );

    return data.json();
};

export default function InputPrice() {
    const fetcher = useFetcher();

    const navigation = useNavigation();

    const isSubmitting = navigation.state !== "idle";

    const { distance, price } = fetcher.data || [];

    console.log(price);
    useEffect(() => {
        if (price || distance) {
            setModalVisible(true);
        }
    }, [price, distance]);

    const [source, setSource] = useState("");
    const [destination, setDestination] = useState("");

    const [sourceCoords, setSourceCoords] = useState([]);
    const [destCoods, setDestCoords] = useState([]);

    const [autoCompleteSourceData, setAutoComSource] = useState([]);
    const [isAutoCompleteSource, setIsAutoCompleteSource] = useState(false);

    const [autoCompleteDestData, setAutoCompleteDestData] = useState([]);
    const [isAutoCompleteDestination, setIsAutoCompleteDestination] =
        useState(false);

    const [isModalVisible, setModalVisible] = useState(false);

    const handleClickSource = (locData) => {
        setSource(locData.name);
        setSourceCoords([locData.lat, locData.lon]);
        setAutoComSource([]);
        setIsAutoCompleteSource(false);
    };

    useEffect(() => {
        if (!source) return;
        getAutoCompleteData(source)
            .then(
                (result) =>
                    result?.features?.map(({ properties }) => ({
                        name: properties.formatted,
                        lon: properties.lon,
                        lat: properties.lat,
                    })) || []
            )
            .then(setAutoComSource)
            .catch(console.error);
    }, [source]);

    const handleClickDestination = (locData) => {
        setDestination(locData.name);
        setDestCoords([locData.lat, locData.lon]);
        setAutoCompleteDestData([]);
        setIsAutoCompleteDestination(false);
    };

    useEffect(() => {
        if (!destination) return;
        getAutoCompleteData(destination)
            .then(
                (result) =>
                    result?.features?.map(({ properties }) => ({
                        name: properties.formatted,
                        lon: properties.lon,
                        lat: properties.lat,
                    })) || []
            )
            .then(setAutoCompleteDestData)
            .catch(console.error);
    }, [destination]);

    return (
        <div className="text-black flex flex-col max-w-[380px] mt-14 gap-3 ">
            <input
                type="text"
                name="source"
                onFocus={() => setIsAutoCompleteSource(true)}
                onBlur={() =>
                    setTimeout(() => setIsAutoCompleteSource(false), 1000)
                }
                onChange={(e) => {
                    setSource(e.target.value);
                    setIsAutoCompleteSource(true);
                }}
                className="h-12 rounded-lg text-left px-4"
                placeholder="Enter location"
                autoComplete="off"
                value={source}
            />

            <Dropdown
                autoCompleteData={autoCompleteSourceData}
                isAutoComplete={isAutoCompleteSource}
                handleClick={handleClickSource}
            />

            <input
                type="text"
                name="destination"
                onFocus={() => setIsAutoCompleteDestination(true)}
                onBlur={() =>
                    setTimeout(() => setIsAutoCompleteDestination(false), 1000)
                }
                onChange={(e) => {
                    setDestination(e.target.value);
                    setIsAutoCompleteDestination(true);
                }}
                className="h-12 rounded-lg text-left px-4"
                placeholder="Enter destination"
                autoComplete="off"
                value={destination}
            />

            <Dropdown
                autoCompleteData={autoCompleteDestData}
                isAutoComplete={isAutoCompleteDestination}
                handleClick={handleClickDestination}
            />

            <fetcher.Form method="post" onSubmit={() => setModalVisible(true)}>
                <input
                    type="hidden"
                    name="source-coords"
                    value={sourceCoords}
                />
                <input
                    type="hidden"
                    name="destination-coords"
                    value={destCoods}
                />
                <button
                    type="submit"
                    className="text-black bg-white w-32 py-2 px-3 rounded-lg mt-4 hover:bg-slate-300 font-bold "
                >
                    See prices
                </button>
            </fetcher.Form>
            {isModalVisible && (
                <Modal
                    price={price}
                    distance={distance}
                    isSubmitting={isSubmitting}
                    setModalVisible={setModalVisible}
                />
            )}
        </div>
    );
}

function Dropdown({ autoCompleteData, isAutoComplete, handleClick }) {
    return (
        <div>
            {isAutoComplete && autoCompleteData.length > 0 && (
                <div className="dropdown">
                    <ul>
                        {autoCompleteData.map((loc, ind) => (
                            <li className="dropdown-list" key={ind}>
                                <button onClick={() => handleClick(loc)}>
                                    {loc.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function Modal({ price, distance, isSubmitting, setModalVisible }) {
    console.log(price);
    // if (isSubmitting) return <div className="text-white">Loading...</div>;
    return (
        <div
            className="fixed inset-0 h-full w-full bg-gray-950 bg-opacity-90"
            onClick={() => setModalVisible(false)}
        >
            <div className="fixed  left-1/2 top-1/2  transform -translate-x-1/2 -translate-y-1/2 ">
                <div className="flex flex-col gap-2 bg-yellow-50 justify-center items-center rounded-lg h-[500px] w-[750px] ">
                    <div className="flex flex-col gap-4 items-center border-2 border-black p-20 rounded-lg">
                        <div className="flex gap-4 items-center">
                            <span className="text-6xl font-extrabold">
                                Distance{" "}
                            </span>

                            {isSubmitting ? (
                                <Svg />
                            ) : distance ? (
                                <span className="text-4xl font-bold text-blue-700 border-b-2 border-b-gray-400">
                                    {distance}
                                </span>
                            ) : (
                                "NA"
                            )}
                        </div>
                        <div className="flex gap-4 items-center">
                            <span className="text-6xl font-extrabold border-b-2 border-b-gray-400 text-blue-700">
                                ₹
                            </span>
                            {isSubmitting ? (
                                <Svg />
                            ) : price ? (
                                <span className="text-4xl font-bold">
                                    {price}
                                </span>
                            ) : (
                                "NA"
                            )}
                        </div>
                    </div>
                    <button
                        className="absolute bottom-8 border-2 border-black px-6 py-1 rounded-lg hover:text-white hover:bg-black font-bold"
                        onClick={() => setModalVisible(false)}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function Svg() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            width={100}
            height={100}
        >
            <rect
                fill="#21030E"
                stroke="#21030E"
                strokeWidth="15"
                width="30"
                height="30"
                x="25"
                y="85"
            >
                <animate
                    attributeName="opacity"
                    calcMode="spline"
                    dur="2"
                    values="1;0;1;"
                    keySplines=".5 0 .5 1;.5 0 .5 1"
                    repeatCount="indefinite"
                    begin="-.4"
                ></animate>
            </rect>
            <rect
                fill="#21030E"
                stroke="#21030E"
                strokeWidth="15"
                width="30"
                height="30"
                x="85"
                y="85"
            >
                <animate
                    attributeName="opacity"
                    calcMode="spline"
                    dur="2"
                    values="1;0;1;"
                    keySplines=".5 0 .5 1;.5 0 .5 1"
                    repeatCount="indefinite"
                    begin="-.2"
                ></animate>
            </rect>
            <rect
                fill="#21030E"
                stroke="#21030E"
                strokeWidth="15"
                width="30"
                height="30"
                x="145"
                y="85"
            >
                <animate
                    attributeName="opacity"
                    calcMode="spline"
                    dur="2"
                    values="1;0;1;"
                    keySplines=".5 0 .5 1;.5 0 .5 1"
                    repeatCount="indefinite"
                    begin="0"
                ></animate>
            </rect>
        </svg>
    );
}
