# HAMRadioWallet.com

> An app to add FCC Amateur Radio Licenses to Apple Wallet and Google Wallet.

## TODO

- [ ] Configure the primary Lambda function to retrieve the FCC database from S3.
- [ ] Serve the `.pkpass` to the front-end.
- [ ] Sort out CORS errors.
- [ ] Parse the amateur radio operator class from the database (Technician, General, Extra).
- [ ] Add ZIP code validation logic to backend.
- [ ] Add ZIP code validation error to frontend.
- [ ] Add header/logo to frontend website.
- [ ] Add logic for Google Wallet passes.
- [ ] Add logic to guess preference for Google/Apple wallet pass based on user agent.
- [ ] Add logic to display an error if site is accessed via Windows/Linux (Must be Android/iOS/macOS).
- [ ] Add proper error handling throughout.
