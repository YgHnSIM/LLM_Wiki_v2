export const DEFAULT_CAMERA = Object.freeze({
  yaw: -0.52,
  pitch: 0.78,
  zoom: 0.92,
  panX: 0,
  panY: 46,
  distance: 2200,
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

function fitScale(viewport, dimensions, flat) {
  if (flat) {
    return Math.min(
      viewport.width / (dimensions.width * 1.08),
      viewport.height / (dimensions.height * 1.08),
    );
  }
  const groundDiagonal = Math.hypot(dimensions.width, dimensions.height);
  return Math.min(
    viewport.width / (groundDiagonal * 1.08),
    viewport.height / ((dimensions.height + dimensions.depth) * 1.04),
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
  const scale = fitScale(viewport, dimensions, camera.flat) * camera.zoom * perspective;
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
} = {}) {
  const candidates = sortProjected(
    nodes.filter((node) => !visibleIds || visibleIds.has(node.id)),
    projectionById,
  ).reverse();
  for (const node of candidates) {
    const projected = projectionById.get(node.id);
    if (!projected) continue;
    const radius = Math.max(minimumRadius, node.radius * projected.scale + 5);
    if (Math.hypot(point.x - projected.x, point.y - projected.y) <= radius) return node;
  }
  return null;
}
