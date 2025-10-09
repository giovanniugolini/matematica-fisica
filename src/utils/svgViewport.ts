// src/utils/svgViewport.ts
export type WorldRect = { xmin: number; xmax: number; ymin: number; ymax: number };

export function makeViewport(WIDTH: number, HEIGHT: number, world: WorldRect) {
    const worldW = world.xmax - world.xmin;
    const worldH = world.ymax - world.ymin;
    const scale = Math.min(WIDTH / worldW, HEIGHT / worldH); // "meet"
    const offsetX = (WIDTH - scale * worldW) / 2;
    const offsetY = (HEIGHT - scale * worldH) / 2;

    const toX = (x: number) => offsetX + (x - world.xmin) * scale;
    const toY = (y: number) => HEIGHT - (offsetY + (y - world.ymin) * scale);
    const fromX = (px: number) => world.xmin + (px - offsetX) / scale;
    const fromY = (py: number) => world.ymin + (HEIGHT - py - offsetY) / scale;

    function clientToViewBox(clientX: number, clientY: number, svgEl: SVGSVGElement) {
        const rect = svgEl.getBoundingClientRect();
        const xView = (clientX - rect.left) * (WIDTH / rect.width);
        const yView = (clientY - rect.top) * (HEIGHT / rect.height);
        return { x: xView, y: yView };
    }

    function clientToWorld(clientX: number, clientY: number, svgEl: SVGSVGElement) {
        const vb = clientToViewBox(clientX, clientY, svgEl);
        return { x: fromX(vb.x), y: fromY(vb.y) };
    }

    function nearInViewBox(mouseView: { x: number; y: number }, worldPt: { x: number; y: number }, radiusPx = 22) {
        const cx = toX(worldPt.x), cy = toY(worldPt.y);
        const dx = cx - mouseView.x, dy = cy - mouseView.y;
        return Math.hypot(dx, dy) <= radiusPx;
    }

    return { toX, toY, fromX, fromY, offsetX, offsetY, scale, clientToViewBox, clientToWorld, nearInViewBox };
}

export function isCoarsePointer(): boolean {
    return typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
}
