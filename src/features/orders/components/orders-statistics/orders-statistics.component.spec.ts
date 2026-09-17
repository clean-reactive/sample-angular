import { provideZonelessChangeDetection, signal, type WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrdersStatistics } from './orders-statistics.component';
import { OrdersSelector } from '../../selectors';
import type { OrderEntity } from '../../repository';
import { makeOrderEntities } from '../../repository/orders-repository/utils/testing';

describe(`${OrdersStatistics.name}`, () => {
  let orders: WritableSignal<OrderEntity[]>;

  beforeEach(async () => {
    orders = signal([]);

    await TestBed.configureTestingModule({
      imports: [OrdersStatistics],
      providers: [
        provideZonelessChangeDetection(),
        { provide: OrdersSelector, useValue: { result: orders.asReadonly() } },
      ],
    }).compileComponents();
  });

  it('has all dependencies resolved', () => {
    const fixture = TestBed.createComponent(OrdersStatistics);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('returns 0 when there are no orders', () => {
    const fixture = TestBed.createComponent(OrdersStatistics);

    expect(fixture.componentInstance.totalItemsQuantity).toBe(0);
  });

  it('returns the total quantity of items across all orders', () => {
    const orderEntities = makeOrderEntities(3);
    orders.set(orderEntities);
    const fixture = TestBed.createComponent(OrdersStatistics);

    const expected = orderEntities.reduce(
      (acc, entity) =>
        acc + entity.itemEntities.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
      0,
    );

    expect(fixture.componentInstance.totalItemsQuantity).toBe(expected);
  });
});
