
/**
 * Zet een kleurnaam om naar een hex-code.
 * @param {string} kleur - De naam van de kleur (bijv. 'Rood').
 * @returns {string} De hex-code van de kleur, of een standaardkleur als niet gevonden.
 */
export default function getColorHex(kleur) {
  const kleuren = {
    Rood: 'bg-red-500',
    Blauw: 'bg-blue-500',
    Geel: 'bg-yellow-400',
    Groen: 'bg-green-500',
    Oranje: 'bg-orange-400',
    Roze: 'bg-pink-400',
    Paars: 'bg-purple-500',
    Turquoise: 'bg-cyan-400',
    Zwart: 'bg-gray-900',
    Wit: 'bg-gray-100 border border-gray-300',
    Grijs: 'bg-gray-400',
    Bruin: 'bg-yellow-900',
    Lichtblauw: 'bg-sky-300',
    Lichtgroen: 'bg-lime-300',
    Zalm: 'bg-orange-300',
    Goud: 'bg-yellow-300',
    Zilver: 'bg-gray-300',
    Beige: 'bg-yellow-100',
  };
  return kleuren[kleur] || 'bg-gray-400'; // default: Tailwind gray-300
}
