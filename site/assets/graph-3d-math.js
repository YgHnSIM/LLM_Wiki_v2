export const DEFAULT_CAMERA = Object.freeze({
  yaw: -0.38,
  pitch: 0.66,
  zoom: 1,
  panX: 0,
  panY: 18,
  distance: 5200,
  flat: false,
});

export const CAMERA_LIMITS = Object.freeze({
  minimumPitch: 0.22,
  maximumPitch: 1.2,
  minimumZoom: 0.55,
  maximumZoom: 3.4,
  nearPlane: 48,
});

export function clamp(minimum, maximum, value) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function edgeDirectionForNode(edge, nodeId) {
  if (!edge || !nodeId) return '';
  const outgoing = edge.source === nodeId;
  const incoming = edge.target === nodeId;
  if (outgoing && incoming) return 'both';
  if (outgoing) return 'outgoing';
  if (incoming) return 'incoming';
  return '';
}

export function circularMinimapPoint(point, dimensions, viewport, padding = 0) {
  const width = Math.max(1, Number(viewport?.width) || 1);
  const height = Math.max(1, Number(viewport?.height) || 1);
  const worldWidth = Math.max(1, Number(dimensions?.width) || 1);
  const worldHeight = Math.max(1, Number(dimensions?.height) || 1);
  const inset = Math.max(0, Number(padding) || 0);
  const radius = Math.max(0, Math.min(width, height) / 2 - inset);
  const squareX = clamp(-1, 1, Number(point?.x) / worldWidth * 2 - 1);
  const squareY = clamp(-1, 1, Number(point?.y) / worldHeight * 2 - 1);

  if (Math.abs(squareX) < Number.EPSILON && Math.abs(squareY) < Number.EPSILON) {
    return { x: width / 2, y: height / 2 };
  }

  let radialDistance;
  let angle;
  if (Math.abs(squareX) > Math.abs(squareY)) {
    radialDistance = squareX;
    angle = Math.PI / 4 * (squareY / squareX);
  } else {
    radialDistance = squareY;
    angle = Math.PI / 2 - Math.PI / 4 * (squareX / squareY);
  }

  return {
    x: width / 2 + Math.cos(angle) * radialDistance * radius,
    y: height / 2 + Math.sin(angle) * radialDistance * radius,
  };
}

export function normalizeCamera(camera = {}) {
  return {
    ...DEFAULT_CAMERA,
    ...camera,
    yaw: Number.isFinite(camera.yaw) ? camera.yaw : DEFAULT_CAMERA.yaw,
    pitch: clamp(
      CAMERA_LIMITS.minimumPitch,
      CAMERA_LIMITS.maximumPitch,
      Number.isFinite(camera.pitch) ? camera.pitch : DEFAULT_CAMERA.pitch,
    ),
    zoom: clamp(
      CAMERA_LIMITS.minimumZoom,
      CAMERA_LIMITS.maximumZoom,
      Number.isFinite(camera.zoom) ? camera.zoom : DEFAULT_CAMERA.zoom,
    ),
    panX: Number.isFinite(camera.panX) ? camera.panX : DEFAULT_CAMERA.panX,
    panY: Number.isFinite(camera.panY) ? camera.panY : DEFAULT_CAMERA.panY,
    distance: Number.isFinite(camera.distance) && camera.distance > CAMERA_LIMITS.nearPlane
      ? camera.distance
      : DEFAULT_CAMERA.distance,
    flat: Boolean(camera.flat),
  };
}

export function rotatePoint(point, camera = DEFAULT_CAMERA) {
  const yaw = camera.flat ? 0 : camera.yaw;
  const pitch = camera.flat ? 0 : camera.pitch;
  const cosineYaw = Math.cos(yaw);
  const sineYaw = Math.sin(yaw);
  const cosinePitch = Math.cos(pitch);
  const sinePitch = Math.sin(pitch);
  const xAfterYaw = point.x * cosineYaw - point.y * sineYaw;
  const yAfterYaw = point.x * sineYaw + point.y * cosineYaw;
  const z = camera.flat ? 0 : point.z;

  return {
    x: xAfterYaw,
    y: yAfterYaw * cosinePitch - z * sinePitch,
    z: yAfterYaw * sinePitch + z * cosinePitch,
  };
}

function fitScale(viewport, dimensions, camera) {
  const xValues = [-dimensions.width / 2, dimensions.width / 2];
  const yValues = [-dimensions.height / 2, dimensions.height / 2];
  const zValues = camera.flat ? [0] : [0, dimensions.depth];
  const fitted = [];
  for (const x of xValues) {
    for (const y of yValues) {
      for (const z of zValues) {
        const rotated = rotatePoint({ x, y, z }, camera);
        const cameraDepth = camera.distance - rotated.z;
        if (cameraDepth <= CAMERA_LIMITS.nearPlane) continue;
        const perspective = camera.distance / cameraDepth;
        fitted.push({ x: rotated.x * perspective, y: rotated.y * perspective });
      }
    }
  }
  if (!fitted.length) return 1;
  const spanX = Math.max(...fitted.map((point) => point.x)) - Math.min(...fitted.map((point) => point.x));
  const spanY = Math.max(...fitted.map((point) => point.y)) - Math.min(...fitted.map((point) => point.y));
  const horizontalFill = camera.flat ? 0.9 : 0.88;
  const verticalFill = camera.flat ? 0.88 : 0.84;
  return Math.min(
    viewport.width * horizontalFill / Math.max(1, spanX),
    viewport.height * verticalFill / Math.max(1, spanY),
  );
}

export function projectPoint(point, cameraInput, viewport, dimensions) {
  const camera = normalizeCamera(cameraInput);
  const centered = {
    x: point.x - dimensions.width / 2,
    y: point.y - dimensions.height / 2,
    z: Number(point.z ?? 0),
  };
  const rotated = rotatePoint(centered, camera);
  const cameraDepth = camera.distance - rotated.z;
  if (!Number.isFinite(cameraDepth) || cameraDepth <= CAMERA_LIMITS.nearPlane) return null;

  const perspective = camera.distance / cameraDepth;
  const scale = fitScale(viewport, dimensions, camera) * camera.zoom * perspective;
  return {
    x: viewport.width / 2 + camera.panX + rotated.x * scale,
    y: viewport.height / 2 + camera.panY + rotated.y * scale,
    scale,
    depth: rotated.z,
    cameraDepth,
  };
}

export function sortProjected(items, projectionById, idFor = (item) => item.id) {
  return [...items].sort((left, right) => {
    const leftId = idFor(left);
    const rightId = idFor(right);
    const leftDepth = projectionById.get(leftId)?.depth ?? Number.NEGATIVE_INFINITY;
    const rightDepth = projectionById.get(rightId)?.depth ?? Number.NEGATIVE_INFINITY;
    return leftDepth - rightDepth || String(leftId).localeCompare(String(rightId), 'ko');
  });
}

export function hitTestProjected(nodes, projectionById, point, {
  visibleIds,
  minimumRadius = 18,
  radiusScale = 1,
} = {}) {
  const candidates = sortProjected(
    nodes.filter((node) => !visibleIds || visibleIds.has(node.id)),
    projectionById,
  ).reverse();
  for (const node of candidates) {
    const projected = projectionById.get(node.id);
    if (!projected) continue;
    const radius = Math.max(
      minimumRadius,
      node.radius * Math.max(0.1, radiusScale) * Math.sqrt(Math.max(0.2, projected.scale)) * 0.92 + 5,
    );
    if (Math.hypot(point.x - projected.x, point.y - projected.y) <= radius) return node;
  }
  return null;
}

export function zoomCameraAt(cameraInput, anchor, viewport, factor) {
  const camera = normalizeCamera(cameraInput);
  const zoom = clamp(
    CAMERA_LIMITS.minimumZoom,
    CAMERA_LIMITS.maximumZoom,
    camera.zoom * (Number.isFinite(factor) && factor > 0 ? factor : 1),
  );
  const ratio = zoom / camera.zoom;
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;
  return normalizeCamera({
    ...camera,
    zoom,
    panX: anchor.x - centerX - (anchor.x - centerX - camera.panX) * ratio,
    panY: anchor.y - centerY - (anchor.y - centerY - camera.panY) * ratio,
  });
}

export function cameraForWorldPoint(point, cameraInput, viewport, dimensions, targetZoom) {
  const camera = normalizeCamera({
    ...cameraInput,
    zoom: Number.isFinite(targetZoom) ? targetZoom : cameraInput?.zoom,
    panX: 0,
    panY: 0,
  });
  const projected = projectPoint(point, camera, viewport, dimensions);
  if (!projected) return camera;
  return normalizeCamera({
    ...camera,
    panX: viewport.width / 2 - projected.x,
    panY: viewport.height / 2 - projected.y,
  });
}

function adjacencyFor(edges, visibleIds) {
  const adjacency = new Map();
  const allowed = visibleIds ? new Set(visibleIds) : null;
  const ensure = (id) => {
    if (!adjacency.has(id)) adjacency.set(id, new Set());
    return adjacency.get(id);
  };
  for (const edge of edges) {
    if (allowed && (!allowed.has(edge.source) || !allowed.has(edge.target))) continue;
    ensure(edge.source).add(edge.target);
    ensure(edge.target).add(edge.source);
  }
  if (allowed) for (const id of allowed) ensure(id);
  return adjacency;
}

export function neighborhoodWithinDepth(edges, startId, maximumDepth, visibleIds) {
  const allowed = visibleIds ? new Set(visibleIds) : null;
  if (!startId || (allowed && !allowed.has(startId))) return new Set();
  const depthLimit = Math.max(0, Math.floor(Number(maximumDepth) || 0));
  const adjacency = adjacencyFor(edges, allowed);
  const visited = new Set([startId]);
  let frontier = [startId];
  for (let depth = 0; depth < depthLimit && frontier.length; depth += 1) {
    const next = [];
    for (const id of frontier) {
      for (const neighbor of adjacency.get(id) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        next.push(neighbor);
      }
    }
    frontier = next;
  }
  return visited;
}

export function shortestPath(edges, startId, targetId, visibleIds) {
  const allowed = visibleIds ? new Set(visibleIds) : null;
  if (!startId || !targetId || (allowed && (!allowed.has(startId) || !allowed.has(targetId)))) return [];
  if (startId === targetId) return [startId];
  const adjacency = adjacencyFor(edges, allowed);
  const queue = [startId];
  const previous = new Map([[startId, null]]);
  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const neighbors = [...(adjacency.get(current) ?? [])].sort((left, right) => String(left).localeCompare(String(right), 'ko'));
    for (const neighbor of neighbors) {
      if (previous.has(neighbor)) continue;
      previous.set(neighbor, current);
      if (neighbor === targetId) {
        const path = [targetId];
        let cursor = current;
        while (cursor !== null) {
          path.push(cursor);
          cursor = previous.get(cursor) ?? null;
        }
        return path.reverse();
      }
      queue.push(neighbor);
    }
  }
  return [];
}
