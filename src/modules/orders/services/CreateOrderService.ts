import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('This customer does not exists!');
    }

    const findProducts = await this.productsRepository.findAllById(products);

    if (!findProducts.length) {
      throw new AppError('This products does not exists!');
    }

    products.map(product =>
      findProducts.forEach((productFilter, _) => {
        if (
          product.id === productFilter.id &&
          product.quantity > productFilter.quantity
        ) {
          throw new AppError('Product insuficient quantity');
        }
      }),
    );

    await this.productsRepository.updateQuantity(products);

    const finalResulProd = findProducts.map(product => {
      const prod = products.filter(
        (productFilter, _) => productFilter.id === product.id,
      );

      return {
        product_id: product.id,
        price: product.price,
        quantity: prod[0].quantity,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: finalResulProd,
    });

    delete order.customer_id;
    const newOrder = {
      customer,
      ...order,
    };

    return newOrder;
  }
}

export default CreateOrderService;
