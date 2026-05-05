export function whatsappLink(phone: string, countryCode = "91") {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${countryCode}${digits}`;
}
