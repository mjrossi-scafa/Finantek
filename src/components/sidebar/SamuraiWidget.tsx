'use client'

export function SamuraiWidget() {
  return (
    <div className="hidden lg:block px-2 py-3">
      <svg width="100%" viewBox="0 0 200 360" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`
            @keyframes slash {
              0%,100% { transform: rotate(0deg); }
              40%,60% { transform: rotate(25deg); }
            }
            @keyframes slashFx {
              0%,35%  { opacity: 0; }
              45%,55% { opacity: 1; }
              65%     { opacity: 0; }
              100%    { opacity: 0; }
            }
            @keyframes coinDrop {
              0%,35%  { opacity: 1; transform: translate(0,0) rotate(0deg); }
              50%     { opacity: 1; transform: translate(-8px, 10px) rotate(-20deg); }
              70%     { opacity: 0; transform: translate(-14px, 28px) rotate(-40deg); }
              100%    { opacity: 0; transform: translate(0,0) rotate(0deg); }
            }
            @keyframes coinDrop2 {
              0%,35%  { opacity: 1; transform: translate(0,0) rotate(0deg); }
              50%     { opacity: 1; transform: translate(8px, 12px) rotate(20deg); }
              70%     { opacity: 0; transform: translate(14px, 30px) rotate(40deg); }
              100%    { opacity: 0; transform: translate(0,0) rotate(0deg); }
            }
            @keyframes blink {
              0%,88%,100% { transform: scaleY(1); }
              93%         { transform: scaleY(0.1); }
            }
            @keyframes quoteSwap {
              0%,40%   { opacity: 1; }
              45%,95%  { opacity: 0; }
              100%     { opacity: 1; }
            }
            @keyframes quoteSwap2 {
              0%,40%   { opacity: 0; }
              45%,95%  { opacity: 1; }
              100%     { opacity: 0; }
            }
            .arm-sword {
              transform-origin: 106px 108px;
              animation: slash 2.8s ease-in-out infinite;
            }
            .slash-fx { animation: slashFx 2.8s ease-in-out infinite; }
            .c1 {
              transform-origin: 72px 100px;
              animation: coinDrop 2.8s ease-in-out infinite;
            }
            .c2 {
              transform-origin: 72px 100px;
              animation: coinDrop2 2.8s ease-in-out infinite;
            }
            .eyes {
              transform-origin: 100px 72px;
              animation: blink 3.5s ease-in-out infinite;
            }
            .q1 { animation: quoteSwap 7s ease-in-out infinite; }
            .q2 { animation: quoteSwap2 7s ease-in-out infinite; }
          `}</style>
        </defs>

        <rect width="200" height="360" fill="#0A0A0F" rx="12"/>
        <rect x="10" y="10" width="3" height="3" fill="#3B1D6E" opacity="0.6"/>
        <rect x="18" y="10" width="3" height="3" fill="#3B1D6E" opacity="0.6"/>
        <rect x="179" y="10" width="3" height="3" fill="#3B1D6E" opacity="0.6"/>
        <rect x="187" y="10" width="3" height="3" fill="#3B1D6E" opacity="0.6"/>
        <rect x="10" y="347" width="3" height="3" fill="#3B1D6E" opacity="0.6"/>
        <rect x="187" y="347" width="3" height="3" fill="#3B1D6E" opacity="0.6"/>

        <rect x="82" y="18" width="36" height="5" rx="1" fill="#7C3AED"/>
        <rect x="78" y="23" width="44" height="8" rx="1" fill="#6D28D9"/>
        <rect x="74" y="31" width="52" height="6" rx="1" fill="#5B21B6"/>
        <rect x="82" y="10" width="5" height="12" rx="1" fill="#A855F7"/>
        <rect x="113" y="10" width="5" height="12" rx="1" fill="#A855F7"/>
        <rect x="97" y="8" width="6" height="16" rx="1" fill="#C084FC"/>

        <rect x="82" y="37" width="36" height="30" rx="2" fill="#1E1040"/>
        <g className="eyes">
          <rect x="88" y="44" width="8" height="7" rx="1" fill="#84CC16"/>
          <rect x="104" y="44" width="8" height="7" rx="1" fill="#84CC16"/>
        </g>
        <rect x="90" y="46" width="3" height="3" fill="#1a2e00"/>
        <rect x="106" y="46" width="3" height="3" fill="#1a2e00"/>
        <rect x="82" y="57" width="36" height="10" rx="2" fill="#4C1D95"/>
        <rect x="88" y="60" width="5" height="2" fill="#1A0A2E"/>
        <rect x="97" y="60" width="6" height="2" fill="#1A0A2E"/>
        <rect x="107" y="60" width="5" height="2" fill="#1A0A2E"/>

        <rect x="92" y="67" width="16" height="6" rx="1" fill="#1E1040"/>

        <rect x="58" y="68" width="24" height="12" rx="2" fill="#7C3AED"/>
        <rect x="118" y="68" width="24" height="12" rx="2" fill="#7C3AED"/>
        <rect x="60" y="70" width="20" height="3" fill="#A855F7" opacity="0.5"/>
        <rect x="120" y="70" width="20" height="3" fill="#A855F7" opacity="0.5"/>

        <rect x="74" y="73" width="52" height="46" rx="3" fill="#5B21B6"/>
        <rect x="78" y="77" width="44" height="38" rx="2" fill="#6D28D9"/>
        <rect x="80" y="79" width="40" height="5" fill="#4C1D95"/>
        <rect x="80" y="87" width="40" height="5" fill="#4C1D95"/>
        <rect x="80" y="95" width="40" height="5" fill="#4C1D95"/>
        <rect x="80" y="103" width="40" height="5" fill="#4C1D95"/>

        <rect x="120" y="79" width="12" height="34" rx="4" fill="#1E1040"/>
        <rect x="120" y="111" width="12" height="10" rx="3" fill="#2D1F4E"/>

        <g className="arm-sword">
          <rect x="68" y="68" width="12" height="40" rx="4" fill="#1E1040"/>
          <rect x="56" y="42" width="12" height="30" rx="4" fill="#1E1040"/>
          <rect x="54" y="38" width="14" height="10" rx="3" fill="#2D1F4E"/>
          <rect x="57" y="10" width="8" height="30" rx="2" fill="#1A0A2E"/>
          <rect x="58" y="14" width="6" height="4" rx="1" fill="#6D28D9"/>
          <rect x="58" y="22" width="6" height="4" rx="1" fill="#6D28D9"/>
          <rect x="58" y="30" width="6" height="4" rx="1" fill="#6D28D9"/>
          <rect x="50" y="38" width="22" height="6" rx="2" fill="#7C3AED"/>
          <rect x="59" y="0" width="5" height="42" rx="1" fill="#C084FC"/>
          <rect x="60" y="0" width="2" height="40" rx="1" fill="#EDE9FE" opacity="0.7"/>
        </g>

        <g className="slash-fx">
          <path d="M 40 60 Q 70 90 55 130" fill="none" stroke="#A855F7" strokeWidth="3" strokeLinecap="round" opacity="0.9"/>
          <path d="M 48 55 Q 78 85 63 125" fill="none" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
          <path d="M 35 70 Q 65 100 50 140" fill="none" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
        </g>

        <g className="c1">
          <circle cx="50" cy="95" r="11" fill="#84CC16"/>
          <circle cx="50" cy="95" r="7" fill="#3F6212"/>
          <text x="50" y="99" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#84CC16">$</text>
        </g>
        <g className="c2">
          <circle cx="62" cy="100" r="8" fill="#65A30D"/>
          <circle cx="62" cy="100" r="5" fill="#3F6212"/>
          <text x="62" y="104" textAnchor="middle" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#84CC16">$</text>
        </g>

        <rect x="78" y="117" width="11" height="20" rx="1" fill="#5B21B6"/>
        <rect x="92" y="117" width="16" height="24" rx="1" fill="#6D28D9"/>
        <rect x="111" y="117" width="11" height="20" rx="1" fill="#5B21B6"/>

        <rect x="82" y="137" width="14" height="38" rx="3" fill="#1E1040"/>
        <rect x="104" y="137" width="14" height="38" rx="3" fill="#1E1040"/>
        <rect x="81" y="155" width="16" height="8" rx="2" fill="#4C1D95"/>
        <rect x="103" y="155" width="16" height="8" rx="2" fill="#4C1D95"/>

        <rect x="78" y="173" width="20" height="8" rx="2" fill="#0F0520"/>
        <rect x="102" y="173" width="20" height="8" rx="2" fill="#0F0520"/>
        <ellipse cx="88" cy="183" rx="12" ry="3" fill="#1A0A2E"/>
        <ellipse cx="112" cy="183" rx="12" ry="3" fill="#1A0A2E"/>
        <rect x="30" y="182" width="140" height="2" rx="1" fill="#2D1F4E"/>

        <rect x="20" y="196" width="160" height="1" fill="#4C1D95" opacity="0.4"/>

        <g className="q1">
          <text x="100" y="216" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C084FC">"No gastes sin intención."</text>
          <text x="100" y="230" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#6D28D9">— Bushido financiero</text>
        </g>
        <g className="q2">
          <text x="100" y="216" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#C084FC">"Cada peso es una flecha."</text>
          <text x="100" y="230" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#6D28D9">— Bushido financiero</text>
        </g>

        <rect x="20" y="240" width="160" height="1" fill="#4C1D95" opacity="0.4"/>
        <text x="100" y="272" textAnchor="middle" fontFamily="serif" fontSize="24" fill="#3B1D6E" opacity="0.6">武士道</text>

        <text x="100" y="294" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="#5B21B6" letterSpacing="2">AHORRO · LVL</text>
        <rect x="30" y="300" width="140" height="6" rx="1" fill="#1A0A2E"/>
        <rect x="30" y="300" width="96" height="6" rx="1" fill="#7C3AED"/>
        <circle cx="126" cy="303" r="5" fill="#A855F7" stroke="#1A0A2E" strokeWidth="1"/>
        <text x="100" y="320" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="#84CC16" letterSpacing="1">▶ MODO SAMURAI</text>

      </svg>
    </div>
  )
}