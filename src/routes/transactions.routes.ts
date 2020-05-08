import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import fs from 'fs';
import csvParse from 'csv-parse';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });

  const balance = await transactionsRepository.getBalance();

  return response.status(200).json({
    transactions,
    balance,
  });
});

transactionsRouter.post('/', async (request, response) => {
  const { category, title, type, value } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    category,
    title,
    type,
    value,
  });

  delete transaction.category_id;

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ transaction_id: id });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;

    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute({
      filePath: file.path,
      mimeType: file.mimetype,
    });

    return response.status(201).json(transactions);
  },
);

export default transactionsRouter;
