export function getServiceDisplayImages(service) {
  return (service?.portfolioImages || []).filter((image) => image?.url && image?.public_id);
}

export function getServiceCoverUrl(service) {
  return getServiceDisplayImages(service)[0]?.url || null;
}

export function getServiceDisplayName(service) {
  return service?.servicename || service?.serviceCategory || 'Service';
}
