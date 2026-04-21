import type { ReactElement } from 'react';

type Point = { x: number; y: number };

// Isometric projection: world(x, y, z) -> screen(px)
//   floor origin at screen (300, 400)
//   world X axis  -> screen (+50, -30)
//   world Y axis  -> screen (-50, -30)
//   world Z axis  -> screen (0, -60)
const iso = (x: number, y: number, z = 0): Point => ({
  x: 300 + (x - y) * 50,
  y: 400 - (x + y) * 30 - z * 60,
});

const pp = (...points: Point[]) => points.map((p) => `${p.x},${p.y}`).join(' ');

type BoxProps = {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  top: string;
  leftFace: string;
  rightFace: string;
};

function Box({ x, y, w, d, h, top, leftFace, rightFace }: BoxProps) {
  const At = iso(x, y, h);
  const Bt = iso(x + w, y, h);
  const Ct = iso(x + w, y + d, h);
  const Dt = iso(x, y + d, h);
  const Ab = iso(x, y, 0);
  const Bb = iso(x + w, y, 0);
  const Db = iso(x, y + d, 0);
  return (
    <g>
      {/* screen-left face = world x=x face */}
      <polygon points={pp(At, Dt, Db, Ab)} fill={leftFace} />
      {/* screen-right face = world y=y face */}
      <polygon points={pp(At, Bt, Bb, Ab)} fill={rightFace} />
      {/* top face */}
      <polygon points={pp(At, Bt, Ct, Dt)} fill={top} />
    </g>
  );
}

/**
 * Hand-drawn isometric bedroom scene in SVG, using the 16-Bit Atélier palette.
 * Meant to sit inside an `aspect-square` container — fills via viewBox.
 */
export function IsometricBedroom() {
  // room corners
  const LT = iso(-2, 2, 0);
  const BK = iso(2, 2, 0);
  const RT = iso(2, -2, 0);
  const FL = iso(-2, -2, 0);
  const BK_T = iso(2, 2, 3);
  const LT_T = iso(-2, 2, 3);
  const RT_T = iso(2, -2, 3);

  // window (back-left wall, wy = 2)
  const winA = iso(-0.8, 2, 2.3);
  const winB = iso(0.6, 2, 2.3);
  const winC = iso(0.6, 2, 1.1);
  const winD = iso(-0.8, 2, 1.1);

  // picture frame (back-right wall, wx = 2)
  const picA = iso(2, 0.1, 2.45);
  const picB = iso(2, -0.9, 2.45);
  const picC = iso(2, -0.9, 1.65);
  const picD = iso(2, 0.1, 1.65);
  const picCenter = {
    x: (picA.x + picB.x + picC.x + picD.x) / 4,
    y: (picA.y + picB.y + picC.y + picD.y) / 4,
  };

  // rug
  const rug = [iso(-1.3, -1.3), iso(1.3, -1.3), iso(1.3, 1.3), iso(-1.3, 1.3)] as const;

  return (
    <svg
      viewBox="0 0 600 600"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Isometric cozy bedroom"
    >
      <defs>
        <linearGradient id="iso-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8eb3ff" />
          <stop offset="1" stopColor="#d7e4ff" />
        </linearGradient>
        <linearGradient id="iso-monitor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b3d6d" />
          <stop offset="1" stopColor="#2a5fa8" />
        </linearGradient>
      </defs>

      {/* Soft ground shadow */}
      <ellipse cx="300" cy="548" rx="240" ry="22" fill="#7e572e" opacity="0.16" />

      {/* Walls */}
      <polygon points={pp(LT, LT_T, BK_T, BK)} fill="#c9602c" />
      <polygon points={pp(BK, BK_T, RT_T, RT)} fill="#a8451e" />

      {/* Floor */}
      <polygon points={pp(LT, BK, RT, FL)} fill="#e6b87a" />
      {/* Plank seams parallel to X axis */}
      {[-1.3, -0.6, 0.1, 0.8, 1.4].map((wx) => {
        const p1 = iso(wx, -2);
        const p2 = iso(wx, 2);
        return (
          <line
            key={`plank-${wx}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke="#7e572e"
            strokeWidth="2"
            opacity="0.32"
          />
        );
      })}

      {/* Baseboards */}
      <polygon
        points={pp(iso(-2, 2, 0), iso(-2, 2, 0.15), iso(2, 2, 0.15), iso(2, 2, 0))}
        fill="#5a3811"
        opacity="0.55"
      />
      <polygon
        points={pp(iso(2, 2, 0), iso(2, 2, 0.15), iso(2, -2, 0.15), iso(2, -2, 0))}
        fill="#3a2210"
        opacity="0.55"
      />

      {/* Rug (layered for depth) */}
      <polygon points={pp(...rug)} fill="#004fac" />
      <polygon
        points={pp(iso(-1.1, -1.1), iso(1.1, -1.1), iso(1.1, 1.1), iso(-1.1, 1.1))}
        fill="#005bc3"
      />
      <polygon
        points={pp(iso(-0.55, -0.55), iso(0.55, -0.55), iso(0.55, 0.55), iso(-0.55, 0.55))}
        fill="#a5c1ff"
        opacity="0.45"
      />

      {/* Window on back-left wall */}
      <g>
        <polygon points={pp(winA, winB, winC, winD)} fill="url(#iso-sky)" />
        {/* clouds */}
        <ellipse
          cx={winA.x + (winB.x - winA.x) * 0.3}
          cy={winA.y + (winB.y - winA.y) * 0.3 + 18}
          rx="18"
          ry="6"
          fill="#fbf9f4"
          opacity="0.85"
        />
        <ellipse
          cx={winA.x + (winB.x - winA.x) * 0.72}
          cy={winA.y + (winB.y - winA.y) * 0.72 + 34}
          rx="14"
          ry="5"
          fill="#fbf9f4"
          opacity="0.7"
        />
        {/* frame */}
        <polygon points={pp(winA, winB, winC, winD)} fill="none" stroke="#7e572e" strokeWidth="5" />
        <line
          x1={(winA.x + winD.x) / 2}
          y1={(winA.y + winD.y) / 2}
          x2={(winB.x + winC.x) / 2}
          y2={(winB.y + winC.y) / 2}
          stroke="#7e572e"
          strokeWidth="3"
        />
        <line
          x1={(winA.x + winB.x) / 2}
          y1={(winA.y + winB.y) / 2}
          x2={(winD.x + winC.x) / 2}
          y2={(winD.y + winC.y) / 2}
          stroke="#7e572e"
          strokeWidth="3"
        />
      </g>

      {/* Picture frame on back-right wall */}
      <g>
        <polygon points={pp(picA, picB, picC, picD)} fill="#7e572e" />
        <polygon
          points={pp(
            {
              x: picA.x + (picCenter.x - picA.x) * 0.14,
              y: picA.y + (picCenter.y - picA.y) * 0.14,
            },
            {
              x: picB.x + (picCenter.x - picB.x) * 0.14,
              y: picB.y + (picCenter.y - picB.y) * 0.14,
            },
            {
              x: picC.x + (picCenter.x - picC.x) * 0.14,
              y: picC.y + (picCenter.y - picC.y) * 0.14,
            },
            {
              x: picD.x + (picCenter.x - picD.x) * 0.14,
              y: picD.y + (picCenter.y - picD.y) * 0.14,
            },
          )}
          fill="#fbf9f4"
        />
        {/* silhouette */}
        <circle cx={picCenter.x} cy={picCenter.y - 10} r="9" fill="#502f09" />
        <rect x={picCenter.x - 12} y={picCenter.y - 2} width="24" height="16" fill="#502f09" />
      </g>

      {/* Bookshelf in the back-left corner */}
      <Box
        x={-1.9}
        y={0.0}
        w={0.3}
        d={1.9}
        h={1.8}
        top="#5a3811"
        leftFace="#502f09"
        rightFace="#3a2210"
      />
      {[0.3, 0.75, 1.2].map((shelfZ) => {
        const s1 = iso(-1.9, 0.0, shelfZ);
        const s2 = iso(-1.9, 1.9, shelfZ);
        return (
          <line
            key={`shelf-${shelfZ}`}
            x1={s1.x}
            y1={s1.y}
            x2={s2.x}
            y2={s2.y}
            stroke="#e1af7e"
            strokeWidth="3"
            opacity="0.8"
          />
        );
      })}
      {/* Books on shelves */}
      {(() => {
        const books: ReactElement[] = [];
        const colors = ['#005bc3', '#006f1c', '#7e572e', '#ac3434', '#004fac', '#a84d22'];
        [0.35, 0.8, 1.25].forEach((baseZ, row) => {
          for (let i = 0; i < 5; i++) {
            const wy = 0.1 + i * 0.3;
            const color = colors[(row * 5 + i) % colors.length];
            books.push(
              <Box
                key={`book-${row}-${i}`}
                x={-1.85}
                y={wy}
                w={0.05}
                d={0.15}
                h={0.35}
                top={color}
                leftFace={color}
                rightFace={color}
              />,
            );
            void baseZ;
          }
        });
        return books;
      })()}

      {/* Desk (against back-left wall, to the right of bookshelf) */}
      <Box
        x={-1.5}
        y={1.1}
        w={1.0}
        d={0.8}
        h={0.05}
        top="#e6b87a"
        leftFace="#a5784a"
        rightFace="#8a5f37"
      />
      {/* desk legs */}
      {[
        [-1.45, 1.15],
        [-0.55, 1.15],
        [-1.45, 1.85],
        [-0.55, 1.85],
      ].map(([lx, ly], i) => (
        <Box
          key={`leg-${i}`}
          x={lx!}
          y={ly!}
          w={0.05}
          d={0.05}
          h={0.9}
          top="#5a3811"
          leftFace="#3a2210"
          rightFace="#291507"
        />
      ))}

      {/* Monitor base */}
      <Box
        x={-1.2}
        y={1.45}
        w={0.4}
        d={0.1}
        h={0.1}
        top="#31332e"
        leftFace="#1a1b18"
        rightFace="#0e0e0c"
      />
      {/* Monitor screen */}
      {(() => {
        const base = { x: -1.15, y: 1.5, z: 1.05 };
        const w = 0.7;
        const d = 0.06;
        const h = 0.55;
        const At = iso(base.x, base.y, base.z + h);
        const Bt = iso(base.x + w, base.y, base.z + h);
        const Ct = iso(base.x + w, base.y + d, base.z + h);
        const Dt = iso(base.x, base.y + d, base.z + h);
        const Ab = iso(base.x, base.y, base.z);
        const Bb = iso(base.x + w, base.y, base.z);
        const Db = iso(base.x, base.y + d, base.z);
        const screenInset = 0.05;
        const screenAt = iso(base.x + screenInset, base.y, base.z + h - screenInset);
        const screenBt = iso(base.x + w - screenInset, base.y, base.z + h - screenInset);
        const screenBb = iso(base.x + w - screenInset, base.y, base.z + screenInset);
        const screenAb = iso(base.x + screenInset, base.y, base.z + screenInset);
        return (
          <g>
            <polygon points={pp(At, Dt, Db, Ab)} fill="#1a1b18" />
            <polygon points={pp(At, Bt, Bb, Ab)} fill="#31332e" />
            <polygon points={pp(At, Bt, Ct, Dt)} fill="#0e0e0c" />
            <polygon points={pp(screenAt, screenBt, screenBb, screenAb)} fill="url(#iso-monitor)" />
          </g>
        );
      })()}

      {/* Keyboard on desk */}
      <Box
        x={-1.3}
        y={1.15}
        w={0.7}
        d={0.2}
        h={0.04}
        top="#31332e"
        leftFace="#1a1b18"
        rightFace="#0e0e0c"
      />

      {/* Lamp on desk corner */}
      {(() => {
        const base = iso(-1.4, 1.8, 1.05);
        return (
          <g>
            <rect x={base.x - 2} y={base.y - 34} width="4" height="32" fill="#502f09" />
            <circle cx={base.x} cy={base.y} r="6" fill="#7e572e" />
            <ellipse cx={base.x} cy={base.y - 42} rx="14" ry="10" fill="#e1af7e" />
            <ellipse cx={base.x} cy={base.y - 38} rx="9" ry="4" fill="#fff7d1" opacity="0.9" />
          </g>
        );
      })()}

      {/* Chair */}
      <Box
        x={-0.95}
        y={0.35}
        w={0.6}
        d={0.6}
        h={0.55}
        top="#502f09"
        leftFace="#3a2210"
        rightFace="#291507"
      />
      {/* chair back */}
      <Box
        x={-0.95}
        y={0.85}
        w={0.6}
        d={0.1}
        h={1.05}
        top="#7e572e"
        leftFace="#5a3811"
        rightFace="#502f09"
      />

      {/* Bed (right side, against back-right wall) */}
      {/* bed frame */}
      <Box
        x={0.5}
        y={-1.9}
        w={1.4}
        d={1.9}
        h={0.3}
        top="#7e572e"
        leftFace="#5a3811"
        rightFace="#502f09"
      />
      {/* mattress */}
      <Box
        x={0.55}
        y={-1.85}
        w={1.3}
        d={1.8}
        h={0.2}
        top="#fbf9f4"
        leftFace="#e9e8e1"
        rightFace="#dadad2"
      />
      {/* blanket covering foot half */}
      <Box
        x={0.55}
        y={-1.85}
        w={1.3}
        d={1.15}
        h={0.24}
        top="#005bc3"
        leftFace="#004292"
        rightFace="#003a81"
      />
      {/* pillow */}
      <Box
        x={0.65}
        y={-0.55}
        w={1.1}
        d={0.35}
        h={0.28}
        top="#fbf9f4"
        leftFace="#e9e8e1"
        rightFace="#dadad2"
      />
      {/* headboard */}
      <Box
        x={0.5}
        y={-0.2}
        w={1.4}
        d={0.1}
        h={1.0}
        top="#5a3811"
        leftFace="#3a2210"
        rightFace="#291507"
      />

      {/* Side table beside bed */}
      <Box
        x={0.5}
        y={-1.0}
        w={0.35}
        d={0.35}
        h={0.55}
        top="#e1af7e"
        leftFace="#a5784a"
        rightFace="#8a5f37"
      />

      {/* Plant pot on side table */}
      {(() => {
        const potX = 0.57;
        const potY = -0.93;
        const potZ = 0.55;
        return (
          <g>
            <Box
              x={potX}
              y={potY}
              w={0.22}
              d={0.22}
              h={0.22}
              top="#502f09"
              leftFace="#3a2210"
              rightFace="#291507"
            />
            {(() => {
              const center = iso(potX + 0.11, potY + 0.11, potZ + 0.22);
              return (
                <g transform={`translate(${center.x}, ${center.y})`}>
                  <ellipse cx={0} cy={-18} rx="14" ry="22" fill="#006f1c" />
                  <ellipse cx={-11} cy={-10} rx="10" ry="14" fill="#006118" />
                  <ellipse cx={11} cy={-8} rx="10" ry="14" fill="#006218" />
                  <ellipse cx={0} cy={-34} rx="9" ry="13" fill="#008023" />
                </g>
              );
            })()}
          </g>
        );
      })()}

      {/* Large floor plant in back-right corner */}
      <Box
        x={1.55}
        y={1.55}
        w={0.4}
        d={0.4}
        h={0.35}
        top="#502f09"
        leftFace="#3a2210"
        rightFace="#291507"
      />
      {(() => {
        const center = iso(1.75, 1.75, 0.35);
        return (
          <g transform={`translate(${center.x}, ${center.y})`}>
            <ellipse cx={0} cy={-28} rx="24" ry="38" fill="#006f1c" />
            <ellipse cx={-18} cy={-18} rx="14" ry="22" fill="#006118" />
            <ellipse cx={18} cy={-14} rx="14" ry="22" fill="#006218" />
            <ellipse cx={0} cy={-56} rx="14" ry="20" fill="#008023" />
          </g>
        );
      })()}

      {/* Small stool in front-left */}
      <Box
        x={-1.7}
        y={-1.7}
        w={0.35}
        d={0.35}
        h={0.35}
        top="#e1af7e"
        leftFace="#a5784a"
        rightFace="#8a5f37"
      />
    </svg>
  );
}
