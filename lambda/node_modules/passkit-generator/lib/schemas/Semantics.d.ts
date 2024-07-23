import Joi from "joi";
/**
 * For a better description of every single field,
 * please refer to Apple official documentation.
 *
 * @see https://developer.apple.com/documentation/walletpasses/semantictags
 */
/**
 * @see https://developer.apple.com/documentation/walletpasses/semantictagtype
 */
declare namespace SemanticTagType {
    interface PersonNameComponents {
        familyName?: string;
        givenName?: string;
        middleName?: string;
        namePrefix?: string;
        nameSuffix?: string;
        nickname?: string;
        phoneticRepresentation?: string;
    }
    interface CurrencyAmount {
        currencyCode?: string;
        amount?: string;
    }
    interface Location {
        latitude: number;
        longitude: number;
    }
    interface Seat {
        seatSection?: string;
        seatRow?: string;
        seatNumber?: string;
        seatIdentifier?: string;
        seatType?: string;
        seatDescription?: string;
    }
    interface WifiNetwork {
        password: string;
        ssid: string;
    }
}
/**
 * Alphabetical order
 * @see https://developer.apple.com/documentation/walletpasses/semantictags
 */
export interface Semantics {
    airlineCode?: string;
    artistIDs?: string[];
    awayTeamAbbreviation?: string;
    awayTeamLocation?: string;
    awayTeamName?: string;
    balance?: SemanticTagType.CurrencyAmount;
    boardingGroup?: string;
    boardingSequenceNumber?: string;
    carNumber?: string;
    confirmationNumber?: string;
    currentArrivalDate?: string;
    currentBoardingDate?: string;
    currentDepartureDate?: string;
    departureAirportCode?: string;
    departureAirportName?: string;
    departureGate?: string;
    departureLocation?: SemanticTagType.Location;
    departureLocationDescription?: string;
    departurePlatform?: string;
    departureStationName?: string;
    departureTerminal?: string;
    destinationAirportCode?: string;
    destinationAirportName?: string;
    destinationGate?: string;
    destinationLocation?: SemanticTagType.Location;
    destinationLocationDescription?: string;
    destinationPlatform?: string;
    destinationStationName?: string;
    destinationTerminal?: string;
    duration?: number;
    eventEndDate?: string;
    eventName?: string;
    eventStartDate?: string;
    eventType?: "PKEventTypeGeneric" | "PKEventTypeLivePerformance" | "PKEventTypeMovie" | "PKEventTypeSports" | "PKEventTypeConference" | "PKEventTypeConvention" | "PKEventTypeWorkshop" | "PKEventTypeSocialGathering";
    flightCode?: string;
    flightNumber?: number;
    genre?: string;
    homeTeamAbbreviation?: string;
    homeTeamLocation?: string;
    homeTeamName?: string;
    leagueAbbreviation?: string;
    leagueName?: string;
    membershipProgramName?: string;
    membershipProgramNumber?: string;
    originalArrivalDate?: string;
    originalBoardingDate?: string;
    originalDepartureDate?: string;
    passengerName?: SemanticTagType.PersonNameComponents;
    performerNames?: string[];
    priorityStatus?: string;
    seats?: SemanticTagType.Seat[];
    securityScreening?: string;
    silenceRequested?: boolean;
    sportName?: string;
    totalPrice?: SemanticTagType.CurrencyAmount;
    transitProvider?: string;
    transitStatus?: string;
    transitStatusReason?: string;
    vehicleName?: string;
    vehicleNumber?: string;
    vehicleType?: string;
    venueEntrance?: string;
    venueLocation?: SemanticTagType.Location;
    venueName?: string;
    venuePhoneNumber?: string;
    venueRoom?: string;
    wifiAccess?: SemanticTagType.WifiNetwork[];
}
export declare const Semantics: Joi.ObjectSchema<Semantics>;
export {};
