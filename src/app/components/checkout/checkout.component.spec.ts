import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../services/cart.service';
import { SendEmailService } from '../../services/send-email.service';
import { CheckOutForm } from '../../interfaces/check-out-form';
import { Product } from '../../interfaces/product';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceSpy: {
    cartProducts: ReturnType<typeof vi.fn>;
    totalNumberOfProducts: ReturnType<typeof vi.fn>;
    totalPrice: ReturnType<typeof vi.fn>;
  };

  const checkOutForm: CheckOutForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '123456789',
    town: 'Sibiu',
    address_line1: 'Main street',
    address_line2: '9',
    zip: '550000',
  };

  beforeEach(async () => {
    cartServiceSpy = {
      cartProducts: vi.fn().mockReturnValue([]),
      totalNumberOfProducts: vi.fn().mockReturnValue(0),
      totalPrice: vi.fn().mockReturnValue(0),
    };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceSpy },
        { provide: SendEmailService, useValue: { sendEmailJS: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is invalid when required fields are empty', () => {
    expect(component.checkOutForm.valid).toBe(false);
  });

  it('is valid once all required fields are filled in correctly', () => {
    component.checkOutForm.setValue(checkOutForm);

    expect(component.checkOutForm.valid).toBe(true);
  });

  it('rejects a phone number outside the 9-12 digit pattern', () => {
    component.checkOutForm.setValue({ ...checkOutForm, phone: '123' });

    expect(component.f.phone.errors?.['pattern']).toBeTruthy();
  });

  it('does not build an order or show the confirmation when the form is invalid', () => {
    component.onSubmit();

    expect(component.submitted()).toBe(true);
    expect(component.showConfirmCheckout()).toBe(false);
    expect(component.order()).toBeUndefined();
  });

  it('builds an order without product details when the cart is empty', () => {
    const order = component.buildOrder(checkOutForm);

    expect(order).toContain('Nume client: Jane Doe');
    expect(order).toContain('E-mail client: jane@example.com');
    expect(order).toContain('Telefon client: 123456789');
    expect(order).toContain('Localitate: Sibiu');
    expect(order).not.toContain('Număr produse:');
    expect(order).not.toContain('Preț total:');
  });

  it('includes every cart product and the computed totals in the order', () => {
    const products: Product[] = [
      {
        id: 1,
        title: 'Croissant',
        price: 5,
        description: '',
        image: '',
        category: 'pastry',
        quantity: 2,
      },
      {
        id: 2,
        title: 'Baguette',
        price: 3,
        description: '',
        image: '',
        category: 'bread',
        quantity: 1,
      },
    ];
    cartServiceSpy.cartProducts.mockReturnValue(products);
    cartServiceSpy.totalNumberOfProducts.mockReturnValue(3);
    cartServiceSpy.totalPrice.mockReturnValue(13);

    const order = component.buildOrder(checkOutForm);

    expect(order).toContain('Croissant: 5 RON x 2 buc.');
    expect(order).toContain('Baguette: 3 RON x 1 buc.');
    expect(order).toContain('Număr produse: 3 buc.');
    expect(order).toContain('Preț total: 13 RON');
  });

  it('shows the confirmation and stores the order once the form is submitted successfully', () => {
    component.checkOutForm.setValue(checkOutForm);

    component.onSubmit();

    expect(component.showConfirmCheckout()).toBe(true);
    expect(component.order()).toContain('Nume client: Jane Doe');
  });

  it('navigates back to the cart when handleBackToCartClick is invoked', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    const event = new Event('click');
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    component.handleBackToCartClick(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/cart']);
  });

  it('hides the confirmation dialog when handleCloseConfirmCheckoutClick is invoked', () => {
    component.showConfirmCheckout.set(true);
    const event = new Event('click');

    component.handleCloseConfirmCheckoutClick(event);

    expect(component.showConfirmCheckout()).toBe(false);
  });
});
