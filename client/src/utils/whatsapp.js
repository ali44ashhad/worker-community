export const cleanPhoneForWhatsApp = (phone) => String(phone || '').replace(/\D/g, '');

export const buildWhatsAppUrl = (phone, message) => {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  if (!cleanPhone) return null;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

export const buildEventInterestMessage = ({ eventTitle, authorName, interestedUserName, communityName }) => {
  const communityPart = communityName ? ` in @${communityName}` : '';
  return `Hi ${authorName}, I'm ${interestedUserName}. I'm interested in your event "${eventTitle}"${communityPart} on Commun. I'd love to join — could you share more details?`;
};
