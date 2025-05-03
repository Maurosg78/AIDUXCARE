export enum UserRole {
  ADMIN = 'ADMIN',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  PATIENT = 'PATIENT'
}

export const TEST_USERS = [
  {
    email: 'laura@clinicatest.com',
    password: 'Test1234!',
    name: 'Laura Martínez',
    role: UserRole.PHYSIOTHERAPIST
  },
  {
    email: 'jose@valenciamed.com',
    password: 'Test1234!',
    name: 'José García',
    role: UserRole.PHYSIOTHERAPIST
  },
  {
    email: 'ines@movsalud.es',
    password: 'Test1234!',
    name: 'Inés Rodríguez',
    role: UserRole.PHYSIOTHERAPIST
  }
];

export const TEST_USER = TEST_USERS[0]; // Usuario por defecto para pruebas 