import { ChartNoAxesCombined, ChartPie, ClipboardCheck, Settings, UsersRound } from "lucide-react";
import styles from "./login.module.css";

const connections = [
  { id: "login-chart-path", path: "M92 44H175Q191 44 191 61V91", color: "#8be5ff", start: "0s" },
  { id: "login-check-path", path: "M270 69H237Q219 69 219 85V92", color: "#8be5ff", start: "0.45s" },
  { id: "login-settings-path", path: "M59 174V147Q59 128 79 128H130", color: "#ffd66c", start: "0.6s" },
  { id: "login-pie-path", path: "M229 134H282Q301 134 301 153V200", color: "#8be5ff", start: "0.9s" },
];

const networkNodes = [
  { Icon: ChartNoAxesCombined, x: 59, y: 13 },
  { Icon: ClipboardCheck, x: 265, y: 37 },
  { Icon: Settings, x: 28, y: 168 },
  { Icon: ChartPie, x: 264, y: 194 },
];

export function LoginNetwork() {
  return (
    <svg className={styles.network} viewBox="0 0 340 264" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="login-node-edge" x2="0" y2="1">
          <stop stopColor="#74deff" />
          <stop offset="1" stopColor="#f7ce64" />
        </linearGradient>
        <linearGradient id="login-node-fill" x2="0" y2="1">
          <stop stopColor="#0b4778" />
          <stop offset="1" stopColor="#061f48" />
        </linearGradient>
      </defs>
      {connections.map(({ id, path, color, start }) => (
        <g key={id}>
          <path id={id} d={path} stroke="#64c9ff" strokeOpacity=".5" fill="none" />
          <circle className={styles.signal} r="2.5" fill={color} style={{ animationDelay: start }}>
            <animateMotion begin={start} dur="3.5s" fill="freeze">
              <mpath href={`#${id}`} />
            </animateMotion>
          </circle>
        </g>
      ))}
      {networkNodes.map(({ Icon, x, y }) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <rect width="64" height="62" rx="15" fill="url(#login-node-fill)" stroke="#2c9cdb" />
          <Icon x="15" y="14" width="34" height="34" color="#92d9fe" strokeWidth={1.5} />
        </g>
      ))}
      <rect
        className={styles.networkCore}
        x="132" y="89" width="98" height="92" rx="22"
        fill="url(#login-node-fill)" stroke="url(#login-node-edge)" strokeWidth="2"
      />
      <UsersRound x="155" y="109" width="52" height="52" color="#dcf5ff" strokeWidth={1.8} />
    </svg>
  );
}

export function LoginIdentityArt() {
  return (
    <svg className={styles.identityArt} viewBox="0 0 760 940" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="login-blue-wave" x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="#031b3f" />
          <stop offset=".58" stopColor="#0a4d87" />
          <stop offset="1" stopColor="#062651" />
        </linearGradient>
        <linearGradient id="login-gold-wave">
          <stop stopColor="#258bce" stopOpacity=".25" />
          <stop offset=".33" stopColor="#258bce" />
          <stop offset=".65" stopColor="#ffcf56" />
          <stop offset="1" stopColor="#f4ae1b" />
        </linearGradient>
        <pattern id="login-night-dots" width="17" height="17" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.8" fill="#42b8ff" />
        </pattern>
      </defs>
      <path d="M0 364C145 131 552 223 760 0H679C467 162 131 86 0 322Z" fill="url(#login-blue-wave)" opacity=".5" />
      <path d="M0 321C131 86 467 162 679 0" fill="none" stroke="#2794d4" strokeOpacity=".66" />
      <path d="M0 667C186 507 425 536 760 260V296C430 576 171 543 0 669Z" fill="#1e76bd" opacity=".22" />
      <path d="M0 798C220 538 430 945 760 749V940H0Z" fill="#041d46" />
      <path d="M0 798C220 538 430 945 760 749" fill="none" stroke="url(#login-gold-wave)" strokeWidth="2" />
      <path d="M0 904C364 730 452 995 760 762V821C480 1032 378 767 0 928Z" fill="url(#login-blue-wave)" opacity=".87" />
      <path d="M0 904C364 730 452 995 760 762" fill="none" stroke="url(#login-gold-wave)" strokeWidth="3" />
      <path
        className={styles.skyline}
        d="M26 839Q128 782 318 808M51 827V805M45 812L51 817L58 810M33 809C19 809 23 788 38 786C40 775 61 775 65 788C80 788 80 807 68 809M94 815V789H111V810M111 810V770L139 747L165 770V803M139 747V731M132 738H146M125 805V789Q138 777 147 790V801M132 766H144V777H132ZM171 802V784L179 778L186 784V801M197 801V761H234V800M211 799V781H222V799M246 801V751H262V761H276V804M251 774H267M251 783H264M251 793H264M312 807V785M306 793L312 798L319 791M298 792C284 791 287 776 300 774C305 762 323 766 327 777C341 778 341 794 327 796"
        stroke="#42a9e8" strokeOpacity=".7" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <rect x="10" y="13" width="92" height="54" fill="url(#login-night-dots)" opacity=".6" />
      <rect x="668" y="871" width="94" height="64" fill="url(#login-night-dots)" opacity=".42" />
    </svg>
  );
}

export function LoginAccessArt() {
  return (
    <svg className={styles.accessArt} viewBox="0 0 760 940" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="login-day-wave" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#d7e4f5" />
          <stop offset="1" stopColor="#f6f9ff" />
        </linearGradient>
        <pattern id="login-day-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2" fill="#91add3" />
        </pattern>
      </defs>
      <path d="M0 48C230 -84 313 67 503 24L758 0H0Z" fill="#d7e6f8" opacity=".52" />
      <path d="M418 0C466 94 606 119 760 143V0Z" fill="url(#login-day-wave)" />
      <path d="M516 0C570 92 662 124 760 143" fill="none" stroke="#dca727" strokeWidth="1.5" />
      <path d="M274 940C448 810 605 960 760 724V940Z" fill="url(#login-day-wave)" />
      <path d="M475 940C566 906 697 895 760 815" fill="none" stroke="#dca727" strokeWidth="1.5" />
      <rect x="662" y="24" width="95" height="60" fill="url(#login-day-dots)" opacity=".46" />
      <rect x="0" y="866" width="85" height="66" fill="url(#login-day-dots)" opacity=".52" />
    </svg>
  );
}
