import { EmpleadoInput } from '../types/actuarial';

// Datos de verificación basados en el ejemplo del usuario
export const EJEMPLO_USUARIO_DATA: EmpleadoInput[] = [
  {
    Cedula: "1712345678",
    Nombre: "Juan Perez",
    Genero: "M",
    Edad: 45,
    Antiguedad: 15,
    Sueldo_Actual: 1200.00,
    Cargo: "Especialista Operativo"
  },
  {
    Cedula: "0912345678",
    Nombre: "Maria Rodriguez",
    Genero: "F",
    Edad: 30,
    Antiguedad: 5,
    Sueldo_Actual: 850.00,
    Cargo: "Analista de Finanzas"
  },
  {
    Cedula: "0112345678",
    Nombre: "Carlos Cueva",
    Genero: "M",
    Edad: 62,
    Antiguedad: 24,
    Sueldo_Actual: 2100.00,
    Cargo: "Supervisor de Producción"
  }
];

// Censo representativo extraído del Estudio Actuarial oficial de Cajamarca Protective Services
export const CENSO_CAJAMARCA_MUESTRA: EmpleadoInput[] = [
  { Cedula: "0923456781", Nombre: "Morales Balseca Jenniffer Mariuxi", Genero: "F", Edad: 28, Antiguedad: 1, Sueldo_Actual: 534.00, Cargo: "Oficial de Seguridad" },
  { Cedula: "0914567892", Nombre: "Moreno Delgado Stephany Yulliana", Genero: "F", Edad: 31, Antiguedad: 1, Sueldo_Actual: 645.00, Cargo: "Custodia de Valores" },
  { Cedula: "0935678903", Nombre: "Pazmiño Garibaldi Melissa Nathalie", Genero: "F", Edad: 35, Antiguedad: 2, Sueldo_Actual: 720.00, Cargo: "Coordinadora de Turno" },
  { Cedula: "0946789014", Nombre: "Sanchez Zurita Mariuxi Celeste", Genero: "F", Edad: 26, Antiguedad: 1, Sueldo_Actual: 467.00, Cargo: "Operadora de Monitoreo" },
  { Cedula: "0957890125", Nombre: "Duque Yamile Maribel", Genero: "F", Edad: 29, Antiguedad: 1, Sueldo_Actual: 480.00, Cargo: "Seguridad Física" },
  { Cedula: "0968901236", Nombre: "Ponce Reyes Shirley Janeth", Genero: "F", Edad: 33, Antiguedad: 2, Sueldo_Actual: 510.00, Cargo: "Recepcionista y Control" },
  { Cedula: "0979012347", Nombre: "Sacon Cardenas Nexar Alexander", Genero: "M", Edad: 34, Antiguedad: 3, Sueldo_Actual: 464.00, Cargo: "Vigilante de Seguridad" },
  { Cedula: "0980123458", Nombre: "Morocho Martinez Jonathan Daniel", Genero: "M", Edad: 36, Antiguedad: 3, Sueldo_Actual: 490.00, Cargo: "Patrullero Móvil" },
  { Cedula: "0991234569", Nombre: "Flores Laines Bryan Alexander", Genero: "M", Edad: 27, Antiguedad: 2, Sueldo_Actual: 464.00, Cargo: "Guardia Motorizado" },
  { Cedula: "0912345680", Nombre: "Celorio Loor Anthony Jair", Genero: "M", Edad: 30, Antiguedad: 2, Sueldo_Actual: 475.00, Cargo: "Custodio Bancario" },
  { Cedula: "0923456791", Nombre: "Acosta monte Augusto Wellington", Genero: "M", Edad: 42, Antiguedad: 4, Sueldo_Actual: 560.00, Cargo: "Jefe de Grupo" },
  { Cedula: "0934567802", Nombre: "Candelario Alvarado Jordan Renny", Genero: "M", Edad: 25, Antiguedad: 1, Sueldo_Actual: 460.00, Cargo: "Vigilante" },
  { Cedula: "0945678913", Nombre: "De la Cruz Guale Carlos Mario", Genero: "M", Edad: 48, Antiguedad: 6, Sueldo_Actual: 580.00, Cargo: "Supervisor de Zona" },
  { Cedula: "0956789024", Nombre: "Oyarvide Bustos Oscar Abrahan", Genero: "M", Edad: 38, Antiguedad: 4, Sueldo_Actual: 520.00, Cargo: "Operador de Consola" },
  { Cedula: "0967890135", Nombre: "Solorzano Carrasco Pedro Humberto", Genero: "M", Edad: 52, Antiguedad: 8, Sueldo_Actual: 620.00, Cargo: "Oficial Armado" },
  { Cedula: "0978901246", Nombre: "Abad Gomez Rafael Alberto", Genero: "M", Edad: 40, Antiguedad: 5, Sueldo_Actual: 540.00, Cargo: "Custodia Especializada" },
  { Cedula: "0989012357", Nombre: "Hidalgo Vasquez Brayan Isaul", Genero: "M", Edad: 29, Antiguedad: 2, Sueldo_Actual: 470.00, Cargo: "Seguridad Industrial" },
  { Cedula: "0990123468", Nombre: "Vera Cordova Edwin Efrain", Genero: "M", Edad: 44, Antiguedad: 7, Sueldo_Actual: 600.00, Cargo: "Jefe de Puesto" },
  { Cedula: "0901234579", Nombre: "Salazar Rodriguez Carlos Eduardo", Genero: "M", Edad: 46, Antiguedad: 8, Sueldo_Actual: 630.00, Cargo: "Inspector de Seguridad" },
  { Cedula: "0912345690", Nombre: "Cedeño Zambrano Luis Mario", Genero: "M", Edad: 50, Antiguedad: 10, Sueldo_Actual: 750.00, Cargo: "Subgerente de Operaciones" },
  { Cedula: "0923456701", Nombre: "Franco Salazar Jeffrey Anderson", Genero: "M", Edad: 32, Antiguedad: 3, Sueldo_Actual: 485.00, Cargo: "Oficial Canino K9" },
  { Cedula: "0934567812", Nombre: "Romero Zambrano Marco Antonio", Genero: "M", Edad: 55, Antiguedad: 15, Sueldo_Actual: 820.00, Cargo: "Coordinador de Logística" },
  { Cedula: "0945678923", Nombre: "Borja Aguilar Jonathan Alexander", Genero: "M", Edad: 31, Antiguedad: 2, Sueldo_Actual: 464.00, Cargo: "Vigilante" },
  { Cedula: "0956789034", Nombre: "Trujillo Zuña Richard Anibal", Genero: "M", Edad: 41, Antiguedad: 5, Sueldo_Actual: 530.00, Cargo: "Operador CCTV" },
  { Cedula: "0967890145", Nombre: "Mera Clavijo Alejandro Xavier", Genero: "M", Edad: 47, Antiguedad: 9, Sueldo_Actual: 850.00, Cargo: "Jefe de Turno Nocturno" },
  { Cedula: "0978901256", Nombre: "Cabrera Macias Yeremy Eduardo", Genero: "M", Edad: 33, Antiguedad: 3, Sueldo_Actual: 495.00, Cargo: "Seguridad Portuaria" },
  { Cedula: "0989012367", Nombre: "Mendoza Moreta Enrique Jacinto", Genero: "M", Edad: 58, Antiguedad: 18, Sueldo_Actual: 950.00, Cargo: "Supervisor Principal" },
  { Cedula: "0990123478", Nombre: "Ron Mata Valentina Maria", Genero: "F", Edad: 43, Antiguedad: 8, Sueldo_Actual: 980.00, Cargo: "Directora Administrativa" },
  { Cedula: "0901234589", Nombre: "Topic Feraud Jan Tomislav", Genero: "M", Edad: 46, Antiguedad: 10, Sueldo_Actual: 4500.00, Cargo: "Director Ejecutivo de Estrategia" },
  { Cedula: "0912345601", Nombre: "Jurado Feraud Antonio Tomas", Genero: "M", Edad: 54, Antiguedad: 11, Sueldo_Actual: 5200.00, Cargo: "Presidente del Directorio" }
];
