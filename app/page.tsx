"use client";

import Image from "next/image";
import CardFlip from "react-card-flip";
import QRCode from "qrcode.react";
import React, { useState, useEffect, SetStateAction } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faExclamationCircle,
  faSun,
  faMoon,
  faHeart,
  faL,
} from "@fortawesome/free-solid-svg-icons";

// Environment
let env: String;

export default function Home() {
  // Sea of state variables
  const [mode, setMode] = useState(false);
  const [flip, setFlip] = useState(false);
  const [show, setShow] = useState(true);
  const [cardAnimation, setCardAnimation] = useState(false);
  const [callSign, setCallSign] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [callSignError, setCallSignError] = useState("");
  const [zipCodeError, setZipCodeError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passkitUrl, setPasskitUrl] = useState("");
  const [callsignFound, setCallsignFound] = useState("");
  const [zipcodeFound, setZipcodeFound] = useState("");
  const [miscError, setMiscError] = useState("");
  const [callsign, setCallsign] = useState("");
  const [frn, setFrn] = useState("");
  const [name, setName] = useState("");
  const [privileges, setPrivileges] = useState("");
  const [grantDate, setGrantDate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [expireDate, setExpireDate] = useState("");

  const cardJiggle = (delay = 500) => {
    const timer = setTimeout(() => {
      setCardAnimation(true);
    }, delay);

    return timer;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Reset error messages
    setCallsignFound("");
    setZipcodeFound("");

    // Callsign input validation
    const callSignRegex = /^(?:[KNW]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{2,3}$/;
    if (!callSignRegex.test(callSign)) {
      setCallSignError("Invalid FCC Call Sign");
      return;
    } else {
      setCallSignError("");
    }

    // Zipcode input validation
    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(zipCode)) {
      setZipCodeError("Invalid ZIP Code");
      return;
    } else {
      setZipCodeError("");
    }

    setIsLoading(true);
    const response = await fetch(
      `https://${env}.hamradiowallet.com/create_pass?callsign=${callSign}&zipcode=${zipCode}`
    );

    if (response.status === 200) {
      const body = await response.json();

      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      let key = body.key;
      setCallsign(body.callsign);
      setFrn(body.frn);
      setName(body.name);
      setPrivileges(body.privileges);
      setGrantDate(
        new Date(body.grantDate).toLocaleDateString("en-US", options)
      );
      setEffectiveDate(
        new Date(body.effectiveDate).toLocaleDateString("en-US", options)
      );
      setExpireDate(
        new Date(body.expireDate).toLocaleDateString("en-US", options)
      );

      setPasskitUrl(`https://${env}.hamradiowallet.com/get_pass?id=${key}`);
      setFlip(false);
      setCardAnimation(false);
      cardJiggle(1000);
    } else if (response.status === 403) {
      setZipcodeFound("ZIP Code Does Not Match FCC");
      setIsLoading(false);
    } else if (response.status === 404) {
      setCallsignFound("Call Sign Not Found");
      setIsLoading(false);
    } else {
      setMiscError("Something Went Wrong. Try Again.");
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!flip) {
      setFlip(true);
      setShow(false);
    }
  };

  useEffect(() => {
    const timer = cardJiggle();
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setMode(true);
    }
    if (process.env.ENV === "production") {
      env = "api";
    } else {
      env = "dev";
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className={
        mode ? "bg-neutral-800 text-white" : "bg-neutral-100 text-black"
      }
    >
      <div className="flex flex-col justify-center items-center h-screen">
        <h1 className="text-2xl font-bold mb-0">HAM Radio Wallet Pass</h1>
        <h1 className="text-lg font-italic mb-10">Get yours for free.</h1>
        {show && (
          <button
            className="w-[110px] text-white text-sm font-light bg-blue-500 hover:bg-blue-600 rounded-lg mb-10"
            onClick={handleClick}
          >
            Get Your Pass
          </button>
        )}
        {passkitUrl && (
          <div className="flex-col items-center space-y-5">
            <div className="flex flex-col items-center">
              <p className="text-green-500 text-lg mt-5">Your Pass is Ready!</p>
            </div>
            <div className="flex flex-col items-center">
              <a href={passkitUrl} target="_blank">
                <Image
                  src="/add_to_apple_wallet.svg"
                  alt="Add to Apple Wallet"
                  width={200}
                  height={150}
                />
              </a>
            </div>
            <div className="flex flex-col items-center">
              <QRCode value={passkitUrl} size={200} />
            </div>
          </div>
        )}
        <CardFlip
          isFlipped={flip}
          flipDirection="horizontal"
          containerClassName={` ${cardAnimation ? "animate-jiggle" : ""}`}
        >
          <div className="cursor-pointer rounded-2xl shadow-lg shadow-black">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              height={400}
              width={300}
              onClick={handleClick}
              className="rounded-2xl"
            >
              <path
                d="M-.162.058h300v400h-300z"
                style={{
                  fillRule: "nonzero",
                  paintOrder: "fill",
                  fill: "#fff",
                }}
              />
              <text
                x={220}
                y={19.942}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 10,
                }}
              >
                {"CALL SIGN"}
              </text>
              <text
                x={220}
                y={35.363}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 16,
                }}
              >
                {callsign ? callsign : "WA1LET"}
              </text>
              <text
                x={85.888}
                y={28.986}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {"Radio License"}
              </text>
              <path
                stroke="transparent"
                d="M102.535 286.937h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm13.095 0h3.273v3.244h-3.273v-3.244Zm9.819 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm13.093 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.243h-3.274v-3.243Zm19.641 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm9.821 0h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm9.819 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm13.093 0h3.273v3.243h-3.273v-3.243Zm19.641 0h3.273v3.243h-3.273v-3.243Zm-91.657 3.243h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.245h-3.274v-3.245Zm6.547 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.275v3.245h-3.275v-3.245Zm3.275 0h3.273v3.245h-3.273v-3.245Zm6.546 0h3.273v3.245h-3.273v-3.245Zm9.82 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.275v3.245h-3.275v-3.245Zm3.275 0h3.273v3.245h-3.273v-3.245Zm6.546 0h3.274v3.245h-3.274v-3.245Zm3.274 0h3.273v3.245h-3.273v-3.245Zm9.819 0h3.275v3.245h-3.275v-3.245Zm6.548 0h3.273v3.245h-3.273v-3.245Zm9.82 0h3.273v3.245h-3.273v-3.245Zm6.546 0h3.275v3.245h-3.275v-3.245Zm3.275 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.273v3.245h-3.273v-3.245Zm6.547 0h3.273v3.245h-3.273v-3.245Zm-91.657 3.245h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm16.368 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.243h-3.274v-3.243Zm19.641 0h3.273v3.243h-3.273v-3.243Zm9.82 0h3.273v3.243h-3.273v-3.243Zm6.548 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.274v3.243h-3.274v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm19.641 0h3.273v3.243h-3.273v-3.243Zm-91.657 3.243h3.274v3.244h-3.274V306.4Zm3.274 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.275v3.244h-3.275V306.4Zm3.275 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.273v3.244h-3.273V306.4Zm6.547 0h3.273v3.244h-3.273V306.4Zm6.546 0h3.275v3.244h-3.275V306.4Zm6.548 0h3.273v3.244h-3.273V306.4Zm6.547 0h3.273v3.244h-3.273V306.4Zm6.546 0h3.273v3.244h-3.273V306.4Zm6.548 0h3.273v3.244h-3.273V306.4Zm6.546 0h3.274v3.244h-3.274V306.4Zm6.547 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.275v3.244h-3.275V306.4Zm3.275 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.273v3.244h-3.273V306.4Zm3.273 0h3.274v3.244h-3.274V306.4Zm3.274 0h3.273v3.244h-3.273V306.4Zm-62.196 3.244h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm13.094 0h3.274v3.244h-3.274v-3.244Zm-62.195 3.244h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm6.548 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm9.82 0h3.273v3.243h-3.273v-3.243Zm9.821 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm6.548 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm22.914 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.274v3.243h-3.274v-3.243Zm-81.836 3.243h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm13.095 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.245h-3.274v-3.245Zm6.547 0h3.273v3.245h-3.273v-3.245Zm6.548 0h3.273v3.245h-3.273v-3.245Zm6.546 0h3.273v3.245h-3.273v-3.245Zm6.547 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.275v3.245h-3.275v-3.245Zm9.821 0h3.274v3.245h-3.274v-3.245Zm29.461 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.273v3.245h-3.273v-3.245Zm6.548 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.274v3.245h-3.274v-3.245Zm-88.383 3.245h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.275v3.243h-3.275v-3.243Zm16.368 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm9.82 0h3.273v3.243h-3.273v-3.243Zm16.367 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.274v3.243h-3.274v-3.243Zm9.82 0h3.273v3.243h-3.273v-3.243Zm16.368 0h3.273v3.243h-3.273v-3.243Zm-91.657 3.243h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm16.367 0h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm9.821 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm-88.383 3.244h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm16.366 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm9.821 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm6.548 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.273v3.243h-3.273v-3.243Zm9.821 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm-88.383 3.243h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm9.82 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm22.914 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.244h-3.274v-3.244Zm19.641 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm13.093 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm9.819 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm-81.836 3.244h3.273v3.245h-3.273v-3.245Zm3.273 0h3.275v3.245h-3.275v-3.245Zm3.275 0h3.273v3.245h-3.273v-3.245Zm16.366 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.275v3.245h-3.275v-3.245Zm3.275 0h3.273v3.245h-3.273v-3.245Zm3.273 0h3.273v3.245h-3.273v-3.245Zm19.641 0h3.273v3.245h-3.273v-3.245Zm6.546 0h3.274v3.245h-3.274v-3.245Zm9.82 0h3.273v3.245h-3.273v-3.245Zm9.821 0h3.273v3.245h-3.273v-3.245Zm-85.11 3.245h3.274v3.243h-3.274v-3.243Zm9.82 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm9.821 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.274v3.243h-3.274v-3.243Zm16.368 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.274v3.243h-3.274v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm-72.015 3.243h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm19.641 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm9.821 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm-88.383 3.244h3.273v3.244h-3.273v-3.244Zm9.821 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm13.093 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm-58.922 3.244h3.273v3.243h-3.273v-3.243Zm13.094 0h3.273v3.243h-3.273v-3.243Zm13.093 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.274v3.243h-3.274v-3.243Zm13.093 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm9.82 0h3.273v3.243h-3.273v-3.243Zm-91.657 3.243h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm16.368 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm13.093 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm-88.383 3.244h3.274v3.244h-3.274v-3.244Zm19.641 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm13.093 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm9.821 0h3.274v3.244h-3.274v-3.244Zm13.093 0h3.275v3.244h-3.275v-3.244Zm9.821 0h3.274v3.244h-3.274v-3.244Zm-88.383 3.244h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm13.094 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm9.819 0h3.275v3.244h-3.275v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm16.366 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm-88.383 3.244h3.274v3.244h-3.274v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm9.821 0h3.273v3.244h-3.273v-3.244Zm6.547 0h3.273v3.244h-3.273v-3.244Zm13.094 0h3.273v3.244h-3.273v-3.244Zm6.546 0h3.274v3.244h-3.274v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm6.548 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm-91.657 3.244h3.274v3.243h-3.274v-3.243Zm19.641 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.275v3.243h-3.275v-3.243Zm6.548 0h3.273v3.243h-3.273v-3.243Zm6.547 0h3.273v3.243h-3.273v-3.243Zm3.273 0h3.273v3.243h-3.273v-3.243Zm9.821 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.274v3.243h-3.274v-3.243Zm3.274 0h3.273v3.243h-3.273v-3.243Zm9.819 0h3.275v3.243h-3.275v-3.243Zm3.275 0h3.273v3.243h-3.273v-3.243Zm6.546 0h3.274v3.243h-3.274v-3.243Zm-88.383 3.243h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.275v3.244h-3.275v-3.244Zm3.275 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm9.82 0h3.273v3.244h-3.273v-3.244Zm9.821 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm16.368 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.274v3.244h-3.274v-3.244Zm3.274 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm3.273 0h3.273v3.244h-3.273v-3.244Zm13.094 0h3.274v3.244h-3.274v-3.244Z"
              />
              <text
                x={15}
                y={114.776}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 10,
                  whiteSpace: "pre",
                }}
              >
                {"PRIVILEGES"}
              </text>
              <text
                x={15}
                y={133.326}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 16,
                }}
              >
                {privileges ? privileges : "Technician"}
              </text>
              <text
                x={15}
                y={71.268}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 10,
                  whiteSpace: "pre",
                }}
              >
                {"NAME"}
              </text>
              <text
                x={15}
                y={87.515}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 16,
                }}
              >
                {name ? name : "Samuel Morse"}
              </text>
              <text
                x={175}
                y={215.718}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 10,
                  whiteSpace: "pre",
                }}
              >
                {"EXPIRATION DATE"}
              </text>
              <text
                x={175}
                y={233.969}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 14,
                }}
              >
                {expireDate ? expireDate : "August 23, 2034"}
              </text>
              <text
                x={15}
                y={216.741}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 10,
                  whiteSpace: "pre",
                }}
              >
                {"GRANT DATE"}
              </text>
              <text
                x={15}
                y={234.663}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 14,
                }}
              >
                {grantDate ? grantDate : "August 23, 2024"}
              </text>
              <text
                x={13.485}
                y={166.869}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 10,
                  whiteSpace: "pre",
                }}
              >
                {"FCC REGISTRATION NUMBER"}
              </text>
              <text
                x={15.545}
                y={184.689}
                style={{
                  fill: "#333",
                  fontFamily: "Arial,sans-serif",
                  fontSize: 14,
                }}
              >
                {frn ? frn : "0123456789"}
              </text>
              <image
                xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAQACAYAAACXqOHAAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QA/wD/AP+gvaeTAAAAB3RJTUUH6AYSEDsitmdUVwAAgABJREFUeNrt3XmcFdWd//9XL9htAw3SIA0KNCIQiCAYIaAZWSYTAY1BcCECGhcURXBhdeb3jc5MZmQ3giiLSxIwwRXcQGNkyQIKRhAMyL5FaGSxaeim217q98ehBxeQ2913qarP+/l4nEfySC597+ecU3U+darqHBARERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERERklQFImakAdcAPwUuARoD5UAu8HfgTeB1oFhVJSIiEnwpwL3AXsA7Q8k98dlUVZuIiEhwtQBWRzDwf7N8ALRU9YmIiARPdyCvCoN/RTkM9FQ1ioiIBEdv4Hg1Bv+KchzopeoUERHxv8uAgigM/hWlEOiiahUREfGv83EP8nlRLvuBJqpeERER/0kB/hqDwb+i/AW9HSAiIuI742I4+FeUh1TNIiIi/nEh0XnoL5KHAlupukVERPzhrTgM/hXlTVW3iIhI4vWM4+BfUf5V1S4iIpJYKxOQAKxQtYuIiCTOlQkY/CvKv6n6RUREEmNpAhOAJap+ERGR+OuUwMG/omiFQBERkTh7xQcJwMtqBhERkfhpBZT5IAEoA9qoOUSCJ1lVIBJIo31y/CYDD6g5REREYq8h8Vn1L9JSBDRWs4hoBkBEYutBIN1HvycNGKFmERERiZ1M4AsfXf1XlCNAHTWPiGYARCQ2hgJ1fZqY3KnmERERib404DMfXv1XlH3469aEiGgGQCQUBuPvh+2ygYFqJhERkegm6xt8fPVfUT7VhYWIiEj09AvA4F9RrlVziYiIRMeKACUAq9RcIiIi1dc9QIN/RemmZhMREameRQFMAN5Ss4mIiFRdO6A8gAmAB3RQ84mIiFTNvIAO/h4wV80nIiJSeU2ALwOcAJQAzdSMIv6k93VF/Gs0UCPAvz8Vt3GRiIiIRKgecDTAV/8VpQCor+YU0QyAiERmBFArBHFkAMPUnCIiIpENmp+H4Oq/ohwEaqpZ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"
                width={200}
                height={400}
                style={{
                  transformOrigin: "100.000017px 199.99998px",
                }}
                transform="matrix(0 -.17056 .1723 0 -55.527 -175.605)"
              >
                <title>{"International_amateur_radio_symbol.svg"}</title>
              </image>
            </svg>
          </div>
          <div className="w-[300px] h-[400px] bg-white text-black rounded-2xl shadow-lg shadow-black flex justify-center items-center">
            {flip && (
              <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                  {callsignFound && (
                    <p className="text-red-500 text-md mb-5 flex flex-col items-center">
                      {callsignFound}
                    </p>
                  )}
                  {zipcodeFound && (
                    <p className="text-red-500 text-md mb-5 flex flex-col items-center">
                      {zipcodeFound}
                    </p>
                  )}
                  <label className="block text-gray-700 font-bold mb-2">
                    Call Sign
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      callSignError ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder="Enter Your FCC Call Sign"
                    value={callSign}
                    onChange={(e) =>
                      setCallSign(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                      )
                    }
                    disabled={isLoading}
                  />
                  {callSignError && (
                    <p className="text-red-500 text-xs italic mt-2">
                      {callSignError}
                    </p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2">
                    ZIP Code
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      zipCodeError ? "border-red-500" : ""
                    }`}
                    type="number"
                    placeholder="Enter Your FCC ZIP Code"
                    value={zipCode}
                    onChange={(e) =>
                      setZipCode(
                        e.target.value.toString().replace(/[^0-9]/g, "")
                      )
                    }
                    disabled={isLoading}
                  />
                  {zipCodeError && (
                    <p className="text-red-500 text-xs italic mt-2">
                      {zipCodeError}
                    </p>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating pass...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </CardFlip>
        <div className="flex mt-10">
          <div className="relative group text-gray-400 cursor-pointer mx-2">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com"
              target="_blank"
            >
              <FontAwesomeIcon
                icon={faGithub}
                size="2x"
                className={mode ? "hover:text-white" : "hover:text-black"}
              />
            </a>
            <span className="text-xs absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              GitHub
            </span>
          </div>
          <div className="relative group text-gray-400 hover:text-red-400 cursor-pointer mx-2">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com/issues/new"
              target="_blank"
            >
              <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
            </a>
            <span className="text-xs absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              Issue
            </span>
          </div>
          <div className="relative group text-gray-400 hover:text-pink-400 cursor-pointer mx-2">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com"
              target="_blank"
            >
              <FontAwesomeIcon icon={faHeart} size="2x" />
            </a>
            <span className="text-xs absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              Sponsor
            </span>
          </div>
          <div className="relative group text-gray-400 hover:text-yellow-400 cursor-pointer mx-2">
            <FontAwesomeIcon
              icon={mode ? faSun : faMoon}
              size="2x"
              onClick={(e) => setMode(!mode)}
            />
            <span className="text-xs absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              {mode ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
