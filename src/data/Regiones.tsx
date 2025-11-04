// Regiones y comunas de Chile (norte → sur)

export type Comuna = {
  slug: string;
  nombre: string;
}

export type Region = {
  slug: string;
  nombre: string;
  comunas: Comuna[];
}

export const REGIONES: Region[] = [
  {
    slug: 'arica-y-parinacota',
    nombre: 'Arica y Parinacota',
    comunas: [
      { slug: 'arica', nombre: 'Arica' },
      { slug: 'camarones', nombre: 'Camarones' },
      { slug: 'putre', nombre: 'Putre' },
      { slug: 'general-lagos', nombre: 'General Lagos' }
    ]
  },

  {
    slug: 'tarapaca',
    nombre: 'Tarapacá',
    comunas: [
      { slug: 'iquique', nombre: 'Iquique' },
      { slug: 'alto-hospicio', nombre: 'Alto Hospicio' },
      { slug: 'pozo-almonte', nombre: 'Pozo Almonte' },
      { slug: 'huara', nombre: 'Huara' },
      { slug: 'pica', nombre: 'Pica' },
      { slug: 'camina', nombre: 'Camiña' },
      { slug: 'colchane', nombre: 'Colchane' }
    ]
  },

  {
    slug: 'antofagasta',
    nombre: 'Antofagasta',
    comunas: [
      { slug: 'antofagasta', nombre: 'Antofagasta' },
      { slug: 'mejillones', nombre: 'Mejillones' },
      { slug: 'sierra-gorda', nombre: 'Sierra Gorda' },
      { slug: 'taltal', nombre: 'Taltal' },
      { slug: 'calama', nombre: 'Calama' },
      { slug: 'ollague', nombre: 'Ollagüe' },
      { slug: 'san-pedro-de-atacama', nombre: 'San Pedro de Atacama' },
      { slug: 'tocopilla', nombre: 'Tocopilla' },
      { slug: 'maria-elena', nombre: 'María Elena' }
    ]
  },

  {
    slug: 'atacama',
    nombre: 'Atacama',
    comunas: [
      { slug: 'copiapo', nombre: 'Copiapó' },
      { slug: 'caldera', nombre: 'Caldera' },
      { slug: 'tierra-amarilla', nombre: 'Tierra Amarilla' },
      { slug: 'chanaral', nombre: 'Chañaral' },
      { slug: 'diego-de-almagro', nombre: 'Diego de Almagro' }
    ]
  },

  {
    slug: 'coquimbo',
    nombre: 'Coquimbo',
    comunas: [
      { slug: 'la-serena', nombre: 'La Serena' },
      { slug: 'coquimbo-ciudad', nombre: 'Coquimbo' },
      { slug: 'ovalle', nombre: 'Ovalle' },
      { slug: 'illapel', nombre: 'Illapel' },
      { slug: 'la-higuera', nombre: 'La Higuera' },
      { slug: 'canela', nombre: 'Canela' },
      { slug: 'los-vilos', nombre: 'Los Vilos' },
      { slug: 'salamanca', nombre: 'Salamanca' },
      { slug: 'andacollo', nombre: 'Andacollo' },
      { slug: 'vicuña', nombre: 'Vicuña' },
      { slug: 'paihuano', nombre: 'Paihuano' },
      { slug: 'monte-patria', nombre: 'Monte Patria' },
      { slug: 'punitaqui', nombre: 'Punitaqui' },
      { slug: 'combarbala', nombre: 'Combarbalá' },
      { slug: 'rio-hurtado', nombre: 'Río Hurtado' }
    ]
  },

  {
    slug: 'valparaiso',
    nombre: 'Valparaíso',
    comunas: [
      { slug: 'valparaiso-ciudad', nombre: 'Valparaíso' },
      { slug: 'vina-del-mar', nombre: 'Viña del Mar' },
      { slug: 'concon', nombre: 'Concón' },
      { slug: 'quilpue', nombre: 'Quilpué' },
      { slug: 'villa-alemana', nombre: 'Villa Alemana' },
      { slug: 'quillota', nombre: 'Quillota' },
      { slug: 'calle-larga', nombre: 'Calle Larga' },
      { slug: 'los-andes', nombre: 'Los Andes' },
      { slug: 'san-antonio', nombre: 'San Antonio' },
      { slug: 'cartagena', nombre: 'Cartagena' },
      { slug: 'isla-de-pascua', nombre: 'Isla de Pascua' }
    ]
  },

  {
    slug: 'metropolitana',
    nombre: 'Región Metropolitana de Santiago',
    comunas: [
      { slug: 'santiago', nombre: 'Santiago' },
      { slug: 'providencia', nombre: 'Providencia' },
      { slug: 'las-condes', nombre: 'Las Condes' },
      { slug: 'vitacura', nombre: 'Vitacura' },
      { slug: 'la-florida', nombre: 'La Florida' },
      { slug: 'maipu', nombre: 'Maipú' },
      { slug: 'puente-alto', nombre: 'Puente Alto' },
      { slug: 'nunoa', nombre: 'Ñuñoa' },
      { slug: 'la-reina', nombre: 'La Reina' },
      { slug: 'penalolen', nombre: 'Peñalolén' },
      { slug: 'quilicura', nombre: 'Quilicura' },
      { slug: 'conchali', nombre: 'Conchalí' },
      { slug: 'recoleta', nombre: 'Recoleta' },
      { slug: 'independencia', nombre: 'Independencia' },
      { slug: 'huechuraba', nombre: 'Huechuraba' },
      { slug: 'lo-prado', nombre: 'Lo Prado' },
      { slug: 'cerro-navia', nombre: 'Cerro Navia' },
      { slug: 'pudahuel', nombre: 'Pudahuel' },
      { slug: 'estacion-central', nombre: 'Estación Central' },
      { slug: 'san-joaquin', nombre: 'San Joaquín' },
      { slug: 'san-miguel', nombre: 'San Miguel' },
      { slug: 'la-cisterna', nombre: 'La Cisterna' },
      { slug: 'el-bosque', nombre: 'El Bosque' }
    ]
  },

  {
    slug: 'ohiggins',
    nombre: 'Libertador General Bernardo O’Higgins',
    comunas: [
      { slug: 'rancagua', nombre: 'Rancagua' },
      { slug: 'machali', nombre: 'Machalí' },
      { slug: 'graneros', nombre: 'Graneros' },
      { slug: 'san-fernando', nombre: 'San Fernando' },
      { slug: 'chimbarongo', nombre: 'Chimbarongo' },
      { slug: 'santa-cruz', nombre: 'Santa Cruz' },
      { slug: 'pichidegua', nombre: 'Pichidegua' },
      { slug: 'asociada', nombre: 'Nancagua' }
    ]
  },

  {
    slug: 'maule',
    nombre: 'Maule',
    comunas: [
      { slug: 'talca', nombre: 'Talca' },
      { slug: 'curauma', nombre: 'Curepto' },
      { slug: 'curico', nombre: 'Curicó' },
      { slug: 'linares', nombre: 'Linares' },
      { slug: 'maule-comuna', nombre: 'Maule' },
      { slug: 'constitucion', nombre: 'Constitución' },
      { slug: 'san-clemente', nombre: 'San Clemente' },
      { slug: 'pelarco', nombre: 'Pelarco' }
    ]
  },

  {
    slug: 'nuble',
    nombre: 'Ñuble',
    comunas: [
      { slug: 'chillan', nombre: 'Chillán' },
      { slug: 'chillan-viejo', nombre: 'Chillán Viejo' },
      { slug: 'bulnes', nombre: 'Bulnes' },
      { slug: 'yungay', nombre: 'Yungay' },
      { slug: 'san-carlos', nombre: 'San Carlos' }
    ]
  },

  {
    slug: 'biobio',
    nombre: 'Biobío',
    comunas: [
      { slug: 'concepcion', nombre: 'Concepción' },
      { slug: 'talcahuano', nombre: 'Talcahuano' },
      { slug: 'hualpen', nombre: 'Hualpén' },
      { slug: 'coronel', nombre: 'Coronel' },
      { slug: 'lota', nombre: 'Lota' },
      { slug: 'chiguayante', nombre: 'Chiguayante' },
      { slug: 'los-angeles', nombre: 'Los Ángeles' },
      { slug: 'mulchen', nombre: 'Mulchén' }
    ]
  },

  {
    slug: 'la-araucania',
    nombre: 'La Araucanía',
    comunas: [
      { slug: 'temuco', nombre: 'Temuco' },
      { slug: 'villarrica', nombre: 'Villarrica' },
      { slug: 'pucon', nombre: 'Pucón' },
      { slug: 'angol', nombre: 'Angol' },
      { slug: 'lautaro', nombre: 'Lautaro' }
    ]
  },

  {
    slug: 'los-rios',
    nombre: 'Los Ríos',
    comunas: [
      { slug: 'valdivia', nombre: 'Valdivia' },
      { slug: 'la-union', nombre: 'La Unión' },
      { slug: 'rio-bueno', nombre: 'Río Bueno' },
      { slug: 'lanco', nombre: 'Lanco' }
    ]
  },

  {
    slug: 'los-lagos',
    nombre: 'Los Lagos',
    comunas: [
      { slug: 'puerto-montt', nombre: 'Puerto Montt' },
      { slug: 'puerto-varas', nombre: 'Puerto Varas' },
      { slug: 'osorno', nombre: 'Osorno' },
      { slug: 'castro', nombre: 'Castro' },
      { slug: 'chonchi', nombre: 'Chonchi' },
      { slug: 'ancud', nombre: 'Ancud' }
    ]
  },

  {
    slug: 'aysen',
    nombre: 'Aysén del General Carlos Ibáñez del Campo',
    comunas: [
      { slug: 'coyhaique', nombre: 'Coyhaique' },
      { slug: 'aysen', nombre: 'Aysén' },
      { slug: 'cioh', nombre: 'Chile Chico' },
      { slug: 'cisnes', nombre: 'Cisnes' }
    ]
  },

  {
    slug: 'magallanes',
    nombre: 'Magallanes y de la Antártica Chilena',
    comunas: [
      { slug: 'punta-arenas', nombre: 'Punta Arenas' },
      { slug: 'porvenir', nombre: 'Porvenir' },
      { slug: 'rio-seco', nombre: 'Río Verde' },
      { slug: 'cabo-de-hornos', nombre: 'Cabo de Hornos (Navarino)' }
    ]
  }
]

export default REGIONES
