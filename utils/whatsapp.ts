export function whatsappLink(phone: string, countryCode = "92") {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${countryCode}${digits}`;
}
