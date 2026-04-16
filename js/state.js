const DEFAULT_STATE = {
  pedidos:[
    {id:1,client:'Familia González',desc:'Ventana corrediza 1.2×1.0m, línea 25',ref:'O3NAC-5341',stage:0,date:'2026-04-07',obs:''},
    {id:2,client:'Constructora Norte',desc:'3 puertas balcón 0.9×2.1m',ref:'O3NAC-5338',stage:1,date:'2026-04-05',obs:'Urgente para el lunes'},
    {id:3,client:'Obra Av. Libertad',desc:'Celosía fija 2m ancho',ref:'O3NAC-5335',stage:2,date:'2026-04-03',obs:''},
    {id:4,client:'Srta. Ramírez',desc:'Raja postigón 400x900',ref:'O3NAC-5343',stage:3,date:'2026-04-01',obs:''},
    {id:5,client:'Municipio Centro',desc:'5 ventanas corredizas oficina',ref:'O3NAC-5340',stage:1,date:'2026-04-06',obs:''},
  ],
  inv:{
    perfiles:[
      {id:1,name:'MT-0979 Marco puerta',qty:12,min:4,unit:'barras'},
      {id:2,name:'MT-0963 Parante hoja postigón',qty:10,min:4,unit:'barras'},
      {id:3,name:'MT-0006 Tablilla postigón',qty:8,min:4,unit:'barras'},
      {id:4,name:'MT-0010 Marco ventana corredera',qty:6,min:3,unit:'barras'},
      {id:5,name:'MT-0015 Hoja ventana corredera',qty:6,min:3,unit:'barras'},
      {id:6,name:'MT-0020 Perfil mosquitero',qty:10,min:4,unit:'barras'},
    ],
    vidrios:[
      {id:1,name:'Float 4mm',qty:12,min:5,unit:'m²'},
      {id:2,name:'Float 6mm',qty:4,min:5,unit:'m²'},
      {id:3,name:'DVH 4/6/4',qty:2,min:3,unit:'m²'},
    ],
    herrajes:[
      {id:1,name:'H33 Bisagra',qty:30,min:12,unit:'u'},
      {id:2,name:'MH67 Falleba postigón rebatir',qty:8,min:4,unit:'u'},
      {id:3,name:'PARTEH Felpa',qty:10,min:4,unit:'rollos'},
      {id:4,name:'PARTEC Escuadra',qty:40,min:16,unit:'u'},
      {id:5,name:'Manija par aluminio',qty:9,min:6,unit:'u'},
    ],
    accesorios:[
      {id:1,name:'REM Remache',qty:500,min:200,unit:'u'},
      {id:2,name:'TOR-10 Tornillo parker 10x1½',qty:300,min:100,unit:'u'},
      {id:3,name:'Silicon blanco 300ml',qty:6,min:4,unit:'u'},
      {id:4,name:'Esquinero plástico',qty:50,min:20,unit:'u'},
    ]
  },
  balance:{
    ingresos:[
      {id:1,concepto:'Raja postigón 400x900',cliente:'Srta. Ramírez',monto:130625,fecha:'2026-04-01',ref:'O3NAC-5343',obs:''},
    ],
    egresos:[
      {id:1,concepto:'Perfiles MT-0979 y MT-0963',categoria:'Materiales',monto:45000,fecha:'2026-04-03',proveedor:'AlumCenter',obs:''},
      {id:2,concepto:'Herrajes: bisagras y fallebas',categoria:'Herrajes',monto:28600,fecha:'2026-04-05',proveedor:'',obs:''},
      {id:3,concepto:'Servicio de pintura negro',categoria:'Servicios',monto:15000,fecha:'2026-04-06',proveedor:'Pinturería Díaz',obs:''},
    ]
  },
  orders:[],
  apiKey:'',
  supabaseUrl:'',
  supabaseKey:'',
  nextId:20,
  nextBalId:10
};

let S = {};
let currentTab = 'dashboard';
let currentAnalysis = null;
let balanceMonth = '';
let _sb = null;
let cloudSaveTimer = null;
