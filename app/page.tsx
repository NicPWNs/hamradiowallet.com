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

  const cardJiggle = (delay = 500) => {
    const timer = setTimeout(() => {
      setCardAnimation(true);
    }, delay);

    return timer;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const callSignRegex = /^(?:[KNW]|A[A-L]|[KNW][A-Z])[0-9][A-Z]{2,3}$/;
    if (!callSignRegex.test(callSign)) {
      setCallSignError("Invalid FCC Call Sign");
      return;
    } else {
      setCallSignError("");
    }

    const zipCodeRegex = /^\d{5}$/;
    if (!zipCodeRegex.test(zipCode)) {
      setZipCodeError("Invalid ZIP Code");
      return;
    } else {
      setZipCodeError("");
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `https://${env}.hamradiowallet.com/create_pass?callsign=${callSign}&zipcode=${zipCode}`
      );

      const key = await response.text();
      setPasskitUrl(`https://${env}.hamradiowallet.com/get_pass?id=${key}`);
    } catch (error) {
      console.error("Error generating pass:", error);
    } finally {
      setFlip(false);
      setCardAnimation(false);
      cardJiggle(1000);
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
        <CardFlip
          isFlipped={flip}
          flipDirection="horizontal"
          containerClassName={` ${cardAnimation ? "animate-jiggle" : ""}`}
        >
          {!passkitUrl ? (
            <Image
              src="/apple_pass.jpg"
              alt="Example Pass"
              width={300}
              height={400}
              className="cursor-pointer rounded-2xl shadow-lg shadow-black"
              onClick={handleClick}
            />
          ) : (
            <div className="w-[300px] h-[400px] bg-white rounded-2xl shadow-lg shadow-black flex-col items-center space-y-5">
              <div className="flex flex-col items-center">
                <p className="text-green-500 text-lg mt-5">
                  Your Pass is Ready!
                </p>
              </div>
              <div className="flex flex-col items-center">
                <a href={passkitUrl} target="_blank">
                  <Image
                    src="/US-UK_Add_to_Apple_Wallet_RGB_101421.svg"
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
          <div className="w-[300px] h-[400px] bg-white text-black rounded-2xl shadow-lg shadow-black flex justify-center items-center">
            {flip && (
              <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 mb-4">
                <div className="mb-4">
                  <label className="block text-gray-700 font-bold mb-2">
                    Call Sign
                  </label>
                  <input
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                      callSignError ? "border-red-500" : ""
                    }`}
                    type="text"
                    placeholder="Enter FCC Call Sign"
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
                    placeholder="Enter FCC ZIP Code"
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
          <div className="relative group text-gray-400 hover:text-gray-500 cursor-pointer mx-2">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com"
              target="_blank"
            >
              <FontAwesomeIcon icon={faGithub} size="2x" />
            </a>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              GitHub
            </span>
          </div>
          <div className="relative group text-gray-400 hover:text-gray-500 cursor-pointer mx-2">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com/issues/new"
              target="_blank"
            >
              <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
            </a>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              Issue
            </span>
          </div>
          <div className="relative group text-gray-400 hover:text-gray-500 cursor-pointer mx-2">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com"
              target="_blank"
            >
              <FontAwesomeIcon icon={faHeart} size="2x" />
            </a>
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              Sponsor
            </span>
          </div>
          <div className="relative group text-gray-400 hover:text-gray-500 cursor-pointer mx-2">
            <FontAwesomeIcon
              icon={mode ? faSun : faMoon}
              size="2x"
              onClick={(e) => setMode(!mode)}
            />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
              {mode ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
