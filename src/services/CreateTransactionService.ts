import {
  getRepository,
  getCustomRepository,
  TransactionRepository,
} from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
  checkBalance?: boolean;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
    checkBalance = true,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (checkBalance && type === 'outcome' && value > balance.total) {
      throw new AppError("You don't have enough money.");
    }

    let findCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!findCategory) {
      findCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(findCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: findCategory.id,
    });

    await transactionsRepository.save(transaction);

    return Object.assign(transaction, {
      category,
    });
  }
}

export default CreateTransactionService;
