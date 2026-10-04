import { EmpleadoInput } from '../types/actuarial';

// Censo Demostrativo Oficial para Valuación Actuarial NIC 19 en Ecuador
// Refleja una distribución demográfica representativa para empresas ecuatorianas
// con colaboradores elegibles para Jubilación Patronal (Art. 216) y Desahucio (Art. 185)
export const CENSO_DEMOSTRATIVO_ACTUARIAL: EmpleadoInput[] = [
  {
    Cedula: "1710928374",
    Nombre: "Dr. Marcelo Echeverría Viteri",
    Genero: "M",
    Edad: 62,
    Antiguedad: 26,
    Sueldo_Actual: 2850.00,
    Cargo: "Director de Operaciones & Logística"
  },
  {
    Cedula: "0921837465",
    Nombre: "Ing. Patricia Campoverde Silva",
    Genero: "F",
    Edad: 58,
    Antiguedad: 22,
    Sueldo_Actual: 2400.00,
    Cargo: "Jefa de Aseguramiento de Calidad"
  },
  {
    Cedula: "0104829103",
    Nombre: "Lcdo. Fernando Alarcón Cárdenas",
    Genero: "M",
    Edad: 54,
    Antiguedad: 20,
    Sueldo_Actual: 1950.00,
    Cargo: "Supervisor General de Planta"
  },
  {
    Cedula: "1720394851",
    Nombre: "Econ. Gabriela Serrano Andrade",
    Genero: "F",
    Edad: 47,
    Antiguedad: 16,
    Sueldo_Actual: 1750.00,
    Cargo: "Especialista de Control de Gestión"
  },
  {
    Cedula: "0918273645",
    Nombre: "Ing. Carlos Mendoza Villavicencio",
    Genero: "M",
    Edad: 45,
    Antiguedad: 14,
    Sueldo_Actual: 1600.00,
    Cargo: "Coordinador de Mantenimiento Industrial"
  },
  {
    Cedula: "1803928174",
    Nombre: "Mónica Viviana Palacios",
    Genero: "F",
    Edad: 42,
    Antiguedad: 12,
    Sueldo_Actual: 1350.00,
    Cargo: "Analista Senior de Nómina y RRHH"
  },
  {
    Cedula: "1104827192",
    Nombre: "Manuel Benalcázar Jaramillo",
    Genero: "M",
    Edad: 49,
    Antiguedad: 18,
    Sueldo_Actual: 1450.00,
    Cargo: "Operador Técnico de Maquinaria Pesada"
  },
  {
    Cedula: "1719283746",
    Nombre: "Lcda. Andrea Estefanía Morales",
    Genero: "F",
    Edad: 39,
    Antiguedad: 9,
    Sueldo_Actual: 1200.00,
    Cargo: "Contadora General Auxiliar"
  },
  {
    Cedula: "0802938475",
    Nombre: "Jorge Washington Caicedo",
    Genero: "M",
    Edad: 36,
    Antiguedad: 8,
    Sueldo_Actual: 980.00,
    Cargo: "Técnico Electricista Industrial"
  },
  {
    Cedula: "0603847291",
    Nombre: "Rosa Elena Guamán Pilamunga",
    Genero: "F",
    Edad: 34,
    Antiguedad: 6,
    Sueldo_Actual: 890.00,
    Cargo: "Inspectora de Seguridad Ocupacional"
  },
  {
    Cedula: "1728394012",
    Nombre: "Diego Armando Quishpe",
    Genero: "M",
    Edad: 31,
    Antiguedad: 5,
    Sueldo_Actual: 780.00,
    Cargo: "Asistente de Bodega y Despacho"
  },
  {
    Cedula: "0938472910",
    Nombre: "Karla Daniela Zambrano",
    Genero: "F",
    Edad: 29,
    Antiguedad: 4,
    Sueldo_Actual: 720.00,
    Cargo: "Auxiliar Contable y Facturación"
  },
  {
    Cedula: "1304928173",
    Nombre: "Byron Javier Moreira Loor",
    Genero: "M",
    Edad: 27,
    Antiguedad: 3,
    Sueldo_Actual: 650.00,
    Cargo: "Operario de Embalaje y Línea"
  },
  {
    Cedula: "1750293847",
    Nombre: "Sofía Alejandra Herrera Peña",
    Genero: "F",
    Edad: 26,
    Antiguedad: 2,
    Sueldo_Actual: 580.00,
    Cargo: "Recepcionista y Atención al Cliente"
  },
  {
    Cedula: "0109283746",
    Nombre: "Mateo Sebastián Cordero",
    Genero: "M",
    Edad: 24,
    Antiguedad: 1,
    Sueldo_Actual: 460.00,
    Cargo: "Auxiliar de Servicios Generales"
  }
];

export const EJEMPLO_USUARIO_DATA: EmpleadoInput[] = CENSO_DEMOSTRATIVO_ACTUARIAL;
