import { getRepository, In } from 'typeorm';
import csvParse from 'csv-parse';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface RequestDTO {
  filePath: string;
  mimeType: string;
}

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filePath, mimeType }: RequestDTO): Promise<Transaction[]> {
    if (mimeType !== 'text/csv') {
      throw new AppError('File must be a CSV.', 400);
    }

    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    // Find the categories in database that matches the categories array
    const existentCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    // Get only the titles of the categories
    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    // Define the categories that will be created
    const addCategoryTitles = categories
      /**
       * Return the titles of the categories that doesn't exists on the database.
       */
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    /**
     * Create the new categories then save on the database.
     */
    const newCategories = categoriesRepository.create(
      addCategoryTitles.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    /**
     * Get the newly created categories and the ones that already exists.
     */
    const finalCategories = [...newCategories, ...existentCategories];

    const createdTransactions = transactionsRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createdTransactions);

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
