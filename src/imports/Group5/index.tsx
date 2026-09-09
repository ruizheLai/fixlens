import svgPaths from "./svg-mdqo0x8mrn";

function Fix() {
  return (
    <div className="absolute h-[100px] left-0 top-0 w-[181.352px]" data-name="Fix">
      <svg className="absolute block inset-0 size-full" fill="none" height="100" preserveAspectRatio="none" viewBox="0 0 181.352 100" width="181.352">
        <g id="Fix">
          <path d={svgPaths.p1657d9f0} fill="#1C4B88" id="Vector" />
          <path d={svgPaths.p3989b100} fill="#1C4B88" id="Vector_2" />
          <path d={svgPaths.p2f1106f0} fill="#1C4B88" id="Vector_3" />
        </g>
      </svg>
    </div>
  );
}

function Lens() {
  return (
    <div className="absolute h-[94.545px] left-0 top-0 w-[251.448px]" data-name="Lens">
      <svg className="absolute block inset-0 size-full" fill="none" height="94.5455" preserveAspectRatio="none" viewBox="0 0 251.448 94.5455" width="251.448">
        <g id="Lens">
          <path d={svgPaths.p3294e300} fill="#2563EB" id="Vector" />
          <path d={svgPaths.pf7daa00} fill="#2563EB" id="Vector_2" />
          <path d={svgPaths.p3a22f880} fill="#2563EB" id="Vector_3" />
          <path d={svgPaths.p22a21160} fill="#2563EB" id="Vector_4" />
        </g>
      </svg>
    </div>
  );
}

export default function Group() {
  return (
    <div className="contents relative size-full">
      <Fix />
      <Lens />
    </div>
  );
}