// App.tsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import FloatingIcon from "./FloatingIcon";
import { continentNames } from "./constants";
import iso6391 from 'iso-639-1';

interface IpData {
  [key: string]: any;
}

const App: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const [ipData, setIpData] = useState<any>(null);

  useEffect(() => {
    const fetchIp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const ipFromUrl = urlParams.get('ip');

      if (ipFromUrl) {
        setIpAddress(ipFromUrl);
      } else {
        const res = await axios.get("https://api.ipify.org?format=json");
        setIpAddress(res.data.ip);
      }
    };
    fetchIp();
  }, []);

  useEffect(() => {
    const fetchIpData = async () => {
      if (ipAddress) {
        const res = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
        const { country, in_eu, country_population, continent_code, languages, ...rest } = res.data;
        if (country_population) {
          rest.country_population = country_population / 10000000; // Convert population to crores
        }

        if (languages) {
          const languageCodes = languages.split(',');
          rest.languages = languageCodes
            .map((code: string) => iso6391.getName(code.trim()) || code)
            .join(", ");
        }

        if (continent_code) {
          rest.continent_code = continent_code; // Re-add the continent_code
          rest.continent_name = continentNames[continent_code]; // Add continent_name based on continent_code
        }
        const reorderedData = reorderKeys(rest);
        setIpData(reorderedData);
      }
    };
    fetchIpData();
  }, [ipAddress]);

  const reorderKeys = (data: IpData): IpData => {
    const order = [
      "ip",
      "continent_name",
      "continent_code",
      "country_name",
      "country_code",
      "country_code_iso3",
      "country_capital",
      "country_tld",
      "city",
      "region",
      "region_code",
      "postal",
      "latitude",
      "longitude",
      "timezone",
      "utc_offset",
      "country_calling_code",
      "currency",
      "currency_name",
      "languages",
      "country_area",
      "country_population",
      "org",
    ];

    const orderedData: IpData = {};

    // Add ordered keys first
    order.forEach((key) => {
      if (key in data) {
        orderedData[key] = data[key];
      }
    });

    // Add the remaining keys
    Object.keys(data).forEach((key) => {
      if (!orderedData.hasOwnProperty(key)) {
        orderedData[key] = data[key];
      }
    });

    return orderedData;
  };

  const keyMappings: { [key: string]: string } = {
    ip: "IP Address",
    continent_name: "Continent Name",
    continent_code: "Continent Code",
    country_name: "Country Name",
    country_code: "Country Code",
    country_code_iso3: "Country Code ISO3",
    country_capital: "Country Capital",
    country_tld: "Country TLD (top level domain)",
    city: "City",
    region: "Region",
    region_code: "Region Code",
    postal: "Postal Code",
    latitude: "Latitude",
    longitude: "Longitude",
    timezone: "Timezone",
    utc_offset: "UTC Offset",
    country_calling_code: "Country Calling Code",
    currency: "Currency",
    currency_name: "Currency Name",
    languages: "Spoken Languages",
    country_area: "Country Area (sq.km)",
    country_population: "Country Population (crores)",
    org: "ISP",
    network: "Network",
    version: "Version",
    in_eu: "In EU",
    country: "Country",
    asn: "ASN",
  };

  return (
    <div className="container mt-4">
      <header
        className="d-flex justify-content-center align-items-center mb-5"
        style={{ backgroundColor: "#f0f0f0", padding: "2rem" }}
      >
        <h3 className="text-center text-dark">
          IP Information - React + Vite + Typescript + Bootstrap CSS
        </h3>
      </header>
      <div>
        <h1 className="text-center">
          <span className="badge bg-primary">
            My IP Address is {ipData?.ip}
          </span>
        </h1>
      </div>
      <div className="row">
        {ipData && (
          <div className="col-sm-3 mt-5">
            <div className="card">
              <small className="card-header">
                <strong>Country Flag</strong>
              </small>
              <div className="card-body">
                <p className="card-text text-center">
                  <img
                    src={`https://flagcdn.com/w160/${ipData.country_code?.toLowerCase()}.png`}
                    alt={`${ipData.country_name} Flag`}
                  />{" "}
                </p>
              </div>
            </div>
          </div>
        )}
        {ipData &&
          Object.entries(ipData).map(([key, value], idx) => (
            <div className="col-sm-3 mt-5" key={idx}>
              <div className="card">
                <small className="card-header">
                  <strong>{keyMappings[key] || key}</strong>
                </small>
                <div className="card-body">
                  <p className="card-text">{String(value)}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
      <FloatingIcon />
    </div>
  );
};

export default App;
