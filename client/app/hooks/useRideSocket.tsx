import { useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import { socket } from "~/socket/websocket";

export default function useRideSocket(rideDetails) {
  const [isRideAccepted, setRideStatus] = useState(false);
  const [driverDetails, setDriverDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const handleRideAccepted = (driverDetails) => {
      console.log("ride accepted by driver ", driverDetails);
      setRideStatus(true);
      setDriverDetails(driverDetails);
      navigate(`/finalPageUser/${rideDetails.id}`);
    };

    socket.emit("registerClient", rideDetails.user_id);
    socket.on("rideAccepted", handleRideAccepted);

    return () => {
      socket.off("registerClient");
      socket.off("rideAccepted", handleRideAccepted);
    };
  }, []);

  return { isRideAccepted, driverDetails };
}
