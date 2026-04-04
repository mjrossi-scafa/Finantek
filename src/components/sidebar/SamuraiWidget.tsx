'use client'

export function SamuraiWidget() {
  return (
    <div className="px-3 py-2">
      <svg width="100%" viewBox="0 0 160 240" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`
            @keyframes cutDown {
              0%,100% { transform: rotate(-40deg); }
              45%,55% { transform: rotate(20deg); }
            }
            @keyframes slashFx {
              0%,40%  { opacity: 0; }
              48%,56% { opacity: 1; }
              66%     { opacity: 0; }
              100%    { opacity: 0; }
            }
            @keyframes coinLeft {
              0%,42%  { opacity: 1; transform: translate(0,0) rotate(0deg); }
              58%     { opacity: 1; transform: translate(-12px,-8px) rotate(-30deg); }
              72%     { opacity: 0; transform: translate(-20px,10px) rotate(-60deg); }
              100%    { opacity: 0; transform: translate(0,0); }
            }
            @keyframes coinRight {
              0%,42%  { opacity: 1; transform: translate(0,0) rotate(0deg); }
              58%     { opacity: 1; transform: translate(12px,10px) rotate(30deg); }
              72%     { opacity: 0; transform: translate(20px,24px) rotate(60deg); }
              100%    { opacity: 0; transform: translate(0,0); }
            }
            @keyframes blinkEye {
              0%,90%,100% { transform: scaleY(1); }
              95%         { transform: scaleY(0.1); }
            }
            @keyframes q1 {
              0%,38%  { opacity: 1; }
              43%,95% { opacity: 0; }
              100%    { opacity: 1; }
            }
            @keyframes q2 {
              0%,38%  { opacity: 0; }
              43%,95% { opacity: 1; }
              100%    { opacity: 0; }
            }
            .arm-down {
              transform-origin: 52px 72px;
              animation: cutDown 2.6s ease-in-out infinite;
            }
            .sfx { animation: slashFx 2.6s ease-in-out infinite; }
            .cl {
              transform-origin: 108px 88px;
              animation: coinLeft 2.6s ease-in-out infinite;
            }
            .cr {
              transform-origin: 118px 96px;
              animation: coinRight 2.6s ease-in-out infinite;
            }
            .ey {
              transform-origin: 80px 52px;
              animation: blinkEye 3.2s ease-in-out infinite;
            }
            .qq1 { animation: q1 6s ease-in-out infinite; }
            .qq2 { animation: q2 6s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* KABUTO */}
        <rect x="62" y="16" width="36" height="4" rx="1" fill="#7C3AED"/>
        <rect x="58" y="20" width="44" height="7" rx="1" fill="#6D28D9"/>
        <rect x="54" y="27" width="52" height="5" rx="1" fill="#5B21B6"/>
        <rect x="62" y="10" width="4" height="10" rx="1" fill="#A855F7"/>
        <rect x="94" y="10" width="4" height="10" rx="1" fill="#A855F7"/>

        {/* CARA */}
        <rect x="62" y="32" width="36" height="26" rx="2" fill="#1E1040"/>
        <g className="ey">
          <rect x="68" y="38" width="7" height="6" rx="1" fill="#84CC16"/>
          <rect x="85" y="38" width="7" height="6" rx="1" fill="#84CC16"/>
        </g>
        <rect x="62" y="50" width="36" height="8" rx="1" fill="#4C1D95"/>
        <rect x="67" y="53" width="4" height="2" fill="#1A0A2E"/>
        <rect x="76" y="53" width="8" height="2" fill="#1A0A2E"/>
        <rect x="89" y="53" width="4" height="2" fill="#1A0A2E"/>

        {/* CUELLO */}
        <rect x="74" y="58" width="12" height="5" rx="1" fill="#1E1040"/>

        {/* HOMBROS */}
        <rect x="44" y="60" width="20" height="10" rx="2" fill="#7C3AED"/>
        <rect x="96" y="60" width="20" height="10" rx="2" fill="#7C3AED"/>

        {/* TORSO */}
        <rect x="56" y="63" width="48" height="40" rx="2" fill="#5B21B6"/>
        <rect x="60" y="67" width="40" height="32" rx="1" fill="#6D28D9"/>
        <rect x="62" y="69" width="36" height="4" fill="#4C1D95"/>
        <rect x="62" y="76" width="36" height="4" fill="#4C1D95"/>
        <rect x="62" y="83" width="36" height="4" fill="#4C1D95"/>
        <rect x="62" y="90" width="36" height="4" fill="#4C1D95"/>

        {/* BRAZO DERECHO quieto */}
        <rect x="98" y="70" width="10" height="28" rx="3" fill="#1E1040"/>
        <rect x="98" y="96" width="10" height="8" rx="2" fill="#2D1F4E"/>

        {/* BRAZO IZQUIERDO + KATANA — corta hacia abajo-derecha */}
        <g className="arm-down">
          <rect x="46" y="60" width="10" height="30" rx="3" fill="#1E1040"/>
          <rect x="38" y="42" width="10" height="22" rx="3" fill="#1E1040"/>
          <rect x="36" y="36" width="12" height="8" rx="2" fill="#2D1F4E"/>
          {/* mango */}
          <rect x="38" y="8" width="7" height="30" rx="2" fill="#1A0A2E"/>
          <rect x="39" y="12" width="5" height="3" rx="1" fill="#6D28D9"/>
          <rect x="39" y="19" width="5" height="3" rx="1" fill="#6D28D9"/>
          <rect x="39" y="26" width="5" height="3" rx="1" fill="#6D28D9"/>
          {/* tsuba */}
          <rect x="32" y="36" width="19" height="5" rx="2" fill="#7C3AED"/>
          {/* hoja */}
          <rect x="39" y="0" width="5" height="38" rx="1" fill="#C084FC"/>
          <rect x="40" y="0" width="2" height="36" rx="1" fill="#EDE9FE" opacity="0.8"/>
        </g>

        {/* MONEDAS al frente derecha del samurai, altura torso */}
        <g className="cl">
          <circle cx="108" cy="82" r="10" fill="#84CC16"/>
          <circle cx="108" cy="82" r="6" fill="#3F6212"/>
          <text x="108" y="86" textAnchor="middle" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#84CC16">$</text>
        </g>
        <g className="cr">
          <circle cx="122" cy="90" r="8" fill="#65A30D"/>
          <circle cx="122" cy="90" r="5" fill="#3F6212"/>
          <text x="122" y="94" textAnchor="middle" fontFamily="monospace" fontSize="6" fontWeight="bold" fill="#84CC16">$</text>
        </g>

        {/* SLASH FX diagonal arriba-izq → abajo-der */}
        <g className="sfx">
          <line x1="55" y1="55" x2="125" y2="110" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="50" y1="60" x2="120" y2="115" stroke="#C084FC" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
          <line x1="60" y1="50" x2="130" y2="105" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
        </g>

        {/* FALDA */}
        <rect x="60" y="101" width="10" height="16" rx="1" fill="#5B21B6"/>
        <rect x="73" y="101" width="14" height="20" rx="1" fill="#6D28D9"/>
        <rect x="90" y="101" width="10" height="16" rx="1" fill="#5B21B6"/>

        {/* PIERNAS */}
        <rect x="64" y="117" width="12" height="28" rx="2" fill="#1E1040"/>
        <rect x="84" y="117" width="12" height="28" rx="2" fill="#1E1040"/>

        {/* PIES */}
        <rect x="61" y="143" width="17" height="6" rx="2" fill="#0F0520"/>
        <rect x="82" y="143" width="17" height="6" rx="2" fill="#0F0520"/>

        {/* Suelo */}
        <rect x="20" y="150" width="120" height="1" rx="1" fill="#2D1F4E" opacity="0.5"/>

        {/* FRASES */}
        <rect x="8" y="162" width="144" height="0.5" fill="#4C1D95" opacity="0.4"/>
        <g className="qq1">
          <text x="80" y="178" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#9F7AEA">"No gastes sin intención."</text>
        </g>
        <g className="qq2">
          <text x="80" y="178" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#9F7AEA">"Cada peso, una victoria."</text>
        </g>
        <text x="80" y="192" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#4C1D95">武士道 · Bushido</text>
        <rect x="8" y="200" width="144" height="0.5" fill="#4C1D95" opacity="0.4"/>

      </svg>
    </div>
  )
}