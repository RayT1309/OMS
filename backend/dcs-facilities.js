// DCS Management Areas, sourced from the official "Find a Centre" directory.
// Pollsmoor and Goodwood are seeded separately in seed.js (they carry real
// offender data); everything here is additional coverage so a user can pick
// their own management area at login even if it currently has no offenders.

const DCS_MANAGEMENT_AREAS = [
  // Gauteng
  { name: 'Johannesburg Management Area', region: 'Gauteng' },
  { name: 'Baviaanspoort Management Area', region: 'Gauteng' },
  { name: 'Krugersdorp Management Area', region: 'Gauteng' },
  { name: 'Leeuwkop Management Area', region: 'Gauteng' },
  { name: 'Modderbee Management Area', region: 'Gauteng' },
  { name: 'Boksburg Management Area', region: 'Gauteng' },
  { name: 'Pretoria Management Area', region: 'Gauteng' },
  { name: 'Zonderwater Management Area', region: 'Gauteng' },

  // Eastern Cape
  { name: 'East London Management Area', region: 'Eastern Cape' },
  { name: 'Kirkwood Management Area', region: 'Eastern Cape' },
  { name: 'St. Albans Management Area', region: 'Eastern Cape' },
  { name: 'Mthatha Management Area', region: 'Eastern Cape' },
  { name: 'Amathole Management Area', region: 'Eastern Cape' },
  { name: 'Sada Management Area', region: 'Eastern Cape' },

  // KwaZulu-Natal
  { name: 'Waterval Management Area', region: 'KwaZulu-Natal' },
  { name: 'Durban Management Area', region: 'KwaZulu-Natal' },
  { name: 'Ncome Management Area', region: 'KwaZulu-Natal' },
  { name: 'Kokstad Management Area', region: 'KwaZulu-Natal' },
  { name: 'Pietermaritzburg Management Area', region: 'KwaZulu-Natal' },
  { name: 'Glencoe Management Area', region: 'KwaZulu-Natal' },

  // Western Cape (Pollsmoor + Goodwood seeded separately)
  { name: 'Allandale Management Area', region: 'Western Cape' },
  { name: 'Malmesbury Management Area', region: 'Western Cape' },
  { name: 'Voorberg Management Area', region: 'Western Cape' },
  { name: 'Brandvlei Management Area', region: 'Western Cape' },
  { name: 'Helderstroom Management Area', region: 'Western Cape' },
  { name: 'George Management Area', region: 'Western Cape' },
  { name: 'Drakenstein Management Area', region: 'Western Cape' },
  { name: 'Worcester Management Area', region: 'Western Cape' },

  // Free State / Northern Cape
  { name: 'Grootvlei Management Area', region: 'Free State / Northern Cape' },
  { name: 'Upington Management Area', region: 'Free State / Northern Cape' },
  { name: 'Goedemoed Management Area', region: 'Free State / Northern Cape' },
  { name: 'Groenpunt Management Area', region: 'Free State / Northern Cape' },
  { name: 'Kimberley Management Area', region: 'Free State / Northern Cape' },
  { name: 'Kroonstad Management Area', region: 'Free State / Northern Cape' },
  { name: 'Colesberg Management Area', region: 'Free State / Northern Cape' },

  // Limpopo, Mpumalanga & North West
  { name: 'Barberton Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Polokwane Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Bethal Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Klerksdorp Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Rustenburg Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Witbank Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Thohoyandou Management Area', region: 'Limpopo / Mpumalanga / North West' },
  { name: 'Rooigrond Management Area', region: 'Limpopo / Mpumalanga / North West' }
];

module.exports = { DCS_MANAGEMENT_AREAS };
