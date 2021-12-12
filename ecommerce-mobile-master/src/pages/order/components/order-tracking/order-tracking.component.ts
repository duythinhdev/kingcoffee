import { Component, OnInit } from '@angular/core';
import { AuthService, OrderService } from '../../../../services';
import { NavController, NavParams } from 'ionic-angular';
import { TPLShipmentService } from '../../../../services/tplShipment.service';
import { StatusOrderHelper } from '../../../../utils/helper/statusOrderHelper.service';
import {
  OrderLogStatus,
  OrderProgressStep,
  OrderProgressWEStep,
  OrderStatus,
  UserRoles,
} from '../../../../app/enums';
import { isNil } from 'lodash';

@Component({
  selector: 'order-tracking',
  templateUrl: './order-tracking.html',
})
export class OrderTrackingComponent implements OnInit {
  isSubmitted = false;
  order;
  details = [];
  shipmnetSchedule = [];
  statusText = '';
  progresses = [];
  OrderStatus = OrderStatus;
  OrderProgressStep = OrderProgressStep;
  OrderProgressWEStep = OrderProgressWEStep;
  isHub = false;

  statuses = [
    {
      name: 'ordered',
      value: 'Đặt hàng thành công',
      isDone: false,
      createdAt: undefined,
    },
    {
      name: 'processing',
      value: 'Đang xử lý đơn hàng',
      isDone: false,
      createdAt: undefined,
    },
    {
      name: 'handedOver',
      value: 'Đóng gói & Bàn giao vận chuyển',
      isDone: false,
      createdAt: undefined,
    },
    {
      name: 'shipping',
      value: 'Đang vận chuyển',
      isDone: false,
      createdAt: undefined,
    },
    {
      name: 'successDelivered',
      value: 'Giao hàng thành công',
      isDone: false,
      createdAt: undefined,
    },
  ];

  statusOrder = StatusOrderHelper.ALLSTATUSORDER;

  constructor(
    public nav: NavController,
    public navParams: NavParams,
    public tplShipmentService: TPLShipmentService,
    private orderService: OrderService,
    private authService: AuthService
  ) {
    this.order = this.navParams.data ? this.navParams.data.order : undefined;

    const role = authService.getRoleId();
    if (role === '3') {
      this.statuses.splice(1, 0, {
        name: 'confirmed',
        value: 'TNI tiếp nhận',
        isDone: false,
        createdAt: undefined,
      });
    }
  }

  async ngOnInit() {
    if (this.authService.isLoggedin()) {
      const currentUser = await this.authService.getCurrentUser();
      if (
        currentUser &&
        currentUser.userRoles.find((x) => x.Role === UserRoles.HUB)
      ) {
        this.isHub = true;
      }
    }

    if (!isNil(this.order)) {
      await this.orderService
        .getOrderLog({
          orderId: this.order._id,
          eventType: OrderLogStatus.OrderStatus,
        })
        .then((resp) => {
          if (resp) {
            resp.data.map((x) => {
              const find = this.statuses.find(
                (status) => status.name === x.newData
              );
              if (find) {
                find.createdAt = x.createdAt;
              }

              const findIndex = this.statuses.findIndex(
                (status) => status.name === x.newData
              );
              if (findIndex > -1) {
                this.statuses.forEach((status, index) => {
                  if (index <= findIndex) {
                    status.isDone = true;
                  }
                });
              }
            });
          }
        });
    }
  }
}
