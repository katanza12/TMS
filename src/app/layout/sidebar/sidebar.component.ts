import { Component, type OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Avatar } from 'primeng/avatar';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Dialog } from 'primeng/dialog';

import { DataComponent } from '../data/data.component';

import { SessioneService } from '../../services/sessione.service';
import { UtilityService } from '../../services/utility.service';
import { TaskService } from '../../services/task.service';
import { DataService } from '../../services/data.service';

import { UserModel } from '../../models/user.model';
import { DataModel, DataEnum } from '../../models/data.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Avatar,
    Menu,
    Dialog,
    DataComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit {
  @ViewChild('menu') menu!: Menu;

  private sessioneService = inject(SessioneService);
  private utilityService = inject(UtilityService);
  private taskService = inject(TaskService);
  private dataService = inject(DataService);

  userLogged?: UserModel;
  avatarLabel?: string;
  avatarBackground?: string;

  menuItems?: MenuItem[];

  popupDataTitle?: string;
  showPopupData: boolean = false;

  ngOnInit(): void {
    this.userLogged = this.sessioneService.getUserLogged();
    if (this.userLogged) {
      this.avatarBackground = this.userLogged.background;
      this.avatarLabel = this.utilityService.getAvatarLabel(this.userLogged);
    }

    // Menu
    this.menuItems = [
      {
        label: "I miei task",
        items: [
          { icon: "fas fa-list-check", label: "Tutti", command: () => this.taskService.getUserTasks(this.userLogged!.id) },
        ]
      },
      {
        label: "Categorie",
        icon: "fas fa-icons",
        items: [],
        id: DataEnum.Category.toString()
      },
      {
        label: "Stati",
        icon: "fas fa-spinner",
        items: [],
        id: DataEnum.Status.toString()

      }
    ];

    // Task status
    this.dataService.registerStatusList().subscribe({
      next: (statusList: DataModel[]) => {
        this.sessioneService.setStatusList(statusList);
        const i = this.menuItems?.findIndex(item => item.label == "Stati");
        if (!i || i < 0) return;
        this.menuItems![i].items = statusList.map(status => {
          return {
            label: status.description,
            icon: status.icon,
            command: () => this.taskService.getUserTaskByStatus(this.userLogged!.id, status.id)
          }
        });
        this.menu.hide();
      }
    });

    this.dataService.getAllStatus();

    // Categories
    this.dataService.registerCategoryList().subscribe({
      next: (categoryList: DataModel[]) => {
        this.sessioneService.setCategoryList(categoryList);
        const i = this.menuItems?.findIndex(item => item.label == "Categorie");
        if (!i || i < 0) return;
        this.menuItems![i].items = categoryList.map(category => {
          return {
            label: category.description,
            icon: category.icon,
            command: () => this.taskService.getUserTaskByCategory(this.userLogged!.id, category.id)
          }
        });
        this.menu.hide();
      }
    });

    this.dataService.getAllCategories();
  }

  openData(data: DataEnum) {
    if (data == DataEnum.Category) {
      this.popupDataTitle = "Categorie";
    }
    else if (data == DataEnum.Status) {
      this.popupDataTitle = "Stati";
    }
    this.dataService.setDataLoad(data);
    this.showPopupData = true;
  }

}
