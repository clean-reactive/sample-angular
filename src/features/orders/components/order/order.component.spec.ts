import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { Order } from './order.component';
import { makeOrderEntityId, type OrderEntityId } from '../../repository';
import { provideOrders } from '../../orders.providers';

// Exercise Order through its public input, as a real parent component would.
@Component({
  standalone: true,
  template: '<app-order [orderId]="orderId"></app-order>',
  imports: [Order],
})
class TestHostComponent {
  readonly orderId: OrderEntityId = makeOrderEntityId('order-1');
}

describe(`${Order.name}`, () => {
  // This smoke test verifies that the complete local dependency graph can be
  // composed.
  it('has all dependencies resolved', async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTanStackQuery(new QueryClient()),
        provideOrders(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});
