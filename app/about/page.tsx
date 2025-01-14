"use client";

import React, { useState, useEffect } from "react";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faHome,
  faHeart,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";

export default function About() {
  const [mode, setMode] = useState(false);

  // On page load
  useEffect(() => {
    // Auto dark mode
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setMode(true);
    }
  }, []);

  return (
    <body
      className={
        mode ? "bg-neutral-800 text-white" : "bg-neutral-100 text-black"
      }
    >
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="max-w-2xl text-center px-4">
          <h1 className="text-3xl font-bold mb-6">About HAMRadioWallet.com</h1>
          <p className="mb-4">
            HAMRadioWallet.com is a simple web application that allows FCC
            Amateur Radio operators to add their license credentials to Apple
            Wallet and Google Wallet for convenient digital access.
          </p>
          <p className="mb-4">
            Simply enter your amateur radio callsign and 5-digit ZIP code, and
            the app will generate a digital pass that can be stored in your
            mobile device&apos;s wallet.
          </p>
          <p className="mb-4">
            Compatible with both iOS (Apple Wallet) and Android (Google Wallet)
            devices.
          </p>
          <p className="mb-6">
            Made by{" "}
            <a href="https://nicpwns.com" className="text-blue-500">
              @NicPWNs
            </a>
          </p>
        </div>
        <div className="flex mt-10">
          <div className="relative mx-2 text-gray-400 cursor-pointer group hover:text-blue-400">
            <a href="./">
              <FontAwesomeIcon icon={faHome} size="2x" />
            </a>
            <span className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity duration-300 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
              Home
            </span>
          </div>
          <div className="relative mx-2 text-gray-400 cursor-pointer group">
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
            <span className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity duration-300 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
              GitHub
            </span>
          </div>
          <div className="relative mx-2 text-gray-400 cursor-pointer group hover:text-pink-400">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com"
              target="_blank"
            >
              <FontAwesomeIcon icon={faHeart} size="2x" />
            </a>
            <span className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity duration-300 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
              Sponsor
            </span>
          </div>
          <div className="relative mx-2 text-gray-400 cursor-pointer group hover:text-red-400">
            <a
              href="https://github.com/NicPWNs/hamradiowallet.com/issues/new"
              target="_blank"
            >
              <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
            </a>
            <span className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity duration-300 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
              Issue
            </span>
          </div>
          <div className="relative mx-2 text-gray-400 cursor-pointer group hover:text-yellow-400">
            <FontAwesomeIcon
              icon={mode ? faSun : faMoon}
              size="2x"
              onClick={(e) => setMode(!mode)}
            />
            <span className="absolute px-2 py-1 mb-2 text-xs text-white transition-opacity duration-300 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
              {mode ? "Light" : "Dark"}
            </span>
          </div>
        </div>
      </div>
    </body>
  );
}
