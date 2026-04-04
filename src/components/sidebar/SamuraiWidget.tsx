'use client'

export function SamuraiWidget() {
  return (
    <div className="px-3 py-2">
      <svg width="100%" viewBox="0 0 160 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>{`
            @keyframes cut {
              0%,100% { transform: rotate(-30deg) translateY(-8px); }
              45%,55% { transform: rotate(15deg) translateY(8px); }
            }
            @keyframes slashFx {
              0%,40%  { opacity: 0; }
              48%,56% { opacity: 1; }
              65%     { opacity: 0; }
              100%    { opacity: 0; }
            }
            @keyframes coinFall {
              0%,40%   { opacity: 1; transform: translate(0,0) rotate(0deg); }
              55%      { opacity: 1; transform: translate(-6px,14px) rotate(-25deg); }
              75%      { opacity: 0; transform: translate(-10px,28px) rotate(-45deg); }
              100%     { opacity: 0; transform: translate(0,0); }
            }
            @keyframes coinFall2 {
              0%,40%   { opacity: 1; transform: translate(0,0) rotate(0deg); }
              55%      { opacity: 1; transform: translate(6px,16px) rotate(25deg); }
              75%      { opacity: 0; transform: translate(10px,30px) rotate(45deg); }
              100%     { opacity: 0; transform: translate(0,0); }
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
            .arm {
              transform-origin: 72px 75px;
              animation: cut 2.6s ease-in-out infinite;
            }
            .sfx { animation: slashFx 2.6s ease-in-out infinite; }
            .cf1 {
              transform-origin: 60px 118px;
              animation: coinFall 2.6s ease-in-out infinite;
            }
            .cf2 {
              transform-origin: 72px 118px;
              animation: coinFall2 2.6s ease-in-out infinite;
            }
            .ey {
              transform-origin: 80px 52px;
              animation: blinkEye 3.2s ease-in-out infinite;
            }
            .qq1 { animation: q1 6s ease-in-out infinite; }
            .qq2 { animation: q2 6s ease-in-out infinite; }
          `}</style>
        </defs>

        {/* Fondo transparente — se integra al sidebar */}

        {/* KABUTO */}
        <rect x="62" y="16" width="36" height="4" rx="1" fill="#7C3AED"/>
        <rect x="58" y="20" width="44" height="7" rx="1" fill="#6D28D9"/>
        <rect x="54" y="27" width="52" height="5" rx="1" fill="#5B21B6"/>
        {/* cuernos */}
        <rect x="62" y="10" width="4" height="10" rx="1" fill="#A855F7"/>
        <rect x="94" y="10" width="4" height="10" rx="1" fill="#A855F7"/>

        {/* CARA */}
        <rect x="62" y="32" width="36" height="26" rx="2" fill="#1E1040"/>
        {/* ojos */}
        <g className="ey">
          <rect x="68" y="38" width="7" height="6" rx="1" fill="#84CC16"/>
          <rect x="85" y="38" width="7" height="6" rx="1" fill="#84CC16"/>
        </g>
        {/* mascara */}
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

        {/* BRAZO IZQUIERDO + KATANA animado (corta hacia abajo) */}
        <g className="arm">
          {/* brazo */}
          <rect x="52" y="60" width="10" height="32" rx="3" fill="#1E1040"/>
          {/* antebrazo diagonal */}
          <rect x="40" y="46" width="10" height="22" rx="3" fill="#1E1040"/>
          {/* mano */}
          <rect x="38" y="40" width="12" height="8" rx="2" fill="#2D1F4E"/>
          {/* KATANA apuntando hacia abajo-derecha */}
          {/* mango */}
          <rect x="40" y="14" width="7" height="28" rx="2" fill="#1A0A2E"/>
          <rect x="41" y="18" width="5" height="3" rx="1" fill="#6D28D9"/>
          <rect x="41" y="25" width="5" height="3" rx="1" fill="#6D28D9"/>
          <rect x="41" y="32" width="5" height="3" rx="1" fill="#6D28D9"/>
          {/* tsuba */}
          <rect x="34" y="40" width="19" height="5" rx="2" fill="#7C3AED"/>
          {/* hoja larga hacia arriba */}
          <rect x="41" y="0" width="5" height="42" rx="1" fill="#C084FC"/>
          <rect x="42" y="0" width="2" height="40" rx="1" fill="#EDE9FE" opacity="0.8"/>
        </g>

        {/* SLASH FX diagonal */}
        <g className="sfx">
          <line x1="48" y1="95" x2="90" y2="130" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="44" y1="100" x2="86" y2="135" stroke="#C084FC" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
          <line x1="52" y1="92" x2="94" y2="127" stroke="#A855F7" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
        </g>

        {/* MONEDAS que caen al ser cortadas */}
        <g className="cf1">
          <circle cx="66" cy="118" r="10" fill="#84CC16"/>
          <circle cx="66" cy="118" r="6" fill="#3F6212"/>
          <text x="66" y="122" textAnchor="middle" fontFamily="monospace" fontSize="7" fontWeight="bold" fill="#84CC16">$</text>
        </g>
        <g className="cf2">
          <circle cx="82" cy="122" r="8" fill="#65A30D"/>
          <circle cx="82" cy="122" r="5" fill="#3F6212"/>
          <text x="82" y="126" textAnchor="middle" fontFamily="monospace" fontSize="6" fontWeight="bold" fill="#84CC16">$</text>
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

        {/* Línea suelo */}
        <rect x="30" y="150" width="100" height="1" rx="1" fill="#2D1F4E" opacity="0.6"/>

        {/* FRASES */}
        <rect x="10" y="160" width="140" height="0.5" fill="#4C1D95" opacity="0.4"/>

        <g className="qq1">
          <text x="80" y="176" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#9F7AEA">"No gastes sin intención."</text>
        </g>
        <g className="qq2">
          <text x="80" y="176" textAnchor="middle" fontFamily="sans-serif" fontSize="9" fill="#9F7AEA">"Cada peso, una victoria."</text>
        </g>
        <text x="80" y="190" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fill="#4C1D95">武士道 · Bushido</text>

        <rect x="10" y="198" width="140" height="0.5" fill="#4C1D95" opacity="0.4"/>

      </svg>
    </div>
  )
}