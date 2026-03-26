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
import { Loader2, MapPin } from "lucide-react";

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
  durationText,
  setDurationText,
  formattedAddress,
  setFormattedAddress,
  errorMessage,
  setErrorMessage,
  isLoading,
  setIsLoading,
  isLocating,
  setIsLocating,
  departureInputRef,
  setStep,
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
  durationText: string;
  setDurationText: React.Dispatch<React.SetStateAction<string>>;
  formattedAddress: string;
  setFormattedAddress: React.Dispatch<React.SetStateAction<string>>;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLocating: boolean;
  setIsLocating: React.Dispatch<React.SetStateAction<boolean>>;
  departureInputRef: React.RefObject<HTMLInputElement | null>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
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
        setDurationText("");
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
    setDurationText,
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
        setDurationText("");
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
    setDurationText,
  ]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md space-y-6">
        <button
          type="button"
          onClick={() => setStep(2)}
          className="block text-sm text-slate-400 transition hover:text-white"
        >
          ← Retour
        </button>

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
              setDurationText("");
            }}
            className="w-full rounded-xl bg-white p-4 pr-12 text-black"
          />

          <button
            type="button"
            onClick={() => {
              setIsLocating(true);
              setErrorMessage("");

              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const lat = position.coords.latitude;
                  const lng = position.coords.longitude;

                  try {
                    const res = await fetch(
                      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
                    );

                    const data = await res.json();
                    const foundAddress = data.results?.[0]?.formatted_address;

                    setDeparture(foundAddress || "Ma position");
                    setCoordinates({ lat, lng });
                    setArrivalCoordinates(null);
                    setDistanceKm(null);
                    setPrice(null);
                    setFormattedAddress(foundAddress || "Ma position");
                    setErrorMessage("");
                    setDurationText("");
                  } catch {
                    setDeparture("Ma position");
                    setCoordinates({ lat, lng });
                    setArrivalCoordinates(null);
                    setDistanceKm(null);
                    setPrice(null);
                    setFormattedAddress("Ma position");
                    setDurationText("");
                  } finally {
                    setIsLocating(false);
                  }
                },
                () => {
                  setIsLocating(false);
                  setErrorMessage("Impossible de récupérer votre position.");
                }
              );
            }}
            disabled={isLocating}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:scale-105 hover:bg-slate-200 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLocating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <MapPin size={18} />
            )}
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
            setDurationText("");
          }}
          className="w-full rounded-xl bg-white p-4 text-black"
        />

        <button
          type="button"
          onClick={async () => {
            try {
              setIsLoading(true);
              setErrorMessage("");

              let originLocation = coordinates;
              let originAddress = departure;

              if (!originLocation) {
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

                originAddress = data.results[0].formatted_address;
                setFormattedAddress(originAddress);

                originLocation = {
                  lat: data.results[0].geometry.location.lat,
                  lng: data.results[0].geometry.location.lng,
                };

                setCoordinates(originLocation);
              }

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

              const arrivalLoc = {
                lat: dataArrival.results[0].geometry.location.lat,
                lng: dataArrival.results[0].geometry.location.lng,
              };

              setArrivalCoordinates(arrivalLoc);
            } catch (error) {
              console.error("Erreur API", error);
              setErrorMessage("Une erreur est survenue.");
            } finally {
              setIsLoading(false);
            }
          }}
          disabled={!departure.trim() || !arrival.trim() || isLoading || isLocating}
          className="w-full rounded-xl bg-green-400 p-4 font-semibold text-black disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {isLoading ? "Calcul en cours..." : "Calculer le trajet"}
        </button>

        {errorMessage && <p className="text-sm text-red-400">{errorMessage}</p>}

        {distanceKm && price && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <h2 className="mb-3 text-lg font-bold text-white">Résumé du trajet</h2>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Distance</span>
              <span className="font-semibold text-white">
                {distanceKm.toFixed(2)} km
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 py-3">
              <span className="text-slate-400">Durée estimée</span>
              <span className="font-semibold text-white">
                {durationText || "-"}
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
                onRouteComputed={(computedDistanceKm, computedDurationText) => {
                  setDistanceKm(computedDistanceKm);
                  setPrice(computedDistanceKm * 2);
                  setDurationText(computedDurationText);
                }}
              />
            </Map>
          </div>
        )}

        {coordinates &&
          arrivalCoordinates &&
          distanceKm &&
          price &&
          durationText && (
            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full rounded-xl bg-white p-4 font-semibold text-black transition hover:scale-[1.01]"
            >
              Continuer
            </button>
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
  const [durationText, setDurationText] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const departureInputRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

const handleWhatsAppBooking = () => {
    const chauffeurPhone = "33788750896";

    const rawMessage = `Bonjour, je souhaite réserver un trajet.

  Type de client : ${clientType}
  Prénom : ${firstName}
  Nom : ${lastName}
  Téléphone : ${phone}

  Départ : ${departure}
  Arrivée : ${arrival}
  Distance : ${distanceKm ? distanceKm.toFixed(2) + " km" : "-"}
  Durée estimée : ${durationText || "-"}
  Prix estimé : ${price ? price.toFixed(2) + " €" : "-"}`;

    const encodedMessage = encodeURIComponent(rawMessage);

    window.open(`https://wa.me/${chauffeurPhone}?text=${encodedMessage}`, "_blank");
  };

  if (step === 1) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-white"
      >
        <h1 className="text-3xl font-bold">RM Transfert 🚕</h1>

        <button
          type="button"
          onClick={() => setStep(2)}
          className="rounded-xl bg-green-400 px-6 py-3 font-semibold text-black transition hover:scale-105"
        >
          Commencer mon trajet avec Si Rachid
        </button>
      </motion.main>
    );
  }

  if (step === 2) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md space-y-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="block text-sm text-slate-400 transition hover:text-white"
          >
            ← Retour
          </button>

          <h1 className="text-center text-2xl font-bold">Vous êtes :</h1>

          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setClientType("particulier");
                setStep(3);
              }}
              className="w-full rounded-xl bg-white p-4 font-semibold text-black transition hover:scale-[1.01]"
            >
              Particulier
            </button>

            <button
              type="button"
              onClick={() => {
                setClientType("pro");
                setStep(3);
              }}
              className="w-full rounded-xl bg-white p-4 font-semibold text-black transition hover:scale-[1.01]"
            >
              Professionnel
            </button>
          </div>
        </div>
      </main>
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
          durationText={durationText}
          setDurationText={setDurationText}
          formattedAddress={formattedAddress}
          setFormattedAddress={setFormattedAddress}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          isLocating={isLocating}
          setIsLocating={setIsLocating}
          departureInputRef={departureInputRef}
          setStep={setStep}
        />
      </APIProvider>
    );
  }

  if (step === 4) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-md space-y-6">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="block text-sm text-slate-400 transition hover:text-white"
          >
            ← Retour
          </button>

          <h1 className="text-center text-2xl font-bold">Vos informations</h1>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            <p>
              <span className="text-slate-400">Départ :</span> {departure}
            </p>
            <p className="mt-2">
              <span className="text-slate-400">Arrivée :</span> {arrival}
            </p>
            <p className="mt-2">
              <span className="text-slate-400">Distance :</span>{" "}
              {distanceKm ? `${distanceKm.toFixed(2)} km` : "-"}
            </p>
            <p className="mt-2">
              <span className="text-slate-400">Durée :</span>{" "}
              {durationText || "-"}
            </p>
            <p className="mt-2">
              <span className="text-slate-400">Prix :</span>{" "}
              {price ? `${price.toFixed(2)} €` : "-"}
            </p>
          </div>

          <input
            type="text"
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setFormError("");
            }}
            className="w-full rounded-xl bg-white p-4 text-black"
          />

          <input
            type="text"
            placeholder="Nom"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setFormError("");
            }}
            className="w-full rounded-xl bg-white p-4 text-black"
          />

          <input
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setFormError("");
            }}
            className="w-full rounded-xl bg-white p-4 text-black"
          />

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="button"
            onClick={() => {
              if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
                setFormError("Merci de remplir prénom, nom et téléphone.");
                return;
              }
              setFormError("");
              setStep(5);
            }}
            className="w-full rounded-xl bg-green-400 p-4 font-semibold text-black transition hover:scale-[1.01]"
          >
            Valider mes coordonnées
          </button>
        </div>
      </main>
    );
  }

if (step === 5) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md space-y-6">
        <button
          type="button"
          onClick={() => setStep(4)}
          className="block text-sm text-slate-400 transition hover:text-white"
        >
          ← Retour
        </button>

        <h1 className="text-center text-2xl font-bold">Récapitulatif</h1>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Trajet
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Type de client :</span> {clientType}
              </p>
              <p>
                <span className="text-slate-400">Départ :</span> {departure}
              </p>
              <p>
                <span className="text-slate-400">Arrivée :</span> {arrival}
              </p>
              <p>
                <span className="text-slate-400">Distance :</span>{" "}
                {distanceKm ? `${distanceKm.toFixed(2)} km` : "-"}
              </p>
              <p>
                <span className="text-slate-400">Durée estimée :</span>{" "}
                {durationText || "-"}
              </p>
              <p>
                <span className="text-slate-400">Prix estimé :</span>{" "}
                {price ? `${price.toFixed(2)} €` : "-"}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Client
            </h2>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Prénom :</span> {firstName}
              </p>
              <p>
                <span className="text-slate-400">Nom :</span> {lastName}
              </p>
              <p>
                <span className="text-slate-400">Téléphone :</span> {phone}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWhatsAppBooking}
          className="w-full rounded-xl bg-green-400 p-4 font-semibold text-black transition hover:scale-[1.01]"
        >
          Envoyer via WhatsApp
        </button>
        <p className="text-center text-sm text-slate-400">
          Vérifiez vos informations avant d’envoyer votre demande.
        </p>
      </div>
    </main>
  );
}

  return null;
}

function RouteRenderer({
  origin,
  destination,
  onRouteComputed,
}: {
  origin: { lat: number; lng: number } | null;
  destination: { lat: number; lng: number } | null;
  onRouteComputed?: (distanceKm: number, durationText: string) => void;
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

          const route = result.routes[0];
          const leg = route.legs[0];

          const distanceMeters = leg.distance?.value;
          const duration = leg.duration?.text || "";

          if (distanceMeters && onRouteComputed) {
            const km = distanceMeters / 1000;
            onRouteComputed(km, duration);
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