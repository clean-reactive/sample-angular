import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OrdersPresentationStore } from '../../store';

interface Presenter {
  isLocalChecked: boolean;
  isRemoteChecked: boolean;
}

interface Controller {
  onLocalChanged(): void;
  onRemoteChanged(): void;
}

@Component({
  selector: 'app-orders-resource-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="join">
      <input
        class="join-item btn btn-sm"
        type="radio"
        name="orders-resource"
        aria-label="Local"
        value="local"
        [checked]="isLocalChecked"
        (change)="onLocalChanged()"
      />
      <input
        class="join-item btn btn-sm"
        type="radio"
        name="orders-resource"
        aria-label="Remote"
        value="remote"
        [checked]="isRemoteChecked"
        (change)="onRemoteChanged()"
      />
    </div>
  `,
})
export class OrdersResourcePicker implements Presenter, Controller {
  private readonly presentationStore = inject(OrdersPresentationStore);

  // presenter
  get isLocalChecked(): boolean {
    return this.presentationStore.ordersResource() === 'local';
  }

  get isRemoteChecked(): boolean {
    return this.presentationStore.ordersResource() === 'remote';
  }

  // controller
  onLocalChanged(): void {
    this.presentationStore.setOrdersResource('local');
  }

  onRemoteChanged(): void {
    this.presentationStore.setOrdersResource('remote');
  }
}
