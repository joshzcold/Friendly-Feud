import { useTranslation } from "react-i18next";
import "@/i18n/i18n";
import { useEffect, useState } from "react";

function adjustTextSize(text: string, limit = 8, startingSize = 80) {
  if (text.length > limit) {
    let shrink = 0;

    if (text.length - limit >= 25) shrink = (text.length - limit) * 2.2;
    else if (text.length - limit >= 20) shrink = (text.length - limit) * 2.7;
    else if (text.length - limit >= 15) shrink = (text.length - limit) * 3.2;
    else if (text.length - limit >= 10) shrink = (text.length - limit) * 3.7;
    else if (text.length - limit >= 5) shrink = (text.length - limit) * 5.5;
    else shrink = (text.length - limit) * 9;
    return startingSize - shrink;
  }
  return startingSize;
}

interface TitleLogoProps {
  insert: string;
}

export default function TitleLogo({ insert }: TitleLogoProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasTitle = insert.length > 0 ? true : false;
  const { t } = useTranslation();

  if (!isMounted) {
    return <div className="w-full" />;
  }

  const logo = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:cc="http://creativecommons.org/ns#"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 507.285 250.08613"
  version="1.1"
  id="svg72"
>
  <metadata id="metadata76">
    <rdf:RDF>
      <cc:Work rdf:about="">
        <dc:format>image/svg+xml</dc:format>
        <dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
        <dc:title></dc:title>
      </cc:Work>
    </rdf:RDF>
  </metadata>
  <defs id="defs22">
    <linearGradient id="c">
      <stop offset="0" stop-color="#ff6603" id="stop2" />
      <stop offset="1" stop-color="#ffd0b2" id="stop4" />
    </linearGradient>
    <linearGradient id="a">
      <stop offset="0" stop-color="#039" id="stop7" />
      <stop offset="1" stop-color="#3669ff" id="stop9" />
    </linearGradient>
    <linearGradient id="b">
      <stop offset="0" stop-color="#f60" id="stop12" />
      <stop offset="1" stop-color="#ffeb00" id="stop14" />
    </linearGradient>
    <linearGradient
      xlink:href="#a"
      id="d"
      x1="119.818"
      y1="182.24699"
      x2="96.176003"
      y2="80.245003"
      gradientUnits="userSpaceOnUse"
    />
    <linearGradient
      xlink:href="#c"
      id="e"
      x1="161.01601"
      y1="131.42599"
      x2="248.19501"
      y2="82.411003"
      gradientUnits="userSpaceOnUse"
    />
    <linearGradient
      id="f"
      xlink:href="#b"
      x1="15.48"
      x2="14.362"
      y1="${hasTitle ? 10 : 10}"
      y2="${hasTitle ? 60 : 60}"
      gradientUnits="userSpaceOnUse"
    />
    <linearGradient
      id="g"
      xlink:href="#b"
      gradientUnits="userSpaceOnUse"
      x1="15.48"
      x2="14.362"
      y1="${hasTitle ? 100 : 50}"
      y2="${hasTitle ? 140 : 120}"
    />
    <linearGradient
      id="h"
      xlink:href="#b"
      x1="21.422001"
      x2="19.037001"
      y1="${hasTitle ? 150 : 120}"
      y2="${hasTitle ? 180 : 150}"
      gradientUnits="userSpaceOnUse"
    />
  </defs>
  <g id="g120" transform="translate(100,30.0287)">
    <g
      transform="translate(63.490999,-44.629822)"
      stroke-linejoin="round"
      stroke-dashoffset="1.457"
      paint-order="stroke fill markers"
      id="g30"
    >
      <ellipse
        cx="105.604"
        cy="151.672"
        rx="168.745"
        ry="95.946999"
        fill="url(#d)"
        stroke="#000000"
        stroke-width="0.7"
        id="ellipse24"
        style="fill: url(#d)"
      />
      <ellipse
        cx="104.889"
        cy="151.70599"
        rx="150.55701"
        ry="85.606003"
        fill="none"
        stroke="url(#e)"
        stroke-width="8.307"
        id="ellipse26"
        style="stroke: url(#e)"
      />
      <ellipse
        cx="102.357"
        cy="151.52499"
        rx="135.53101"
        ry="77.061996"
        fill="none"
        stroke="#ffffff"
        stroke-width="3.656"
        id="ellipse28"
      />
    </g>
    <g fill="#404040" id="g52" transform="translate(-2.3250272e-6,-2.2138205)">
      <text
        transform="rotate(-4.3169998)"
        id="text36"
      >
        <tspan x="162" y="84" id="tspan34">
          <tspan
            style="
              -inkscape-font-specification: 'C059 Bold';
              text-align: center;
            "
            font-weight="700"
            font-size="${adjustTextSize(insert)}"
            font-family="C059"
            text-anchor="middle"
            id="tspan32"
          >
            ${insert}
          </tspan>
        </tspan>
      </text>
    <text
      transform="rotate(-4.3169998)"
      id="text58"
    >
      <tspan
        style="fill:url(#f);"
        y="80.058754"
        x="160.03912"
        font-weight="700"
        font-family="C059"
        id="tspan56"
      >
        <tspan
          style="fill: url(#f);"
          font-size="${adjustTextSize(insert)}"
          text-anchor="middle"
          stroke="#000000"
          stroke-width="1.13319"
          id="tspan54"
        >
          ${insert}
        </tspan>
      </tspan>
    </text>
      <text
        id="text50"
         transform="rotate(-4.3169998)"
      >
        <tspan
          y="${hasTitle ? 218 : 190}"
          font-weight="700"
          x="159"
          font-family="C059"
          id="tspan48"
        >
          <tspan
            text-anchor="middle"
            stroke-width="0.7"
            font-size="${adjustTextSize(t("feud"))}"
            stroke-linejoin="round"
            id="tspan46"
          >
            <tspan
              id="tspan44"
            >
              ${t("feud")}
            </tspan>
          </tspan>
        </tspan>
      </text>
    <text
      stroke="#000000"
      transform="rotate(-4.3169998)"
      id="text70"
    >
      <tspan
        y="${hasTitle ? 218 : 187}"
        x="156"
        font-weight="700"
        font-family="C059"
        id="tspan68"
      >
        <tspan
          style="
            -inkscape-font-specification: 'C059 Bold';
            text-align: center;
            fill: url(#h);
          "
         font-size="${adjustTextSize(t("feud"))}"
          text-anchor="middle"
          stroke-width="1.13319"
          id="tspan66"
        >
          ${t("feud")}
        </tspan>
      </tspan>
    </text>

      <text
        x="89.712997"
        transform="rotate(-4.3169998)"
        id="text42"
      >
        <tspan
          style="-inkscape-font-specification: 'C059 Bold'"
          y="${hasTitle ? 148 : 124}"
          x="158"
          font-weight="700"
          font-family="C059"
          id="tspan40"
        >
          <tspan
            style="
              -inkscape-font-specification: 'C059 Bold';
              text-align: center;
            "
            font-size="${adjustTextSize(t("friendly"))}"
            text-anchor="middle"
            stroke-width="0.7"
            stroke-linejoin="round"
            id="tspan38"
          >
            ${t("friendly")}
          </tspan>
        </tspan>
      </text>

    <text
      transform="rotate(-4.3169998)"
      id="text64"
    >
      <tspan
        y="${hasTitle ? 148 : 120}"
        x="155.30832"
        font-weight="700"
        font-family="C059"
        id="tspan62"
      >
        <tspan
          style="fill: url(#g);"
          font-size="${adjustTextSize(t("friendly"))}"
          text-anchor="middle"
          stroke="#000000"
          stroke-width="1.13319"
          stroke-linejoin="round"
          id="tspan60"
        >
          ${t("friendly")}
        </tspan>
      </tspan>
    </text>
    </g>
  </g>
</svg>
  `;
  return (
    <div id="titleLogoImg" className="-mt-16 w-full">
      <div dangerouslySetInnerHTML={{ __html: logo }} />
    </div>
  );
}
