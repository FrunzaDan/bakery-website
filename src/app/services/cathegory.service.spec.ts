import { TestBed } from '@angular/core/testing';
import { CategoryService } from './cathegory.service';

describe('CategoryService', () => {
  let service: CategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryService);
  });

  it('starts with no selected category', () => {
    expect(service.selectedCategory()).toBeUndefined();
  });

  it('exposes the category set via setSelectedCategory', () => {
    service.setSelectedCategory('widgets');

    expect(service.selectedCategory()).toBe('widgets');
  });

  it('overwrites the previously selected category', () => {
    service.setSelectedCategory('widgets');
    service.setSelectedCategory('gadgets');

    expect(service.selectedCategory()).toBe('gadgets');
  });
});
