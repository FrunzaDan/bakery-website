import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { CheckoutForm } from '../../interfaces/checkout-form';
import { CartLine } from '../../interfaces/cart-item';
import { Order } from '../../interfaces/order';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceSpy: {
    cartLines: ReturnType<typeof vi.fn>;
    totalNumberOfProducts: ReturnType<typeof vi.fn>;
    totalPrice: ReturnType<typeof vi.fn>;
    removeAllCart: ReturnType<typeof vi.fn>;
  };
  let orderServiceSpy: { placeOrder: ReturnType<typeof vi.fn> };

  const checkoutForm: CheckoutForm = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '123456789',
    town: 'Sibiu',
    street: 'Main street',
    streetNumber: '9',
    zip: '550000',
    paymentMethod: 'cash',
    acceptTerms: true,
  };

  const croissantLine: CartLine = {
    product: {
      id: 1,
      title: 'Croissant',
      price: 5,
      description: '',
      image: '',
      category: 'pastry',
    },
    quantity: 1,
  };

  const createComponent = async (): Promise<void> => {
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  const submitForm = async (): Promise<void> => {
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    sessionStorage.clear();
    cartServiceSpy = {
      cartLines: vi.fn().mockReturnValue([]),
      totalNumberOfProducts: vi.fn().mockReturnValue(0),
      totalPrice: vi.fn().mockReturnValue(0),
      removeAllCart: vi.fn(),
    };
    orderServiceSpy = { placeOrder: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceSpy },
        { provide: OrderService, useValue: orderServiceSpy },
      ],
    }).compileComponents();

    await createComponent();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('is invalid when required fields are empty, with a message per field', () => {
    expect(component.checkoutForm().invalid()).toBe(true);
    expect(component.checkoutForm.name().errors()[0].message).toBe(
      'Numele este necesar.',
    );
    expect(component.checkoutForm.zip().errors()[0].message).toBe(
      'Codul poștal este necesar.',
    );
  });

  it('is valid once all required fields are filled in correctly', () => {
    component.model.set(checkoutForm);

    expect(component.checkoutForm().valid()).toBe(true);
  });

  it('treats a whitespace-only field as missing', () => {
    component.model.set({ ...checkoutForm, street: '   ' });

    expect(component.checkoutForm.street().errors()[0].message).toBe(
      'Strada este necesară.',
    );
  });

  it('rejects a phone number outside the 9-12 digit pattern', () => {
    component.model.set({ ...checkoutForm, phone: '123' });

    expect(component.checkoutForm.phone().errors()[0].message).toBe(
      'Un număr de telefon mobil valid este necesar.',
    );
  });

  it('does not build an order when the form is invalid, and reports the error count', async () => {
    component.model.set({ ...checkoutForm, name: '', zip: '' });

    await submitForm();

    expect(component.showConfirmCheckout()).toBe(false);
    expect(component.order()).toBeNull();
    expect(component.invalidSummary()).toBe(
      'Formularul are 2 erori. Te rugăm să corectezi câmpurile marcate.',
    );
    expect(document.activeElement?.id).toBe('name');
  });

  it('shows field errors only once the field is touched', async () => {
    const nameError = (): Element | null =>
      fixture.nativeElement.querySelector('#name-error');
    expect(nameError()).toBeNull();

    await submitForm();

    expect(nameError()?.textContent).toContain('Numele este necesar.');
  });

  it('builds an order without product details when the cart is empty', () => {
    const order = component.buildOrder(checkoutForm);

    expect(order).toContain('Nume client: Jane Doe');
    expect(order).toContain('E-mail client: jane@example.com');
    expect(order).toContain('Telefon client: 123456789');
    expect(order).toContain('Localitate: Sibiu');
    expect(order).toContain('Stradă: Main street');
    expect(order).toContain('Număr: 9');
    expect(order).not.toContain('Număr produse:');
    expect(order).not.toContain('Preț total:');
  });

  it('includes every cart product and the computed totals in the order', () => {
    const cartLines: CartLine[] = [
      {
        product: {
          id: 1,
          title: 'Croissant',
          price: 5,
          description: '',
          image: '',
          category: 'pastry',
        },
        quantity: 2,
      },
      {
        product: {
          id: 2,
          title: 'Baguette',
          price: 3,
          description: '',
          image: '',
          category: 'bakeries',
        },
        quantity: 1,
      },
    ];
    cartServiceSpy.cartLines.mockReturnValue(cartLines);
    cartServiceSpy.totalNumberOfProducts.mockReturnValue(3);
    cartServiceSpy.totalPrice.mockReturnValue(13);

    const order = component.buildOrder(checkoutForm);

    expect(order).toContain('Croissant: 5,00 RON x 2 buc.');
    expect(order).toContain('Baguette: 3,00 RON x 1 buc.');
    expect(order).toContain('Număr produse: 3 buc.');
    expect(order).toContain('Preț total: 13,00 RON');
  });

  it('shows the confirmation with the order once a valid form is submitted', async () => {
    cartServiceSpy.cartLines.mockReturnValue([
      {
        product: {
          id: 1,
          title: 'Croissant',
          price: 5,
          description: '',
          image: '',
          category: 'pastry',
        },
        quantity: 1,
      },
    ]);
    component.model.set(checkoutForm);

    await submitForm();

    expect(component.showConfirmCheckout()).toBe(true);
    expect(component.order()).toContain('Nume client: Jane Doe');
    expect(component.invalidSummary()).toBeNull();
  });

  it('refuses to place an order when the cart is empty', async () => {
    component.model.set(checkoutForm);

    await submitForm();

    expect(component.showConfirmCheckout()).toBe(false);
    expect(component.invalidSummary()).toBe(
      'Coșul tău este gol. Adaugă produse înainte de a plasa comanda.',
    );
  });

  it('hides the confirmation dialog when closeConfirmCheckout is invoked', () => {
    component.order.set('Comanda: ...');

    component.closeConfirmCheckout();

    expect(component.showConfirmCheckout()).toBe(false);
  });

  it('requires the terms to be accepted', () => {
    component.model.set({ ...checkoutForm, acceptTerms: false });

    expect(component.checkoutForm.acceptTerms().errors()[0].message).toBe(
      'Pentru a plasa comanda trebuie să accepți termenii și condițiile.',
    );
  });

  it('defaults to cash on delivery and names the payment method in the order', () => {
    expect(component.model().paymentMethod).toBe('cash');

    expect(
      component.buildOrder({ ...checkoutForm, paymentMethod: 'transfer' }),
    ).toContain('Metodă de plată: Transfer bancar');
  });

  it('offers card payment only as a disabled "coming soon" option', () => {
    const card: HTMLInputElement =
      fixture.nativeElement.querySelector('#payment-card');

    expect(card.disabled).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('în curând');
  });

  describe('draft', () => {
    it('saves the form to session storage, without the terms acceptance', async () => {
      component.model.set(checkoutForm);
      await fixture.whenStable();

      const saved = JSON.parse(sessionStorage.getItem('checkoutDraft')!);
      expect(saved.name).toBe('Jane Doe');
      expect(saved.paymentMethod).toBe('cash');
      expect(saved).not.toHaveProperty('acceptTerms');
    });

    it('restores a saved draft, but asks for the terms again', async () => {
      sessionStorage.setItem(
        'checkoutDraft',
        JSON.stringify({
          ...checkoutForm,
          paymentMethod: 'transfer',
          acceptTerms: true,
        }),
      );

      await createComponent();

      expect(component.model()).toEqual({
        ...checkoutForm,
        paymentMethod: 'transfer',
        acceptTerms: false,
      });
    });

    it('ignores a corrupted draft', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      sessionStorage.setItem('checkoutDraft', '{not json');

      await createComponent();

      expect(component.model().name).toBe('');
    });
  });

  describe('placing the order', () => {
    const placedOrder = { id: 'TB-20260925-0001' } as Order;

    const openConfirmation = async (): Promise<void> => {
      cartServiceSpy.cartLines.mockReturnValue([croissantLine]);
      component.model.set({ ...checkoutForm, name: '  Jane Doe ' });
      await submitForm();
    };

    it('places the order that was confirmed, then empties the cart and opens the confirmation page', async () => {
      const navigate = vi
        .spyOn(TestBed.inject(Router), 'navigate')
        .mockResolvedValue(true);
      orderServiceSpy.placeOrder.mockResolvedValue(placedOrder);
      await openConfirmation();
      await fixture.whenStable();

      await component.confirmOrder();

      expect(orderServiceSpy.placeOrder).toHaveBeenCalledWith({
        lines: [croissantLine],
        customer: expect.objectContaining({ name: 'Jane Doe', town: 'Sibiu' }),
        paymentMethod: 'cash',
      });
      expect(cartServiceSpy.removeAllCart).toHaveBeenCalled();
      expect(sessionStorage.getItem('checkoutDraft')).toBeNull();
      expect(navigate).toHaveBeenCalledWith(['/order', 'TB-20260925-0001']);
    });

    it('keeps the dialog open with an error when the order could not be placed', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      orderServiceSpy.placeOrder.mockRejectedValue(new Error('storage full'));
      await openConfirmation();

      await component.confirmOrder();

      expect(component.showConfirmCheckout()).toBe(true);
      expect(component.placeOrderError()).toBe(
        'Comanda nu a putut fi plasată. Te rugăm să încerci din nou.',
      );
      expect(component.isPlacingOrder()).toBe(false);
      expect(cartServiceSpy.removeAllCart).not.toHaveBeenCalled();
    });

    it('places the order only once when Confirm is pressed twice', async () => {
      vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
      orderServiceSpy.placeOrder.mockResolvedValue(placedOrder);
      await openConfirmation();

      await Promise.all([component.confirmOrder(), component.confirmOrder()]);

      expect(orderServiceSpy.placeOrder).toHaveBeenCalledTimes(1);
    });

    it('cannot close the dialog while the order is being placed', async () => {
      orderServiceSpy.placeOrder.mockReturnValue(new Promise(() => undefined));
      await openConfirmation();

      void component.confirmOrder();
      component.closeConfirmCheckout();

      expect(component.isPlacingOrder()).toBe(true);
      expect(component.showConfirmCheckout()).toBe(true);
    });
  });
});
