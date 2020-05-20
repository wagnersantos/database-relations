import { inject, injectable } from 'tsyringe';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import AppError from '@shared/errors/AppError';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    const orders = await this.ordersRepository.findById(id);

    if (!orders) {
      throw new AppError('not exists order');
    }
    const customer = await this.customersRepository.findById(
      orders.customer_id,
    );

    delete orders.customer_id;
    const newOrders = {
      customer,
      ...orders,
    };

    return newOrders;
  }
}
export default FindOrderService;
