/** Coupe un nom complet en prenom et nom (le dernier mot seul si un seul mot) ; une adresse n'est pas un nom. */
export function splitName(name: string, email: string): { firstName: string; lastName: string } {
  const [first, ...rest] = (name === email ? "" : name).trim().split(/\s+/).filter(Boolean);
  return rest.length ? { firstName: first ?? "", lastName: rest.join(" ") } : { firstName: "", lastName: first ?? "" };
}
