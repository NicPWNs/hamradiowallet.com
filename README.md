# HAMRadioWallet.com

> A web application enabling Amateur Radio and GMRS licensees in the United States, and Amateur Radio certificate holders in Canada, to add their license to Apple Wallet and Google Wallet.

Built and maintained by [@NicPWNs](https://github.com/NicPWNs) / N1CPJ

## 🪪 Examples

<table align="center" border="0">
 <tr>
    <td align="center"><b>Apple Wallet</b></td>
    <td align="center"><b>Google Wallet</b></td>
 </tr>
 <tr>
    <td><img src="./public/apple_pass.svg" width="300" height="400" alt="Example Apple Wallet Pass" style="border-radius: 10px;" /></td>
    <td><img src="./public/google_pass.svg" width="300" height="400" alt="Example Google Wallet Pass" style="border-radius: 10px;" /></td>
 </tr>
</table>

> Like this project? Give it a [⭐ on GitHub!](https://github.com/NicPWNs/hamradiowallet.com)

## 🚀 Usage

1. Visit [HAMRadioWallet.com](https://hamradiowallet.com).
2. Enter your callsign and your ZIP code, or your postal code in Canada.
3. Add the generated pass to your device's wallet.

The callsign's format determines which registry it is looked up in, so there is
nothing else to select: US amateur callsigns end in letters (`K1ABC`), GMRS
callsigns end in digits (`WRAB123`), and Canadian callsigns carry a V prefix
the FCC does not issue (`VE3ABC`).

| Service | Authority | Data | Refreshed |
| --- | --- | --- | --- |
| Amateur (US) | FCC ULS | `l_amat.zip` | weekly |
| GMRS | FCC ULS | `l_gmrs.zip` | weekly |
| Amateur (Canada) | ISED | `amateur_delim.zip` | daily |

Canadian certificates are issued for life, so those passes carry no expiration
date. ISED publishes no address for roughly a quarter of Canadian holders; when
that is the case there is nothing to check a request against, and the app says
so. Adding an address with ISED fixes it by the next day's file.

_Don't have a license?_ Use callsign **M0RSE** (amateur) or **MORS001** (GMRS)
with ZIP code **02720**, or **VA0MRS** (Canada) with postal code **A1A1A1**, to
test!

## 💡 Support & Contributions

- Found a bug or have a question? [Open an issue](https://github.com/NicPWNs/hamradiowallet.com/issues)
- Want to contribute? [Submit a pull request](https://github.com/NicPWNs/hamradiowallet.com/pulls)

## ❤️ Support

Please tell your amateur radio operator clubs and friends!

If you find this project useful, consider [sponsoring the developer](https://github.com/sponsors/NicPWNs).

## ⚖️ Legal

HAMRadioWallet.com is not affiliated with, endorsed by, or sponsored by the Federal Communications Commission (FCC) or Innovation, Science and Economic Development Canada (ISED). This is an independent project created to help amateur radio and GMRS licensees digitize their license information. Canadian callsign data is reproduced from ISED's published amateur callsign list for non-commercial use. All trademarks and registered trademarks are the property of their respective owners.
