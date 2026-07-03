export const DEFAULT_SERVICE_IMAGE_URL = '/CommuN-logo.png';

export function isDefaultServiceImage(image) {
  if (!image?.url) return true;
  return !image.public_id && image.url === DEFAULT_SERVICE_IMAGE_URL;
}

export function getServiceDisplayImages(service) {
  return (service?.portfolioImages || []).filter((image) => !isDefaultServiceImage(image));
}

export function getServiceCoverUrl(service) {
  return getServiceDisplayImages(service)[0]?.url || null;
}

export function getServiceDisplayName(service) {
  return service?.servicename || service?.serviceCategory || 'Service';
}

export function hasRealServiceImages(service) {
  return getServiceDisplayImages(service).length > 0;
}
