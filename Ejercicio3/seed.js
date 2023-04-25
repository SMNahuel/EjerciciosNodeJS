const proyectos = [
    {
      titulo: "Sistema de gestión de inventarios",
      descripcion: "Sistema para llevar el control de inventarios de una empresa",
      lenguaje: "JAVASCRIPT",
      activo: true,
    },
    {
      titulo: "Aplicación móvil para la gestión de tareas",
      descripcion: "Aplicación para llevar el control de tareas diarias",
      lenguaje: "JAVA",
      activo: true,
    },
    {
      titulo: "Página web de comercio electrónico",
      descripcion: "Página web para la venta de productos en línea",
      lenguaje: "PHP",
      activo: false,
    },
  ];
  
  const programadores = [
    {
      nombre: "Juan Pérez",
      email: "juan.perez@gmail.com",
      seniority: 5,
    },
    {
      nombre: "María García",
      email: "maria.garcia@gmail.com",
      seniority: 8,
    },
    {
      nombre: "Pedro Fernández",
      email: "pedro.fernandez@gmail.com",
      seniority: 3,
    },
  ];
  
  // Se crean los datos de proyectos y programadores vacíos
  // porque aún no se han asociado entre sí
  const datosProyectos = [];
  const datosProgramadores = [];
  
  // Se crean los datos de ejemplo de proyectos y programadores
  proyectos.forEach((proyecto) => {
    datosProyectos.push({
      titulo: proyecto.titulo,
      descripcion: proyecto.descripcion,
      lenguaje: proyecto.lenguaje,
      activo: proyecto.activo,
    });
  });
  
  programadores.forEach((programador) => {
    datosProgramadores.push({
      nombre: programador.nombre,
      email: programador.email,
      seniority: programador.seniority,
    });
  });
  
  
  // Exportar los datos de ejemplo
  module.exports = { proyectos: datosProyectos, programadores: datosProgramadores };