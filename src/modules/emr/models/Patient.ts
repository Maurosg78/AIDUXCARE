import type { Patient as CorePatient  } from '@/core/types';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  sex?: 'M' | 'F' | 'O';
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  age?: number;
  rut?: string;
  createdAt: string;
  updatedAt: string;
  name: string;
}

export interface PatientCreate {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  sex?: 'M' | 'F' | 'O';
}

export class PatientModel implements Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  sex?: 'M' | 'F' | 'O';
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  age?: number;
  rut?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<Patient> & { id: string; firstName: string; lastName: string; createdAt: string; updatedAt: string }) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.birthDate = data.birthDate;
    this.gender = data.gender;
    this.sex = data.sex;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.postalCode = data.postalCode;
    this.country = data.country;
    this.age = data.age;
    this.rut = data.rut;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  get name(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  toCorePatient(): CorePatient {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      name: this.name,
      email: this.email,
      phone: this.phone,
      birthDate: this.birthDate,
      gender: this.gender,
      sex: this.sex,
      address: this.address,
      city: this.city,
      state: this.state,
      postalCode: this.postalCode,
      country: this.country,
      age: this.age,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromCorePatient(patient: CorePatient): PatientModel {
    return new PatientModel({
      id: patient.id,
      firstName: patient.firstName || patient.name?.split(' ')[0] || '',
      lastName: patient.lastName || patient.name?.split(' ').slice(1).join(' ') || '',
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      sex: patient.sex,
      address: patient.address,
      city: patient.city,
      state: patient.state,
      postalCode: patient.postalCode,
      country: patient.country,
      age: patient.age,
      createdAt: patient.createdAt || new Date().toISOString(),
      updatedAt: patient.updatedAt || new Date().toISOString()
    });
  }
}
