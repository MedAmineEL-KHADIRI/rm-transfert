"use client";

import { motion } from "motion/react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

function StepThreeContent({
  clientType,
  departure,
  setDeparture,
  arrival,
  setArrival,
  coordinates,
  setCoordinates,
  arrivalCoordinates,
  setArrivalCoordinates,
  distanceKm,
  setDistanceKm,
  price,
  setPrice,
  formattedAddress,
  setFormattedAddress,
  errorMessage,
  setErrorMessage,
  isLoading,
  setIsLoading,
  departureInputRef,
  getDistanceInKm,
}: {
  clientType: string | null;
  departure: string;
  setDeparture: React.Dispatch<React.SetStateAction<string>>;
  arrival: string;
  setArrival: React.Dispatch<React.SetStateAction<string>>;
  coordinates: { lat: number; lng: number } | null;
  setCoordinates: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
  arrivalCoordinates: { lat: number; lng: number } | null;
  setArrivalCoordinates: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
  distanceKm: number | null;
  setDistanceKm: React.Dispatch<React.SetStateAction<number | null>>;
  price: number | null;
  setPrice: React.Dispatch<React.SetStateAction<number | null>>;
  formattedAddress: string;
  setFormattedAddress: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  departureInputRef: React.RefObject<HTMLInputElement | null>;
  getDistanceInKm: (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) => number;
}) {
  const placesLib = useMapsLibrary("places");
  const arrivalInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!placesLib || !departureInputRef.current) return;

    const departureAutocomplete = new placesLib.Autocomplete(
      departureInputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "fr" },
      }
    );

    departureAutocomplete.addListener("place_changed", () => {
      const place = departureAutocomplete.getPlace();

      if (place.formatted_address) {
        setDeparture(place.formatted_address);
        setCoordinates(null);
        setArrivalCoordinates(null);
        setDistanceKm(null);
        setPrice(null);
        setFormattedAddress("");
        setErrorMessage("");
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(departureAutocomplete);
    };
  }, [
    placesLib,
    departureInputRef,
    setDeparture,
    setCoordinates,
    setArrivalCoordinates,
    setDistanceKm,
    setPrice,
    setFormattedAddress,
    setErrorMessage,
  ]);

  useEffect(() => {
    if (!placesLib || !arrivalInputRef.current) return;

    const arrivalAutocomplete = new placesLib.Autocomplete(
      arrivalInputRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "fr" },
      }
    );

    arrivalAutocomplete.addListener("place_changed", () => {
      const place = arrivalAutocomplete.getPlace();

      if (place.formatted_address) {
        setArrival(place.formatted_address);
        setCoordinates(null);
        setArrivalCoordinates(null);
        setDistanceKm(null);
        setPrice(null);
        setFormattedAddress("");
        setErrorMessage("");
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(arrivalAutocomplete);
    };
  }, [
    placesLib,
    setArrival,
    setCoordinates,
    setArrivalCoordinates,
    setDistanceKm,
    setPrice,
    setFormattedAddress,
    setErrorMessage,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-center text-2xl font-bold">Votre trajet</h1>

        <p className="text-center text-sm text-slate-300">
          Type de client : {clientType}
        </p>

        <div className="relative">
          <input
            ref={departureInputRef}
            type="text"
            placeholder="Adresse de départ"
            value={departure}
            autoComplete="off"
            onChange={(e) => {
              setDeparture(e.target.value);
              setCoordinates(null);
              setArrivalCoordinates(null);
              setDistanceKm(null);
              setPrice(null);
              setFormattedAddress("");
              setErrorMessage("");
            }}
            className="w-full rounded-xl bg-white p-4 pr-12 text-black"
          />

          <button
            type="button"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;
                  setDeparture(`${lat}, ${lng}`);
                  setCoordinates(null);
                  setArrivalCoordinates(null);
                  setDistanceKm(null);
                  setPrice(null);
                  setFormattedAddress("");
                  setErrorMessage("");
                },
                () => {
                  alert("Impossible de récupérer la position");
                }
              );
            }}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:scale-105 hover:bg-slate-200 hover:text-slate-900"
          >
            <MapPin size={18} />
          </button>
        </div>

        <input
          ref={arrivalInputRef}
          type="text"
          placeholder="Adresse d’arrivée"
          value={arrival}
          autoComplete="off"
          onChange={(e) => {
            setArrival(e.target.value);
            setCoordinates(null);
            setArrivalCoordinates(null);
            setDistanceKm(null);
            setPrice(null);
            setFormattedAddress("");
            setErrorMessage("");
          }}
          className="w-full rounded-xl bg-white p-4 text-black"
        />

        <button
          onClick={async () => {
            try {
              setIsLoading(true);
              setErrorMessage("");

              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  departure
                )}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
              );

              const data = await res.json();

              if (data.status !== "OK" || !data.results?.length) {
                setErrorMessage("Adresse de départ introuvable.");
                return;
              }

              const address = data.results[0].formatted_address;
              setFormattedAddress(address);

              const location = data.results[0].geometry.location;

              setCoordinates({
                lat: location.lat,
                lng: location.lng,
              });

              const resArrival = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  arrival
                )}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
              );

              const dataArrival = await resArrival.json();

              if (dataArrival.status !== "OK" || !dataArrival.results?.length) {
                setErrorMessage("Adresse d’arrivée introuvable.");
                return;
              }

              const arrivalLoc = dataArrival.results[0].geometry.location;

              setArrivalCoordinates({
                lat: arrivalLoc.lat,
                lng: arrivalLoc.lng,
              });

            } catch (error) {
              console.error("Erreur API", error);
              setErrorMessage("Une erreur est survenue.");
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={!departure.trim() || !arrival.trim() || isLoading}
          className="w-full rounded-xl bg-green-400 p-4 font-semibold text-black disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isLoading ? "Calcul en cours..." : "Calculer le trajet"}
        </button>

        {errorMessage && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}

        {distanceKm && price && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-bold text-white">
              Résumé du trajet
            </h2>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Distance</span>
              <span className="font-semibold text-white">
                {distanceKm.toFixed(2)} km
              </span>
            </div>

            <div className="flex items-center justify-between pt-3">
              <span className="text-slate-400">Prix estimé</span>
              <span className="text-xl font-bold text-green-400">
                {price.toFixed(2)} €
              </span>
            </div>
          </div>
        )}

        {coordinates && arrivalCoordinates && (
          <div className="h-[300px] w-full overflow-hidden rounded-xl">
            <Map
              mapId="DEMO_MAP_ID"
              defaultCenter={{ lat: 46.5, lng: 2.5 }}
              defaultZoom={5}
              gestureHandling="greedy"
              disableDefaultUI={false}
              style={{ width: "100%", height: "100%" }}
            >
              <AdvancedMarker position={coordinates} />
              <AdvancedMarker position={arrivalCoordinates} />
              <RouteRenderer
                origin={coordinates}
                destination={arrivalCoordinates}
                onRouteComputed={(distanceKm) => {
                  setDistanceKm(distanceKm);
                  setPrice(distanceKm * 2);
                }}
              />
            </Map>
          </div>
        )}
      </div>
    </main>
  );
}


export default function Home() {
  const [step, setStep] = useState(1);
  const [clientType, setClientType] = useState<string | null>(null);
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [coordinates, setCoordinates] = useState<{
  lat: number;
  lng: number;
  } | null>(null);
  const [arrivalCoordinates, setArrivalCoordinates] = useState<{
  lat: number;
  lng: number;
  } | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const departureInputRef = useRef<HTMLInputElement | null>(null);

const placesLib = useMapsLibrary("places");

  function getDistanceInKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ) {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  if (step === 1) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white"
      >
        <h1 className="text-3xl font-bold">Hello Taxi App 🚕</h1>

        <button
          onClick={() => setStep(2)}
          className="px-6 py-3 bg-green-400 text-black rounded-xl font-semibold hover:scale-105 transition"
        >
          Commencer
        </button>
      </motion.main>
    );
  }

  if (step === 2) {
    return (
      <motion.main
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex min-h-screen items-center justify-center bg-slate-950 text-white px-6"
      >
        <div className="w-full max-w-md space-y-6 text-center">

          <h1 className="text-2xl font-bold">Vous êtes :</h1>

          <div className="space-y-4">
            <button
              onClick={() => {
                setClientType("particulier");
                setStep(3);
              }}
              className="w-full p-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
            >
              Particulier
            </button>

            <button
              onClick={() => {
                setClientType("pro");
                setStep(3);
              }}
              className="w-full p-4 rounded-xl bg-white text-black font-semibold hover:scale-105 transition"
            >
              Professionnel
            </button>
          </div>

        </div>
      </motion.main>
    );
  }

if (step === 3) {
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""}
      libraries={["marker", "geometry", "routes", "places"]}
    >
      <StepThreeContent
        clientType={clientType}
        departure={departure}
        setDeparture={setDeparture}
        arrival={arrival}
        setArrival={setArrival}
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        arrivalCoordinates={arrivalCoordinates}
        setArrivalCoordinates={setArrivalCoordinates}
        distanceKm={distanceKm}
        setDistanceKm={setDistanceKm}
        price={price}
        setPrice={setPrice}
        formattedAddress={formattedAddress}
        setFormattedAddress={setFormattedAddress}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        departureInputRef={departureInputRef}
        getDistanceInKm={getDistanceInKm}
      />
    </APIProvider>
  );
}

}

function RouteRenderer({
  origin,
  destination,
  onRouteComputed,
}: {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onRouteComputed?: (distanceKm: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#22c55e",
        strokeWeight: 5,
      },
    });

    directionsRenderer.setMap(map);

    directionsService.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          directionsRenderer.setDirections(result);

          // 👉 récupération distance réelle
          const route = result.routes[0];
          const distanceMeters = route.legs[0].distance?.value;

          if (distanceMeters && onRouteComputed) {
            const km = distanceMeters / 1000;
            onRouteComputed(km);
          }
        }
      }
    );

    return () => {
      directionsRenderer.setMap(null);
    };
  }, [map, origin, destination, onRouteComputed]);

  return null;
}