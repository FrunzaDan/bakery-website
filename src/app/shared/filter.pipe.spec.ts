import { FilterPipe } from './filter.pipe';
import { Product } from '../interfaces/product';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  const products: Product[] = [
    {
      id: 1,
      title: 'Blue Widget',
      price: 10,
      description: '',
      image: '',
      category: 'widgets',
      quantity: 1,
    },
    {
      id: 2,
      title: '  Red Gadget  ',
      price: 20,
      description: '',
      image: '',
      category: 'gadgets',
      quantity: 1,
    },
  ];

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('returns the full list when the search string is empty', () => {
    expect(pipe.transform(products, '', 'gadgets')).toBe(products);
  });

  it('returns the full list when the title is empty', () => {
    expect(pipe.transform(products, 'blue', '')).toBe(products);
  });

  it('returns the full list unchanged when the input list is falsy', () => {
    expect(pipe.transform(null as unknown as Product[], 'blue', 'widgets')).toBeNull();
  });

  it('matches case-insensitively', () => {
    expect(pipe.transform(products, 'BLUE', 'widgets')).toEqual([products[0]]);
  });

  it('matches titles regardless of surrounding whitespace', () => {
    expect(pipe.transform(products, 'red gadget', 'gadgets')).toEqual([products[1]]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(pipe.transform(products, 'nonexistent', 'widgets')).toEqual([]);
  });

  it('matches on partial titles', () => {
    expect(pipe.transform(products, 'widg', 'widgets')).toEqual([products[0]]);
  });
});
