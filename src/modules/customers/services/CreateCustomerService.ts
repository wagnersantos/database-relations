import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(private customersRepository: ICustomersRepository) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const existEmail = this.customersRepository.findByEmail(email);

    if (existEmail) {
      throw new AppError('Email already exists.');
    }

    const customer = this.customersRepository.create({ email, name });

    return customer;
  }
}

export default CreateCustomerService;
