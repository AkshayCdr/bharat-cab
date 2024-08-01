import L from "leaflet";

const square = new L.Icon({
  iconUrl: "/home.jpg",
  iconAnchor: null,
  popupAnchor: null,
  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(45, 45),
});

const car = new L.Icon({
  iconUrl: "/public/car.svg",

  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(45, 45),
});

const source = new L.Icon({
  iconUrl: "/public/source.svg",

  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(25, 25),
});

const destination = new L.Icon({
  iconUrl: "/public/destination.svg",

  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(25, 25),
});

const distance = new L.Icon({
  iconUrl: "/public/distance.svg",

  shadowUrl: null,
  shadowSize: null,
  shadowAnchor: null,
  iconSize: new L.Point(60, 75),
});

export const Icon = {
  square,
  car,
  source,
  destination,
  distance,
};
